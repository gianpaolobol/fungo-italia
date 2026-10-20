import XCTest
import StoreKit
import StoreKitTest
internal import FungoSubscription

@available(iOS 17.0, *)
final class AnnualStoreKitTests: XCTestCase {
  let productID = "it.fungoitalia.premium.annual"
  @MainActor func waitForActive(_ expected: Bool, file: StaticString = #filePath, line: UInt = #line) async throws {
    var last = false
    for _ in 0..<100 {
      let state = await FungoSubscriptionModule.verifiedEntitlement()
      last = state["active"] as? Bool ?? false
      if last == expected { return }
      try await Task.sleep(nanoseconds: 100_000_000)
    }
    XCTFail("StoreKit entitlement active=\(last), expected \(expected)", file: file, line: line)
  }
  @MainActor func testVerifiedPurchaseRefundAndExpiry() async throws {
    let url = try XCTUnwrap(Bundle(for: Self.self).url(forResource: "Annual", withExtension: "storekit"))
    let session = try SKTestSession(contentsOf: url)
    print("ANNUAL_NATIVE Session created")
    session.resetToDefaultState()
    session.disableDialogs = true
    session.timeRate = .realTime
    session.locale = Locale(identifier: "it_IT")
    session.storefront = "ITA"
    guard session.storefront == "ITA" else { XCTFail("Local StoreKit session unavailable"); return }
    session.clearTransactions()
    defer { session.clearTransactions(); session.resetToDefaultState() }
    print("ANNUAL_NATIVE Local fixture configured")
    try await waitForActive(false)
    print("ANNUAL_NATIVE Initial access is inactive")
    let products = try await Product.products(for: [productID])
    let product = try XCTUnwrap(products.first)
    XCTAssertEqual(product.type, .autoRenewable)
    XCTAssertEqual(product.subscription?.subscriptionPeriod.unit, .year)
    XCTAssertEqual(product.subscription?.subscriptionPeriod.value, 1)
    XCTAssertFalse(product.displayPrice.isEmpty)
    print("ANNUAL_NATIVE Buying first annual period")
    let purchase = try await session.buyProduct(identifier: productID, options: [])
    XCTAssertEqual(purchase.productID, productID)
    print("ANNUAL_NATIVE First purchase returned")
    try await waitForActive(true)
    print("ANNUAL_NATIVE First purchase verified")
    let initial = await FungoSubscriptionModule.verifiedEntitlement()
    XCTAssertNotNil(initial["expiresAt"] as? String)
    guard let transaction = session.allTransactions().last(where: { $0.productIdentifier == productID }) else {
      XCTFail("Missing StoreKit test transaction"); return
    }
    print("ANNUAL_NATIVE Refunding annual transaction")
    try session.refundTransaction(identifier: transaction.identifier)
    try await waitForActive(false)
    print("ANNUAL_NATIVE Refunded access is inactive")
    session.clearTransactions()
    print("ANNUAL_NATIVE Buying a new annual period")
    _ = try await session.buyProduct(identifier: productID, options: [])
    try await waitForActive(true)
    print("ANNUAL_NATIVE Second purchase verified; expiring")
    try session.expireSubscription(productIdentifier: productID)
    try await waitForActive(false)
    print("ANNUAL_NATIVE Expired access is inactive")
  }
  @MainActor func testBaseSurvivesAnnualExpiryAndRefundRevokesBase() async throws {
    let url = try XCTUnwrap(Bundle(for: Self.self).url(forResource: "Annual", withExtension: "storekit"))
    let session = try SKTestSession(contentsOf: url)
    session.resetToDefaultState(); session.disableDialogs = true; session.timeRate = .realTime
    session.locale = Locale(identifier: "it_IT"); session.storefront = "ITA"; session.clearTransactions()
    defer { session.clearTransactions(); session.resetToDefaultState() }
    let baseID = "it.fungoitalia.base.lifetime"
    let products = try await Product.products(for: [baseID])
    XCTAssertEqual(try XCTUnwrap(products.first).type, .nonConsumable)
    _ = try await session.buyProduct(identifier: baseID, options: [])
    var state = await FungoSubscriptionModule.verifiedAccess()
    XCTAssertEqual(state["baseOwned"] as? Bool, true)
    XCTAssertEqual(state["annualActive"] as? Bool, false)
    _ = try await session.buyProduct(identifier: productID, options: [])
    try await waitForActive(true)
    try session.expireSubscription(productIdentifier: productID)
    try await waitForActive(false)
    state = await FungoSubscriptionModule.verifiedAccess()
    XCTAssertEqual(state["baseOwned"] as? Bool, true)
    let transaction = try XCTUnwrap(session.allTransactions().last(where: { $0.productIdentifier == baseID }))
    try session.refundTransaction(identifier: transaction.identifier)
    for _ in 0..<100 {
      state = await FungoSubscriptionModule.verifiedAccess()
      if state["baseOwned"] as? Bool == false { break }
      try await Task.sleep(nanoseconds: 100_000_000)
    }
    XCTAssertEqual(state["baseOwned"] as? Bool, false)
  }
}
