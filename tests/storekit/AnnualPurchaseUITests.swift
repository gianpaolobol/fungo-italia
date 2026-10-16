import XCTest
import StoreKit
import StoreKitTest

final class AnnualPurchaseUITests: XCTestCase {
  let productID = "it.fungoitalia.premium.annual"
  func element(_ app: XCUIApplication, _ label: String) -> XCUIElement {
    app.descendants(matching: .any).matching(NSPredicate(format: "label == %@", label)).firstMatch
  }
  @MainActor func waitFor(_ item: XCUIElement, timeout: TimeInterval = 120) async -> Bool {
    let expectation = XCTNSPredicateExpectation(predicate: NSPredicate(format: "exists == true"), object: item)
    return await XCTWaiter.fulfillment(of: [expectation], timeout: timeout) == .completed
  }
  @MainActor func require(_ item: XCUIElement, timeout: TimeInterval = 120, file: StaticString = #filePath, line: UInt = #line) async {
    let exists = await waitFor(item, timeout: timeout)
    if !exists {
      let app = XCUIApplication(bundleIdentifier: "it.fungoitalia.app")
      print("REQUIRED_CONTROL_MISSING " + item.description)
      print("REQUIRED_APP_TREE " + app.debugDescription)
      try? capture(app, "failure-required-control")
    }
    XCTAssertTrue(exists, "Required app control unavailable", file: file, line: line)
  }
  @MainActor func tap(_ app: XCUIApplication, _ label: String, file: StaticString = #filePath, line: UInt = #line) async {
    let item = ["Studio", "Aree", "Esame", "Abbonamento"].contains(label)
      ? app.descendants(matching: .any).matching(identifier: "tab-" + label.lowercased()).firstMatch
      : element(app, label)
    await require(item, timeout: 60, file: file, line: line)
    item.tap()
  }
  @MainActor func verificationCompleted(_ item: XCUIElement) async -> Bool {
    let predicate = NSPredicate { object, _ in
      guard let element = object as? XCUIElement else { return false }
      return element.exists && element.isEnabled
    }
    return await XCTWaiter.fulfillment(of: [XCTNSPredicateExpectation(predicate: predicate, object: item)], timeout: 120) == .completed
  }
  // Probe the local transaction service in the XCTest runner, separately from
  // the Expo app, only after an app lookup has stalled. It must not warm the
  // service before the cold-launch assertion or synthesize an entitlement.
  @MainActor func requireLocalTransactionService() async throws {
    let completed = XCTestExpectation(description: "Local StoreKit diagnostic transaction lookup")
    let lookup = Task { @MainActor in
      print("STOREKIT_PREFLIGHT Latest lookup entered in UI runner")
      let latest = await Transaction.latest(for: productID)
      XCTAssertNil(latest, "The cleared local fixture must have no previous annual transaction")
      print("STOREKIT_PREFLIGHT Latest lookup returned in UI runner")
      completed.fulfill()
    }
    defer { lookup.cancel() }
    let result = await XCTWaiter.fulfillment(of: [completed], timeout: 30)
    guard result == .completed else {
      XCTFail("Local StoreKit lookup also stalled in the UI runner after the app lookup stalled")
      throw NSError(domain: "StoreKitPreflight", code: 1)
    }
  }
  @MainActor func revealPurchase(_ app: XCUIApplication, _ item: XCUIElement) {
    for _ in 0..<5 {
      if item.isHittable { return }
      app.swipeUp()
    }
  }
  @MainActor func diagnose(_ app: XCUIApplication, _ session: SKTestSession) {
    let purchase = app.descendants(matching: .any).matching(NSPredicate(format: "label BEGINSWITH %@", "Abbonati · ")).firstMatch
    print("STOREKIT_PURCHASE_CONTROL exists=\(purchase.exists) enabled=\(purchase.isEnabled) hittable=\(purchase.isHittable)")
    print("PURCHASE_VISIBLE_TEXT " + String(describing: app.staticTexts.allElementsBoundByIndex.map { $0.label }))
    print("PURCHASE_BUTTONS " + String(describing: app.buttons.allElementsBoundByIndex.map { $0.label }))
    print("STOREKIT_TEST_PRODUCTS " + String(describing: session.allTransactions().map { $0.productIdentifier }))
    let springboard = XCUIApplication(bundleIdentifier: "com.apple.springboard")
    print("PURCHASE_SYSTEM_TEXT " + String(describing: springboard.staticTexts.allElementsBoundByIndex.map { $0.label }))
    try? capture(app, "failure-purchase")
  }
  func capture(_ app: XCUIApplication, _ name: String) throws {
    let folder = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0].appendingPathComponent("store-captures", isDirectory: true)
    try FileManager.default.createDirectory(at: folder, withIntermediateDirectories: true)
    try app.screenshot().pngRepresentation.write(to: folder.appendingPathComponent(name + ".png"), options: .atomic)
    let attachment = XCTAttachment(screenshot: app.screenshot())
    attachment.name = name; attachment.lifetime = .keepAlways; add(attachment)
  }
  @MainActor func waitForGate(_ app: XCUIApplication) async {
    await require(element(app, "Fungo Italia completo"))
    XCTAssertFalse(element(app, "Inizia 15 casi").exists)
  }
  @MainActor func testAnnualPurchaseRestoreAccessRefundAndExpiry() async throws {
    continueAfterFailure = false
    let url = try XCTUnwrap(Bundle(for: Self.self).url(forResource: "Annual", withExtension: "storekit"))
    let session = try SKTestSession(contentsOf: url)
    session.resetToDefaultState(); session.disableDialogs = true; session.timeRate = .realTime
    session.locale = Locale(identifier: "it_IT"); session.storefront = "ITA"; session.clearTransactions()
    guard session.storefront == "ITA" else { XCTFail("Local StoreKit session is not active; never fall back to the production store"); return }
    let app = XCUIApplication(bundleIdentifier: "it.fungoitalia.app")
    defer { app.terminate(); session.clearTransactions(); session.resetToDefaultState() }
    app.launch()
    await tap(app, "Abbonamento")
    let subscribe = app.descendants(matching: .any).matching(NSPredicate(format: "label BEGINSWITH %@", "Abbonati · ")).firstMatch
    await require(subscribe, timeout: 60)
    let ready = await verificationCompleted(subscribe)
    if !ready {
      diagnose(app, session)
      try await requireLocalTransactionService()
    }
    XCTAssertTrue(ready, "StoreKit entitlement verification must complete before purchase")
    let purchaseButton = app.descendants(matching: .any).matching(NSPredicate(format: "label BEGINSWITH %@", "Abbonati · ")).firstMatch
    XCTAssertTrue(subscribe.label.contains("/ anno"))
    XCTAssertTrue(subscribe.label.contains("9,99") && subscribe.label.contains("€"), "Italian local StoreKit fixture must match the verified Apple Italy price")
    try capture(app, "03-esame")
    revealPurchase(app, purchaseButton)
    XCTAssertTrue(purchaseButton.isHittable, "Verified purchase button must be visible after scrolling")
    purchaseButton.tap()
    let activated = await waitFor(element(app, "Abbonamento attivo"))
    if !activated { diagnose(app, session) }
    XCTAssertTrue(activated)
    print("ANNUAL_UI Purchase exposes verified access")
    // Reopening reads verified StoreKit state, not a persisted premium flag.
    app.terminate(); app.launch()
    await tap(app, "Esame")
    await require(element(app, "Inizia 15 casi"))
    print("ANNUAL_UI Reopened app restores access")
    await tap(app, "Studio")
    let search = element(app, "Cerca nome scientifico, comune o sinonimo")
    await require(search)
    search.tap(); search.typeText("Amanita caesarea")
    await tap(app, "Apri Amanita caesarea")
    try capture(app, "01-studio")
    await tap(app, "Torna alle schede")
    await tap(app, "Aree"); try capture(app, "02-aree")
    await tap(app, "Esame")
    await require(element(app, "Inizia 15 casi"))
    let transaction = try XCTUnwrap(session.allTransactions().last(where: { $0.productIdentifier == productID }))
    try session.refundTransaction(identifier: transaction.identifier)
    await waitForGate(app)
    print("ANNUAL_UI Refund closes premium access")
    session.clearTransactions()
    let buyAgain = app.descendants(matching: .any).matching(NSPredicate(format: "label BEGINSWITH %@", "Abbonati · ")).firstMatch
    await require(buyAgain)
    let readyAgain = await verificationCompleted(buyAgain)
    XCTAssertTrue(readyAgain)
    revealPurchase(app, buyAgain)
    XCTAssertTrue(buyAgain.isHittable)
    buyAgain.tap()
    await require(element(app, "Inizia 15 casi"))
    let renewed = try XCTUnwrap(session.allTransactions().last(where: { $0.productIdentifier == productID }))
    try session.disableAutoRenewForTransaction(identifier: renewed.identifier)
    XCTAssertTrue(element(app, "Inizia 15 casi").exists, "Cancelling renewal must preserve the paid period")
    try session.expireSubscription(productIdentifier: productID)
    await waitForGate(app)
    print("ANNUAL_UI Expiry closes premium access")
  }
}
