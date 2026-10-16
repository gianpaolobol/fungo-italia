import ExpoModulesCore
import StoreKit
import OSLog
import UIKit

public final class FungoSubscriptionModule: Module {
  private static let annualID = "it.fungoitalia.premium.annual"
  private var updates: Task<Void, Never>?
  private let logger = Logger(subsystem: "it.fungoitalia.subscription", category: "StoreKit")
  @MainActor private var cachedAnnual: Product?
  @MainActor private var busy = false
  public func definition() -> ModuleDefinition {
    Name("FungoSubscription")
    Events("entitlementChanged")
    OnCreate {
      self.updates?.cancel()
      self.updates = Task { [weak self] in
        for await result in Transaction.updates {
          if Task.isCancelled { return }
          guard case .verified(let transaction) = result,
                transaction.productID == Self.annualID else { continue }
          guard let self else { return }
          await self.emitCurrent()
          await transaction.finish()
        }
      }
    }
    OnDestroy { self.updates?.cancel(); self.updates = nil }
    AsyncFunction("product") { () async throws -> [String: Any] in try await self.productDetails() }
    AsyncFunction("currentEntitlement") { () async -> [String: Any] in await self.entitlement() }
    AsyncFunction("purchase") { () async throws -> [String: Any] in
      self.logger.notice("Bridge purchase entered")
      return try await self.buy()
    }
    AsyncFunction("restore") { () async throws -> [String: Any] in try await self.restorePurchases() }
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
    // This app has one subscription product. The latest transaction may be
    // expired or revoked, so every access condition remains mandatory.
    let diagnostic = Logger(subsystem: "it.fungoitalia.subscription", category: "StoreKit")
    diagnostic.notice("Verifier Transaction.latest entered")
    let latest = await Transaction.latest(for: Self.annualID)
    diagnostic.notice("Verifier Transaction.latest returned present=\(latest != nil, privacy: .public)")
    let now = Date()
    var selected: Transaction?
    if let latest, case .verified(let transaction) = latest,
       transaction.productID == Self.annualID,
       transaction.productType == .autoRenewable,
       transaction.revocationDate == nil, !transaction.isUpgraded,
       let expiry = transaction.expirationDate, expiry > now {
      selected = transaction
    }
    let iso = ISO8601DateFormatter()
    var expires: Any = NSNull()
    if let expiry = selected?.expirationDate { expires = iso.string(from: expiry) }
    return ["active": selected != nil, "productId": Self.annualID,
            "expiresAt": expires, "checkedAt": iso.string(from: now)]
  }
  @MainActor private func emitCurrent() async { sendEvent("entitlementChanged", await entitlement()) }
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
