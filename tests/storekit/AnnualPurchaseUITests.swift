import XCTest
import StoreKitTest

final class AnnualPurchaseUITests: XCTestCase {

  @MainActor func auditNativeAreas(_ app: XCUIApplication, _ name: String) async throws {
    await require(element(app, "Aree e habitat"))
    let field = element(app, "Cerca area o habitat")
    await require(field)
    await enterAndConfirm("Toscana", into: field)
    await require(element(app, "6 aree corrispondenti"))
    await tap(app, "Abruzzo")
    await require(element(app, "Nessuna area corrisponde ai filtri."))
    await tap(app, "Tutte")
    await require(element(app, "6 aree corrispondenti"))
    await tap(app, "Mappa online")
    await require(app.webViews.firstMatch)
    let attribution = app.webViews.descendants(matching: .any).matching(NSPredicate(format: "label CONTAINS %@", "OpenStreetMap")).firstMatch
    let mapErrors = ["Cartografia non disponibile: l’elenco resta consultabile.", "Mappa online non disponibile: consulta l’elenco offline.", "Mappa online non disponibile.", "Caricamento cartografico troppo lungo: consulta l’elenco offline o riprova."]
    var usedRetry = false
    let firstLoaded = await waitFor(attribution, timeout: 20)
    if !firstLoaded || mapErrors.contains(where: { element(app, $0).exists }) {
      let retry = element(app, "Riprova mappa")
      let hasRetry = await waitFor(retry, timeout: 20)
      guard hasRetry && mapErrors.contains(where: { element(app, $0).exists }) && element(app, "6 aree corrispondenti").exists && !element(app, "Fungo Italia completo").exists else {
        try capture(app, name + "-invalid-fallback")
        XCTFail("Map failure must preserve offline list, filters and the actual retry control")
        throw NSError(domain: "NativeAreasAudit", code: 1)
      }
      try capture(app, name + "-initial-fallback")
      print("NATIVE_AREAS_INITIAL_FAILURE " + name + " retained six areas and no paywall; one explicit UI retry follows")
      await tap(app, "Riprova mappa")
      usedRetry = true
    }
    let finalLoaded = await waitFor(attribution, timeout: 90)
    guard finalLoaded && !mapErrors.contains(where: { element(app, $0).exists }) else {
      try capture(app, name + "-failed-after-bounded-recovery")
      XCTFail("Actual OSM attribution and error-free map required after at most one explicit UI retry")
      throw NSError(domain: "NativeAreasAudit", code: 2)
    }
    try capture(app, name)
    print("NATIVE_AREAS_MAP " + name + " Toscana=6 AbruzzoIntersection=0 OSMWebView=visible explicitRetry=" + String(usedRetry))
    await tap(app, "Elenco offline")
    app.terminate(); app.launch()
    await tap(app, "Aree")
    await require(app.staticTexts.matching(NSPredicate(format: "label BEGINSWITH %@", "71 macroaree in ")).firstMatch)
  }
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
    let item: XCUIElement
    if label == "Abbonamento" {
      item = app.descendants(matching: .any).matching(identifier: "subscription-access").firstMatch
    } else if ["Dashboard", "Percorso", "Studio", "Aree", "Esame"].contains(label) {
      let tabName = label == "Percorso" ? "Dashboard" : label
      item = app.descendants(matching: .any).matching(identifier: "tab-" + tabName.lowercased()).firstMatch
    } else {
      item = element(app, label)
    }
    await require(item, timeout: 60, file: file, line: line)
    // The free exam puts this navigation button below the visible viewport.
    // Reveal it with real user scrolling; never force a coordinate tap or bypass hittability.
    if label == "Torna al menu del test" && item.exists && !item.isHittable {
      for attempt in 1...8 {
        app.swipeUp()
        print("EXAM_MENU_SCROLL attempt=\(attempt) hittable=\(item.isHittable)")
        if item.isHittable { break }
      }
    }
    let hittable = await readyToTap(item)
    guard hittable else {
      print("REQUIRED_CONTROL_NOT_HITTABLE " + item.description)
      print("REQUIRED_APP_TREE " + app.debugDescription)
      try? capture(app, "failure-unhittable-control")
      XCTFail("Required app control cannot be tapped", file: file, line: line)
      return
    }
    item.tap()
  }
  @MainActor func readyToTap(_ item: XCUIElement) async -> Bool {
    let predicate = NSPredicate { object, _ in
      guard let element = object as? XCUIElement else { return false }
      return element.exists && element.isEnabled && element.isHittable
    }
    return await XCTWaiter.fulfillment(of: [XCTNSPredicateExpectation(predicate: predicate, object: item)], timeout: 120) == .completed
  }
  @MainActor func enterAndConfirm(_ text: String, into field: XCUIElement, file: StaticString = #filePath, line: UInt = #line) async {
    // XCTest's bulk typing lost characters while the controlled RN field
    // reconciled its value ("Aita caesarea" instead of "Amanita caesarea").
    // Confirm each real keyboard input before sending the next one.
    var expected = ""
    field.tap()
    for character in text {
      field.typeText(String(character))
      expected.append(character)
      let predicate = NSPredicate(format: "value == %@", expected)
      let result = await XCTWaiter.fulfillment(of: [XCTNSPredicateExpectation(predicate: predicate, object: field)], timeout: 10)
      guard result == .completed else {
        XCTFail("Search input differs from typed query: expected \(expected), received \(String(describing: field.value))", file: file, line: line)
        return
      }
    }
    XCTAssertEqual(field.value as? String, text, file: file, line: line)
    field.typeText("\n")
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
    await require(element(app, "Inizia 4 casi"))
    await tap(app, "Abbonamento")
    await require(element(app, "Fungo Italia completo"))
    XCTAssertFalse(element(app, "Inizia 15 casi").exists)
  }
  // Opt-in startup diagnostic only: never buys, never provides release evidence.
  @MainActor func testEntitlementStartupProbe() async throws {
    #if !targetEnvironment(simulator)
    throw XCTSkip("The entitlement startup probe requires a simulator")
    #else
    guard let mode = ProcessInfo.processInfo.environment["FUNGO_STOREKIT_PROBE_MODE"] else {
      throw XCTSkip("Run only from the dedicated entitlement diagnostic workflow")
    }
    guard ["baseline", "without-updates"].contains(mode) else {
      XCTFail("Unexpected entitlement diagnostic mode"); return
    }
    continueAfterFailure = false
    let url = try XCTUnwrap(Bundle(for: Self.self).url(forResource: "Annual", withExtension: "storekit"))
    let session = try SKTestSession(contentsOf: url)
    session.resetToDefaultState(); session.disableDialogs = true; session.timeRate = .realTime
    session.locale = Locale(identifier: "it_IT"); session.storefront = "ITA"; session.clearTransactions()
    guard session.storefront == "ITA" else {
      XCTFail("Local StoreKit session unavailable; diagnostic must never use the production store"); return
    }
    let app = XCUIApplication(bundleIdentifier: "it.fungoitalia.app")
    // Explicitly clear the baseline so the only variable is observer startup.
    app.launchEnvironment["FUNGO_STOREKIT_DIAGNOSTIC"] = mode == "without-updates" ? mode : ""
    defer { app.terminate(); session.clearTransactions(); session.resetToDefaultState() }
    print("ENTITLEMENT_STARTUP_PROBE mode=\(mode) diagnostic-only no-purchase")
    app.launch()
    await tap(app, "Abbonamento")
    let subscribe = app.descendants(matching: .any).matching(NSPredicate(format: "label BEGINSWITH %@", "Abbonati · ")).firstMatch
    await require(subscribe, timeout: 120)
    XCTAssertTrue(subscribe.label.contains("19,99") && subscribe.label.contains("€"), "Probe must load the Italian annual fixture")
    let ready = await readyToTap(subscribe)
    print("ENTITLEMENT_STARTUP_PROBE mode=\(mode) ready=\(ready) transactions=\(session.allTransactions().count)")
    diagnose(app, session)
    try capture(app, "entitlement-startup-\(mode)")
    XCTAssertTrue(session.allTransactions().isEmpty, "Readiness diagnostic must not create a transaction")
    XCTAssertTrue(ready, "Initial verified inactive entitlement must return before purchase becomes ready")
    #endif
  }
  @MainActor func testAFreeAgaricusDemoWithoutPurchase() async throws {
    continueAfterFailure = false
    let app = XCUIApplication(bundleIdentifier: "it.fungoitalia.app")
    app.launch()
    defer { app.terminate() }
    await require(element(app, "Ciao"))
    await tap(app, "Studio")
    await require(element(app, "Studio e atlante"))
    XCTAssertFalse(app.buttons.matching(NSPredicate(format: "label BEGINSWITH %@", "Demo gratuita · Agaricus")).firstMatch.exists)
    await tap(app, "Apri Agaricus sez. Xanthodermatei")
    try capture(app, "demo-01-studio")
    await tap(app, "Torna alle schede")
    await tap(app, "Esame")
    await require(element(app, "Test Agaricus gratuito"))
    await require(element(app, "Inizia 4 casi"))
    XCTAssertFalse(element(app, "Inizia 15 casi").exists)
    try capture(app, "demo-02-test")
    await tap(app, "Inizia 4 casi")
    await require(element(app, "Caso 1 / 4"))
    await tap(app, "Torna al menu del test")
    await tap(app, "Aree")
    await require(element(app, "Aree e habitat"))
    await require(app.staticTexts.matching(NSPredicate(format: "label BEGINSWITH %@", "71 macroaree in ")).firstMatch)
    XCTAssertFalse(element(app, "Fungo Italia completo").exists)
    try await auditNativeAreas(app, "extended-free-map")
    await tap(app, "Monte Amiata")
    await require(element(app, "1 area corrispondente"))
    await tap(app, "Consulta Monte Amiata")
    await require(element(app, "Faggeta · Castagneto · Querceto"))
    await tap(app, "Chiudi dettaglio")
    try capture(app, "demo-03-aree")
    print("AGARICUS_DEMO_UI Free profiles, four-case test and Areas/habitats available without purchase")
  }
  @MainActor func testManagedBetaRequiresInvitationWithExistingPurchase() async throws {
    continueAfterFailure = false
    let url = try XCTUnwrap(Bundle(for: Self.self).url(forResource: "Annual", withExtension: "storekit"))
    let session = try SKTestSession(contentsOf: url)
    session.resetToDefaultState(); session.disableDialogs = true; session.timeRate = .realTime
    session.locale = Locale(identifier: "it_IT"); session.storefront = "ITA"; session.clearTransactions()
    guard session.storefront == "ITA" else { XCTFail("Local StoreKit fixture required"); return }
    let purchase = try await session.buyProduct(identifier: productID, options: [])
    XCTAssertEqual(purchase.productIdentifier, productID)
    let app = XCUIApplication(bundleIdentifier: "it.fungoitalia.app")
    defer { app.terminate(); session.clearTransactions(); session.resetToDefaultState() }
    for launch in 1...2 {
      let notification = "it.fungoitalia.test.entitlement." + UUID().uuidString
      let verified = XCTDarwinNotificationExpectation(notificationName: notification)
      app.launchEnvironment["FUNGO_STOREKIT_VERIFIED_NOTIFICATION"] = notification
      app.launch()
      let received = await XCTWaiter.fulfillment(of: [verified], timeout: 120)
      guard received == .completed else {
        diagnose(app, session)
        XCTFail("App must finish its actual verified active entitlement lookup before testing invitation restrictions")
        return
      }
      print("INVITATION_ONLY_ENTITLEMENT_CONFIRMED launch=" + String(launch))
      await tap(app, "Esame")
      await require(element(app, "Inizia 4 casi"))
      XCTAssertFalse(element(app, "Inizia 15 casi").exists, "Existing annual transaction cannot unlock the managed beta")
      await tap(app, "Abbonamento")
      await require(element(app, "Accesso completo su invito"))
      let field = app.descendants(matching: .any).matching(identifier: "beta-invite-code").firstMatch
      await require(field)
      let activate = app.descendants(matching: .any).matching(identifier: "beta-redeem").firstMatch
      await require(activate)
      XCTAssertFalse(activate.isEnabled, "An empty invitation code must never activate full access")
      XCTAssertFalse(element(app, "Abbonamento attivo").exists)
      XCTAssertFalse(element(app, "Ripristina acquisti").exists)
      XCTAssertFalse(app.buttons.matching(NSPredicate(format: "label BEGINSWITH %@", "Abbonati · ")).firstMatch.exists)
      try capture(app, "invitation-only-" + String(launch))
      app.terminate()
    }
    print("INVITATION_ONLY_UI Existing annual purchase blocked on two cold launches; empty code disabled; no purchase or restore bypass")
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
    await tap(app, "Esame")
    await require(element(app, "Inizia 4 casi"))
    XCTAssertFalse(element(app, "Inizia 15 casi").exists)
    await tap(app, "Abbonamento")
    let subscribe = app.descendants(matching: .any).matching(NSPredicate(format: "label BEGINSWITH %@", "Abbonati · ")).firstMatch
    await require(subscribe, timeout: 120)
    var ready = await readyToTap(subscribe)
    // A fresh iPhone simulator can leave StoreKit entitlement enumeration pending
    // on first launch even when the local product has loaded. Re-launch once
    // with the same SKTestSession before failing; never bypass verification.
    if !ready {
      diagnose(app, session)
      print("STOREKIT_RETRY Relaunching app after stalled initial entitlement verification")
      app.terminate()
      app.launch()
      await tap(app, "Abbonamento")
      let retriedSubscribe = app.descendants(matching: .any).matching(NSPredicate(format: "label BEGINSWITH %@", "Abbonati · ")).firstMatch
      await require(retriedSubscribe, timeout: 120)
      ready = await readyToTap(retriedSubscribe)
      if !ready { diagnose(app, session) }
    }
    guard ready else { XCTFail("StoreKit entitlement verification must complete before purchase"); return }
    let purchaseButton = app.descendants(matching: .any).matching(NSPredicate(format: "label BEGINSWITH %@", "Abbonati · ")).firstMatch
    XCTAssertTrue(subscribe.label.contains("/ anno"))
    XCTAssertTrue(subscribe.label.contains("19,99") && subscribe.label.contains("€"), "Italian local StoreKit fixture must match the verified Apple Italy price")
    try capture(app, "03-esame")
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
    await tap(app, "Abbonamento")
    await tap(app, "Ripristina acquisti")
    await require(element(app, "Abbonamento attivo"))
    await tap(app, "Esame")
    await require(element(app, "Inizia 15 casi"))
    await tap(app, "Studio")
    let search = element(app, "Cerca nome scientifico, comune o sinonimo")
    await require(search)
    await enterAndConfirm("Amanita caesarea", into: search)
    await tap(app, "Apri Amanita caesarea")
    try capture(app, "01-studio")
    await tap(app, "Torna alle schede")
    let detailClosed = await XCTWaiter.fulfillment(of: [XCTNSPredicateExpectation(
      predicate: NSPredicate(format: "exists == false"), object: element(app, "Torna alle schede"))], timeout: 30)
    guard detailClosed == .completed else {
      print("STUDY_DETAIL_DID_NOT_CLOSE " + app.debugDescription)
      try? capture(app, "failure-study-detail-dismissal")
      XCTFail("Study detail must close before accessing the Areas tab")
      return
    }
    await tap(app, "Aree")
    await require(element(app, "Aree e habitat"))
    await require(app.staticTexts.matching(NSPredicate(format: "label BEGINSWITH %@", "71 macroaree in ")).firstMatch)
    XCTAssertFalse(element(app, "Fungo Italia completo").exists)
    try await auditNativeAreas(app, "extended-paid-map")
    try capture(app, "02-aree")
    await tap(app, "Esame")
    await require(element(app, "Inizia 15 casi"))
    let transaction = try XCTUnwrap(session.allTransactions().last(where: { $0.productIdentifier == productID }))
    try session.refundTransaction(identifier: transaction.identifier)
    await waitForGate(app)
    print("ANNUAL_UI Refund closes premium access")
    session.clearTransactions()
    let buyAgain = app.descendants(matching: .any).matching(NSPredicate(format: "label BEGINSWITH %@", "Abbonati · ")).firstMatch
    await require(buyAgain)
    let readyAgain = await readyToTap(buyAgain)
    XCTAssertTrue(readyAgain)
    buyAgain.tap()
    await require(element(app, "Abbonamento attivo"))
    await tap(app, "Esame")
    await require(element(app, "Inizia 15 casi"))
    let renewed = try XCTUnwrap(session.allTransactions().last(where: { $0.productIdentifier == productID }))
    try session.disableAutoRenewForTransaction(identifier: renewed.identifier)
    XCTAssertTrue(element(app, "Inizia 15 casi").exists, "Cancelling renewal must preserve the paid period")
    try session.expireSubscription(productIdentifier: productID)
    await waitForGate(app)
    print("ANNUAL_UI Expiry closes premium access")
  }
}
