import ExpoModulesCore
import StoreKit
import OSLog
import CoreFoundation
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
      self.logger.notice("Subscription module created")
      #if targetEnvironment(simulator)
      // Diagnostic launches isolate StoreKit's observer from the bridge lookup.
      // These switches cannot affect a device or a distributed TestFlight build,
      // never synthesize an entitlement, and must not be used for release evidence.
      let diagnostic = ProcessInfo.processInfo.environment["FUNGO_STOREKIT_DIAGNOSTIC"]
      if diagnostic == "direct-snapshot" {
        Task { @MainActor [weak self] in
          self?.logger.notice("Diagnostic direct snapshot entered")
          let state = await Self.verifiedEntitlement()
          let active = state["active"] as? Bool ?? false
          self?.logger.notice("Diagnostic direct snapshot returned active=\(active, privacy: .public)")
        }
      }
      if diagnostic == "without-updates" {
        self.logger.notice("Diagnostic transaction updates disabled")
        return
      }
      #endif
      self.updates?.cancel()
      self.updates = Task { [weak self] in
        self?.logger.notice("Transaction updates listener entered")
        for await result in Transaction.updates {
          self?.logger.notice("Transaction updates listener received a result")
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
    #if targetEnvironment(simulator)
    // Observation only: the native UI regression waits for an actual verified
    // annual entitlement. No synthetic access and no effect in device builds.
    if active, let name = ProcessInfo.processInfo.environment["FUNGO_STOREKIT_VERIFIED_NOTIFICATION"],
       name.hasPrefix("it.fungoitalia.test.entitlement."), name.count < 128 {
      CFNotificationCenterPostNotification(CFNotificationCenterGetDarwinNotifyCenter(), CFNotificationName(rawValue: name as CFString), nil, nil, true)
    }
    #endif
    return state
  }
  @MainActor public static func verifiedEntitlement() async -> [String: Any] {
    // Only verified, currently entitled Apple transactions may unlock access.
    // Avoid Transaction.latest(for:) during initial simulator startup: on iPhone
    // its request can stall before the first account state is returned.
    let now = Date()
    var selected: Transaction?
    // Keep the asynchronous iterator boundaries visible: entering the verifier
    // alone cannot distinguish sequence creation from a stalled first next().
    // No transaction identifiers, receipts, or account data are logged.
    let trace = Logger(subsystem: "it.fungoitalia.subscription", category: "StoreKit")
    let lookup = UUID().uuidString
    trace.notice("Entitlement \(lookup, privacy: .public) sequence requested main=\(Thread.isMainThread, privacy: .public)")
    let sequence = Transaction.currentEntitlements
    trace.notice("Entitlement \(lookup, privacy: .public) sequence created")
    var iterator = sequence.makeAsyncIterator()
    trace.notice("Entitlement \(lookup, privacy: .public) iterator created")
    var resultCount = 0
    while true {
      trace.notice("Entitlement \(lookup, privacy: .public) next requested index=\(resultCount, privacy: .public)")
      guard let result = await iterator.next() else {
        trace.notice("Entitlement \(lookup, privacy: .public) sequence ended count=\(resultCount, privacy: .public)")
        break
      }
      resultCount += 1
      trace.notice("Entitlement \(lookup, privacy: .public) next returned index=\(resultCount, privacy: .public)")
      guard case .verified(let transaction) = result,
            transaction.productID == Self.annualID,
            transaction.productType == .autoRenewable,
            transaction.revocationDate == nil,
            !transaction.isUpgraded,
            let expiry = transaction.expirationDate, expiry > now else { continue }
      if selected == nil || transaction.expirationDate! > selected!.expirationDate! {
        selected = transaction
      }
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
