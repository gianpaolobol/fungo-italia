import XCTest
import StoreKit
import StoreKitTest
internal import FungoSubscription

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
    session.resetToDefaultState()
    session.disableDialogs = true
    session.timeRate = .realTime
    session.locale = Locale(identifier: "it_IT")
    session.storefront = "ITA"
    XCTAssertEqual(session.storefront, "ITA", "Local StoreKit session unavailable")
    session.clearTransactions()
    defer { session.clearTransactions(); session.resetToDefaultState() }
    try await waitForActive(false)
    let products = try await Product.products(for: [productID])
    let product = try XCTUnwrap(products.first)
    XCTAssertEqual(product.type, .autoRenewable)
    XCTAssertEqual(product.subscription?.subscriptionPeriod.unit, .year)
    XCTAssertEqual(product.subscription?.subscriptionPeriod.value, 1)
    XCTAssertFalse(product.displayPrice.isEmpty)
    let purchase = try await session.buyProduct(identifier: productID, options: [])
    XCTAssertEqual(purchase.productID, productID)
    try await waitForActive(true)
    let initial = await FungoSubscriptionModule.verifiedEntitlement()
    XCTAssertNotNil(initial["expiresAt"] as? String)
    guard let transaction = session.allTransactions().last(where: { $0.productIdentifier == productID }) else {
      XCTFail("Missing StoreKit test transaction"); return
    }
    try session.refundTransaction(identifier: transaction.identifier)
    try await waitForActive(false)
    session.clearTransactions()
    _ = try await session.buyProduct(identifier: productID, options: [])
    try await waitForActive(true)
    try session.expireSubscription(productIdentifier: productID)
    try await waitForActive(false)
  }
}
