import ExpoModulesCore
import StoreKit

public final class FungoSubscriptionModule: Module {
  private static let annualID = "it.fungoitalia.premium.annual"
  private var updates: Task<Void, Never>?
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
    AsyncFunction("purchase") { () async throws -> [String: Any] in try await self.buy() }
    AsyncFunction("restore") { () async throws -> [String: Any] in try await self.restorePurchases() }
  }
  private func failure(_ code: Int, _ message: String) -> NSError {
    NSError(domain: "FungoSubscription", code: code, userInfo: [NSLocalizedDescriptionKey: message])
  }
  @MainActor private func annualProduct() async throws -> Product {
    guard let item = try await Product.products(for: [Self.annualID]).first,
          item.id == Self.annualID, item.type == .autoRenewable,
          let period = item.subscription?.subscriptionPeriod,
          period.unit == .year, period.value == 1 else {
      throw failure(1, "Abbonamento annuale non disponibile su App Store. Riprova più tardi.")
    }
    return item
  }
  @MainActor private func productDetails() async throws -> [String: Any] {
    let item = try await annualProduct()
    return ["id": item.id, "displayName": item.displayName,
            "description": item.description, "localizedPrice": item.displayPrice,
            "subscriptionPeriod": ["unit": "year", "value": 1]]
  }
  @MainActor private func entitlement() async -> [String: Any] { await Self.verifiedEntitlement() }
  @MainActor public static func verifiedEntitlement() async -> [String: Any] {
    let now = Date()
    var selected: Transaction?
    for await result in Transaction.currentEntitlements {
      guard case .verified(let transaction) = result,
            transaction.productID == Self.annualID,
            transaction.productType == .autoRenewable,
            transaction.revocationDate == nil, !transaction.isUpgraded,
            let expiry = transaction.expirationDate, expiry > now else { continue }
      if selected == nil || expiry > (selected?.expirationDate ?? .distantPast) { selected = transaction }
    }
    let iso = ISO8601DateFormatter()
    var expires: Any = NSNull()
    if let expiry = selected?.expirationDate { expires = iso.string(from: expiry) }
    return ["active": selected != nil, "productId": Self.annualID,
            "expiresAt": expires, "checkedAt": iso.string(from: now)]
  }
  @MainActor private func emitCurrent() async { sendEvent("entitlementChanged", await entitlement()) }
  @MainActor private func buy() async throws -> [String: Any] {
    guard !busy else { throw failure(2, "Un'operazione App Store è già in corso.") }
    busy = true
    defer { busy = false }
    let item = try await annualProduct()
    switch try await item.purchase() {
    case .success(let verification):
      guard case .verified(let transaction) = verification,
            transaction.productID == Self.annualID, transaction.productType == .autoRenewable else {
        throw failure(3, "L'acquisto non è stato verificato da App Store.")
      }
      let state = await entitlement()
      sendEvent("entitlementChanged", state)
      await transaction.finish()
      return ["status": "purchased", "entitlement": state]
    case .pending: return ["status": "pending", "entitlement": await entitlement()]
    case .userCancelled: return ["status": "cancelled", "entitlement": await entitlement()]
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
