import XCTest
import StoreKitTest

@available(iOS 17.0, *)
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
    for _ in 0..<6 { if item.isHittable { break }; app.swipeUp() }
    item.tap()
  }
  @MainActor func readyToTap(_ item: XCUIElement) async -> Bool {
    let predicate = NSPredicate { object, _ in
      guard let element = object as? XCUIElement else { return false }
      return element.exists && element.isEnabled && element.isHittable
    }
    return await XCTWaiter.fulfillment(of: [XCTNSPredicateExpectation(predicate: predicate, object: item)], timeout: 120) == .completed
  }
  @MainActor func diagnose(_ app: XCUIApplication, _ session: SKTestSession) {
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
    await require(element(app, "Prova gratuita del test"))
    XCTAssertFalse(element(app, "Allenamento · 15 casi").exists)
  }
  @MainActor func testAnnualPurchaseRestoreAccessRefundAndExpiry() async throws {
    continueAfterFailure = false
    let url = try XCTUnwrap(Bundle(for: Self.self).url(forResource: "Annual", withExtension: "storekit"))
    let session = try SKTestSession(contentsOf: url)
    session.resetToDefaultState(); session.disableDialogs = true; session.timeRate = .realTime
    session.locale = Locale(identifier: "it_IT"); session.storefront = "ITA"; session.clearTransactions()
    guard session.storefront == "ITA" else { XCTFail("Local StoreKit fixture required"); return }
    let app = XCUIApplication(bundleIdentifier: "it.fungoitalia.app")
    defer { app.terminate(); session.clearTransactions(); session.resetToDefaultState() }
    app.launch()
    await require(element(app, "Ciao"))
    try capture(app, "00-dashboard")
    await tap(app, "Esame")
    await require(element(app, "Prova gratuita del test"))
    await tap(app, "Abbonamento")
    let subscribe = app.descendants(matching: .any).matching(NSPredicate(format: "label BEGINSWITH %@", "Abbonati · ")).firstMatch
    await require(subscribe)
    XCTAssertFalse(subscribe.isEnabled, "A new annual purchase requires permanent Base")
    let base = element(app, "Acquista Base permanente")
    await require(base)
    let baseReady = await readyToTap(base)
    XCTAssertTrue(baseReady, "Verified StoreKit state required before Base purchase")
    base.tap()
    await require(element(app, "Base acquistata"))
    for _ in 0..<6 { if subscribe.isHittable { break }; app.swipeUp() }
    let annualReady = await readyToTap(subscribe)
    XCTAssertTrue(annualReady)
    XCTAssertTrue(subscribe.label.contains("9,99") && subscribe.label.contains("€"))
    subscribe.tap()
    await require(element(app, "Abbonamento attivo"))
    await tap(app, "Esame")
    await require(element(app, "Simulazione didattica"))
    try capture(app, "03-esame")
    await tap(app, "Studio")
    try capture(app, "01-studio")
    await tap(app, "Aree")
    try capture(app, "02-aree")
    app.terminate(); app.launch()
    await tap(app, "Abbonamento")
    await tap(app, "Ripristina acquisti")
    await require(element(app, "Abbonamento attivo"))
    let annual = try XCTUnwrap(session.allTransactions().last(where: { $0.productIdentifier == productID }))
    try session.refundTransaction(identifier: annual.identifier)
    await tap(app, "Esame")
    await require(element(app, "Allenamento · 15 casi"))
    let simulation = element(app, "Simulazione didattica")
    let removed = XCTNSPredicateExpectation(predicate: NSPredicate(format: "exists == false"), object: simulation)
    let removedResult = await XCTWaiter.fulfillment(of: [removed], timeout: 120)
    XCTAssertEqual(removedResult, .completed)
    // Verify expiration also preserves independently owned Base.
    _ = try await session.buyProduct(identifier: productID, options: [])
    await require(element(app, "Simulazione didattica"))
    try session.expireSubscription(productIdentifier: productID)
    let expired = XCTNSPredicateExpectation(predicate: NSPredicate(format: "exists == false"), object: element(app, "Simulazione didattica"))
    let expiredResult = await XCTWaiter.fulfillment(of: [expired], timeout: 120)
    XCTAssertEqual(expiredResult, .completed)
    await require(element(app, "Allenamento · 15 casi"))
    let baseTransaction = try XCTUnwrap(session.allTransactions().last(where: { $0.productIdentifier == "it.fungoitalia.base.lifetime" }))
    try session.refundTransaction(identifier: baseTransaction.identifier)
    await waitForGate(app)
    print("DASHBOARD_UI Base, annual purchase, explicit restore, refund and expiry verified")
  }
}
