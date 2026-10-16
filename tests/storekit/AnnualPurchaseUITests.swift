import XCTest
import StoreKitTest

final class AnnualPurchaseUITests: XCTestCase {
  let productID = "it.fungoitalia.premium.annual"
  func element(_ app: XCUIApplication, _ label: String) -> XCUIElement {
    app.descendants(matching: .any).matching(NSPredicate(format: "label == %@", label)).firstMatch
  }
  func tap(_ app: XCUIApplication, _ label: String, file: StaticString = #filePath, line: UInt = #line) {
    let item = element(app, label)
    XCTAssertTrue(item.waitForExistence(timeout: 60), "Missing \(label)", file: file, line: line)
    item.tap()
  }
  func readyToTap(_ item: XCUIElement) -> Bool {
    let predicate = NSPredicate { object, _ in
      guard let element = object as? XCUIElement else { return false }
      return element.exists && element.isEnabled && element.isHittable
    }
    return XCTWaiter.wait(for: [XCTNSPredicateExpectation(predicate: predicate, object: item)], timeout: 40) == .completed
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
  func waitForGate(_ app: XCUIApplication) {
    XCTAssertTrue(element(app, "Fungo Italia completo").waitForExistence(timeout: 120))
    XCTAssertFalse(element(app, "Inizia 15 casi").exists)
  }
  @MainActor func testAnnualPurchaseRestoreAccessRefundAndExpiry() throws {
    continueAfterFailure = false
    let url = try XCTUnwrap(Bundle(for: Self.self).url(forResource: "Annual", withExtension: "storekit"))
    let session = try SKTestSession(contentsOf: url)
    session.resetToDefaultState(); session.disableDialogs = true; session.timeRate = .realTime
    session.locale = Locale(identifier: "it_IT"); session.storefront = "ITA"; session.clearTransactions()
    XCTAssertEqual(session.storefront, "ITA", "Local StoreKit session is not active; never fall back to the production store")
    let app = XCUIApplication(bundleIdentifier: "it.fungoitalia.app")
    defer { app.terminate(); session.clearTransactions(); session.resetToDefaultState() }
    app.launch()
    tap(app, "Abbonamento")
    let subscribe = app.descendants(matching: .any).matching(NSPredicate(format: "label BEGINSWITH %@", "Abbonati · ")).firstMatch
    XCTAssertTrue(subscribe.waitForExistence(timeout: 60), "Localized StoreKit annual purchase button unavailable")
    let ready = readyToTap(subscribe)
    if !ready { diagnose(app, session) }
    XCTAssertTrue(ready, "Wait for entitlement verification before tapping the annual purchase button")
    XCTAssertTrue(subscribe.label.contains("/ anno"))
    XCTAssertTrue(subscribe.label.contains("9,99") && subscribe.label.contains("€"), "Italian local StoreKit fixture must match the verified Apple Italy price")
    try capture(app, "03-esame")
    subscribe.tap()
    let activated = element(app, "Abbonamento attivo").waitForExistence(timeout: 120)
    if !activated { diagnose(app, session) }
    XCTAssertTrue(activated)
    // Reopening the app reads the verified StoreKit entitlement, not a persisted premium flag.
    app.terminate(); app.launch()
    tap(app, "Esame")
    XCTAssertTrue(element(app, "Inizia 15 casi").waitForExistence(timeout: 120))
    tap(app, "Studio")
    let search = element(app, "Cerca nome scientifico, comune o sinonimo")
    XCTAssertTrue(search.waitForExistence(timeout: 120))
    search.tap(); search.typeText("Amanita caesarea")
    tap(app, "Apri Amanita caesarea")
    try capture(app, "01-studio")
    tap(app, "Torna alle schede")
    tap(app, "Aree"); try capture(app, "02-aree")
    tap(app, "Esame")
    XCTAssertTrue(element(app, "Inizia 15 casi").waitForExistence(timeout: 120))
    let transaction = try XCTUnwrap(session.allTransactions().last(where: { $0.productIdentifier == productID }))
    try session.refundTransaction(identifier: transaction.identifier)
    waitForGate(app)
    session.clearTransactions()
    let buyAgain = app.descendants(matching: .any).matching(NSPredicate(format: "label BEGINSWITH %@", "Abbonati · ")).firstMatch
    XCTAssertTrue(buyAgain.waitForExistence(timeout: 120)); XCTAssertTrue(readyToTap(buyAgain)); buyAgain.tap()
    XCTAssertTrue(element(app, "Inizia 15 casi").waitForExistence(timeout: 120))
    let renewed = try XCTUnwrap(session.allTransactions().last(where: { $0.productIdentifier == productID }))
    try session.disableAutoRenewForTransaction(identifier: renewed.identifier)
    XCTAssertTrue(element(app, "Inizia 15 casi").exists, "Cancelling renewal must preserve the paid period")
    try session.expireSubscription(productIdentifier: productID)
    waitForGate(app)
  }
}
