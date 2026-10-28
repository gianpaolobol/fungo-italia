require 'xcodeproj'
require 'digest'
require 'fileutils'

# Standalone infrastructure qualification. It never grants product release proof.
# Keep the application's actual verifier and native lifecycle assertions unchanged.
root = File.expand_path('runtime-probe')
FileUtils.mkdir_p(root)
source = File.read('modules/fungo-subscription/ios/FungoSubscriptionModule.swift')
verifier = source.split('  @MainActor public static func verifiedEntitlement()', 2).fetch(1).split('  @MainActor private func emitCurrent()', 2).first
raise 'Verifier boundary changed' unless verifier.include?('Transaction.currentEntitlements') && verifier.include?('case .verified')
File.write("#{root}/Verifier.swift", "import StoreKit\nimport OSLog\nimport UIKit\npublic final class FungoSubscriptionModule {\nprivate static let annualID = \"it.fungoitalia.premium.annual\"\n@MainActor public static func verifiedEntitlement()" + verifier + "}\n")
puts "VERIFIER_SOURCE_SHA256 #{Digest::SHA256.hexdigest(source)}"
File.write("#{root}/App.swift", <<~'SWIFT')
  import UIKit
  import StoreKit
  @main final class ProbeApp: UIResponder, UIApplicationDelegate {
    var window: UIWindow?
    func application(_ application: UIApplication, didFinishLaunchingWithOptions options: [UIApplication.LaunchOptionsKey:Any]?) -> Bool {
      let window = UIWindow(frame: UIScreen.main.bounds)
      window.rootViewController = ProbeController(); window.makeKeyAndVisible(); self.window = window
      return true
    }
  }
  final class ProbeController: UIViewController {
    override func viewDidLoad() {
      super.viewDidLoad(); view.backgroundColor = .white
      let label = UILabel(frame: CGRect(x:20,y:80,width:600,height:100)); label.accessibilityIdentifier = "probe-status"; label.text = "loading"; view.addSubview(label)
      Task { @MainActor in
        do {
          let product = try await Product.products(for:["it.fungoitalia.premium.annual"]).first
          let state = await FungoSubscriptionModule.verifiedEntitlement()
          label.text = "ready active=\(state["active"] as? Bool ?? true) price=\(product?.displayPrice ?? "missing")"
        } catch { label.text = "failed \(error)" }
      }
    }
  }
SWIFT
native = File.read('tests/storekit/AnnualStoreKitTests.swift').sub('internal import FungoSubscription', '@testable import RuntimeHost')
File.write("#{root}/NativeTests.swift", native)
FileUtils.cp('tests/storekit/Annual.storekit', "#{root}/Annual.storekit")
File.write("#{root}/StartupTests.swift", <<~'SWIFT')
  import XCTest
  import StoreKitTest
  final class StartupTests: XCTestCase {
    @MainActor func testLocalSessionAndAppStartup() throws {
      continueAfterFailure = false
      let url = try XCTUnwrap(Bundle(for:Self.self).url(forResource:"Annual",withExtension:"storekit"))
      let session = try SKTestSession(contentsOf:url)
      session.resetToDefaultState(); session.disableDialogs = true; session.timeRate = .realTime
      session.locale = Locale(identifier:"it_IT"); session.storefront = "ITA"; session.clearTransactions()
      XCTAssertEqual(session.storefront,"ITA","Local StoreKit environment unavailable; refuse production fallback")
      let app = XCUIApplication(bundleIdentifier:"it.fungoitalia.runtimeprobe")
      defer { app.terminate(); session.clearTransactions(); session.resetToDefaultState() }
      app.launch()
      let status = app.staticTexts["probe-status"]
      let ready = NSPredicate(format:"label BEGINSWITH %@", "ready active=false price=")
      let result = XCTWaiter.wait(for:[XCTNSPredicateExpectation(predicate:ready,object:status)],timeout:90)
      print("RUNTIME_STARTUP_STATUS " + status.label)
      XCTAssertEqual(result,.completed)
      XCTAssertTrue(status.label.contains("19,99") && status.label.contains("€"),"Must use Italian local fixture")
      XCTAssertTrue(session.allTransactions().isEmpty,"Startup qualification must not buy")
    }
  }
SWIFT
project = Xcodeproj::Project.new("#{root}/RuntimeProbe.xcodeproj")
app = project.new_target(:application,'RuntimeHost',:ios,'17.0')
app.build_configurations.each { |c| c.build_settings.merge!({'PRODUCT_BUNDLE_IDENTIFIER'=>'it.fungoitalia.runtimeprobe','SWIFT_VERSION'=>'5.9','GENERATE_INFOPLIST_FILE'=>'YES','INFOPLIST_KEY_UILaunchScreen_Generation'=>'YES','INFOPLIST_KEY_UIApplicationSceneManifest_Generation'=>'NO','ENABLE_TESTABILITY'=>'YES','TARGETED_DEVICE_FAMILY'=>'1,2'}) }
['App.swift','Verifier.swift'].each { |p| app.add_file_references([project.main_group.new_file(p)]) }
native_target = project.new_target(:unit_test_bundle,'AnnualStoreKitTests',:ios,'17.0')
ui_target = project.new_target(:ui_test_bundle,'StartupTests',:ios,'17.0')
[[native_target,'NativeTests.swift'],[ui_target,'StartupTests.swift']].each do |target,file|
  target.add_dependency(app)
  target.build_configurations.each do |c|
    c.build_settings.merge!({'PRODUCT_BUNDLE_IDENTIFIER'=>"it.fungoitalia.runtimeprobe.#{target.name}",'SWIFT_VERSION'=>'5.9','GENERATE_INFOPLIST_FILE'=>'YES'})
    if target == native_target
      c.build_settings.merge!({'TEST_HOST'=>'$(BUILT_PRODUCTS_DIR)/RuntimeHost.app/RuntimeHost','BUNDLE_LOADER'=>'$(TEST_HOST)'})
    else
      c.build_settings['TEST_TARGET_NAME'] = 'RuntimeHost'
    end
  end
  target.add_file_references([project.main_group.new_file(file)])
  target.resources_build_phase.add_file_reference(project.main_group.new_file('Annual.storekit'))
end
project.root_object.attributes['TargetAttributes'] = {ui_target.uuid=>{'TestTargetID'=>app.uuid}}
project.save
[[native_target,'NativeLifecycle'],[ui_target,'Startup']].each do |target,name|
  scheme = Xcodeproj::XCScheme.new
  scheme.add_build_target(app); scheme.add_build_target(target,false); scheme.add_test_target(target); scheme.set_launch_target(app)
  [scheme.launch_action,scheme.test_action].each { |action| action.xml_element.add_element('StoreKitConfigurationFileReference',{'identifier'=>'../Annual.storekit'}) }
  scheme.test_action.build_configuration = 'Release'
  scheme.save_as(project.path,name,true)
end
puts 'Infrastructure probe generated; no release or TestFlight evidence is produced.'
