import ExpoModulesCore
import StoreKit
import OSLog
import UIKit

public final class FungoSubscriptionModule: Module {
  private static let baseID = "it.fungoitalia.base.lifetime"
  private static let annualID = "it.fungoitalia.premium.annual"
  private var updates: Task<Void, Never>?
  private let logger = Logger(subsystem: "it.fungoitalia.subscription", category: "StoreKit")
  @MainActor private var cachedAnnual: Product?
  @MainActor private var busy = false
  public func definition() -> ModuleDefinition {
    Name("FungoSubscription")
    Events("entitlementChanged", "accessChanged")
    OnCreate {
      self.updates?.cancel()
      self.updates = Task { [weak self] in
        for await result in Transaction.updates {
          if Task.isCancelled { return }
          guard case .verified(let transaction) = result,
                [Self.annualID, Self.baseID].contains(transaction.productID) else { continue }
          guard let self else { return }
          await self.emitCurrent()
          await transaction.finish()
        }
      }
    }
    OnDestroy { self.updates?.cancel(); self.updates = nil }
    AsyncFunction("baseProduct") { () async throws -> [String: Any] in
      let item = try await self.baseProduct()
      return ["id": item.id, "displayName": item.displayName, "localizedPrice": item.displayPrice]
    }
    AsyncFunction("currentAccess") { () async -> [String: Any] in await self.allAccess() }
    AsyncFunction("purchaseBase") { () async throws -> [String: Any] in try await self.buyBase() }
    AsyncFunction("restoreAccess") { () async throws -> [String: Any] in
      try await AppStore.sync()
      return await self.allAccess()
    }
    AsyncFunction("product") { () async throws -> [String: Any] in try await self.productDetails() }
    AsyncFunction("currentEntitlement") { () async -> [String: Any] in await self.entitlement() }
    AsyncFunction("purchase") { () async throws -> [String: Any] in
      self.logger.notice("Bridge purchase entered")
      return try await self.buy()
    }
    AsyncFunction("restore") { () async throws -> [String: Any] in try await self.restorePurchases() }
  }
  @MainActor private func baseProduct() async throws -> Product {
    guard let item = try await Product.products(for: [Self.baseID]).first,
      item.id == Self.baseID, item.type == .nonConsumable else {
      throw failure(6, "Base permanente non disponibile su App Store.")
    }
    return item
  }
  @MainActor private func allAccess() async -> [String: Any] { await Self.verifiedAccess() }
  @MainActor public static func verifiedAccess() async -> [String: Any] {
    let now = Date(), iso = ISO8601DateFormatter()
    var base = false
    var expiry: Date?
    for await result in Transaction.currentEntitlements {
      guard case .verified(let transaction) = result, transaction.revocationDate == nil else { continue }
      if transaction.productID == Self.baseID && transaction.productType == .nonConsumable { base = true }
      if transaction.productID == Self.annualID && transaction.productType == .autoRenewable,
        !transaction.isUpgraded, let end = transaction.expirationDate, end > now,
        expiry == nil || end > expiry! { expiry = end }
    }
    var expiration: Any = NSNull()
    if let expiry { expiration = iso.string(from: expiry) }
    return ["baseOwned": base, "annualActive": expiry != nil,
      "annualExpiresAt": expiration, "checkedAt": iso.string(from: now)]
  }
  @MainActor private func buyBase() async throws -> [String: Any] {
    guard !busy else { throw failure(2, "Un'operazione App Store è già in corso.") }
    busy = true
    defer { busy = false }
    let item = try await baseProduct()
    let result: Product.PurchaseResult
    if #available(iOS 18.2, *) {
      guard let presenter = appContext?.utilities?.currentViewController(), presenter.viewIfLoaded?.window != nil else {
        throw failure(5, "Schermata di pagamento non disponibile.")
      }
      result = try await item.purchase(confirmIn: presenter)
    } else { result = try await item.purchase() }
    switch result {
    case .success(let verification):
      guard case .verified(let transaction) = verification,
        transaction.productID == Self.baseID, transaction.productType == .nonConsumable,
        transaction.revocationDate == nil else { throw failure(3, "Acquisto Base non verificato.") }
      let state = await allAccess()
      sendEvent("accessChanged", state)
      await transaction.finish()
      return ["status": "purchased", "access": state]
    case .pending: return ["status": "pending", "access": await allAccess()]
    case .userCancelled: return ["status": "cancelled", "access": await allAccess()]
    @unknown default: throw failure(4, "Risposta App Store non riconosciuta.")
    }
  }
  private func failure(_ code: Int, _ message: String) -> NSError {
    NSError(domain: "FungoSubscription", code: code, userInfo: [NSLocalizedDescriptionKey: message])
  }
  @MainActor private func annualProduct(useCached: Bool = false) async throws -> Product {
    if useCached, let cachedAnnual { logger.notice("Annual product cache hit"); return cachedAnnual }
    logger.notice("Annual product lookup entered")
    guard let item = try await Product.products(for: [Self.annualID]).first,
          item.id == Self.annualID, item.type == .autoRenewable,
          let period = item.subscription?.subscriptionPeriod,
          period.unit == .year, period.value == 1 else {
      throw failure(1, "Abbonamento annuale non disponibile su App Store. Riprova più tardi.")
    }
    logger.notice("Annual product lookup returned")
    cachedAnnual = item
    return item
  }
  @MainActor private func productDetails() async throws -> [String: Any] {
    let item = try await annualProduct()
    return ["id": item.id, "displayName": item.displayName,
            "description": item.description, "localizedPrice": item.displayPrice,
            "subscriptionPeriod": ["unit": "year", "value": 1]]
  }
  @MainActor private func entitlement() async -> [String: Any] {
    logger.notice("Current entitlement lookup entered")
    let state = await Self.verifiedEntitlement()
    let active = state["active"] as? Bool ?? false
    logger.notice("Current entitlement lookup returned active=\(active, privacy: .public)")
    return state
  }
  @MainActor public static func verifiedEntitlement() async -> [String: Any] {
    let state = await verifiedAccess()
    return ["active": state["annualActive"] ?? false, "productId": Self.annualID,
      "expiresAt": state["annualExpiresAt"] ?? NSNull(), "checkedAt": state["checkedAt"] ?? ""]
  }
  @MainActor private func emitCurrent() async { sendEvent("entitlementChanged", await entitlement()); sendEvent("accessChanged", await allAccess()) }
  @MainActor private func buy() async throws -> [String: Any] {
    logger.notice("Purchase entered")
    guard !busy else { throw failure(2, "Un'operazione App Store è già in corso.") }
    busy = true
    defer { busy = false }
    let item = try await annualProduct(useCached: true)
    logger.notice("Purchase product ready")
    let result: Product.PurchaseResult
    do {
      if #available(iOS 18.2, *) {
        guard let presenter = appContext?.utilities?.currentViewController(), presenter.viewIfLoaded?.window != nil else {
          throw failure(5, "La schermata di pagamento non è disponibile. Torna all’abbonamento e riprova.")
        }
        logger.notice("Purchase confirmation context ready")
        result = try await item.purchase(confirmIn: presenter)
      } else {
        result = try await item.purchase()
      }
    }
    catch { logger.error("Purchase threw an App Store error"); throw error }
    logger.notice("Purchase returned")
    switch result {
    case .success(let verification):
      guard case .verified(let transaction) = verification,
            transaction.productID == Self.annualID, transaction.productType == .autoRenewable else {
        logger.error("Purchase verification failed")
        throw failure(3, "L'acquisto non è stato verificato da App Store.")
      }
      logger.notice("Purchase verified; checking current entitlement")
      let state = await entitlement()
      logger.notice("Purchase entitlement read")
      sendEvent("entitlementChanged", state)
      await transaction.finish()
      return ["status": "purchased", "entitlement": state]
    case .pending: logger.notice("Purchase pending"); return ["status": "pending", "entitlement": await entitlement()]
    case .userCancelled: logger.notice("Purchase cancelled"); return ["status": "cancelled", "entitlement": await entitlement()]
    @unknown default: throw failure(4, "Risposta App Store non riconosciuta. Ripristina gli acquisti per verificare l'accesso.")
    }
  }
  @MainActor private func restorePurchases() async throws -> [String: Any] {
    guard !busy else { throw failure(2, "Un'operazione App Store è già in corso.") }
    busy = true
    defer { busy = false }
    try await AppStore.sync()
    let state = await entitlement()
    sendEvent("entitlementChanged", state)
    return state
  }
}
