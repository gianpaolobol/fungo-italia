require 'xcodeproj'
project_path = Dir['ios/*.xcodeproj'].first
raise 'Missing native project' unless project_path
project = Xcodeproj::Project.open(project_path)
app = project.targets.find { |t| t.name == 'FungoItalia' }
raise 'Missing application target' unless app
test = project.new_target(:ui_test_bundle, 'AnnualPurchaseUITests', :ios, '16.4')
test.add_dependency(app)
test.build_configurations.each do |config|
  config.build_settings.merge!({
    'PRODUCT_BUNDLE_IDENTIFIER' => 'it.fungoitalia.app.PurchaseUITests',
    'PRODUCT_NAME' => 'AnnualPurchaseUITests',
    'PRODUCT_MODULE_NAME' => 'AnnualPurchaseUITests',
    'EXECUTABLE_NAME' => 'AnnualPurchaseUITests',
    'EXECUTABLE_EXTENSION' => '',
    'WRAPPER_NAME' => 'AnnualPurchaseUITests.xctest',
    'MACH_O_TYPE' => 'mh_bundle',
    'GENERATE_INFOPLIST_FILE' => 'YES',
    'SWIFT_VERSION' => '5.9',
    'TEST_TARGET_NAME' => 'FungoItalia',
    'CODE_SIGNING_ALLOWED' => 'NO'
  })
end
project.root_object.attributes['TargetAttributes'] ||= {}
project.root_object.attributes['TargetAttributes'][test.uuid] = { 'TestTargetID' => app.uuid }
group = project.main_group.new_group('AnnualPurchaseUITests')
swift = group.new_file('../tests/storekit/AnnualPurchaseUITests.swift')
fixture = group.new_file('../tests/storekit/Annual.storekit')
test.add_file_references([swift])
test.resources_build_phase.add_file_reference(fixture)
project.save
scheme = Xcodeproj::XCScheme.new
scheme.add_build_target(app)
scheme.add_build_target(test, false)
scheme.add_test_target(test)
scheme.set_launch_target(app)
scheme.launch_action.xml_element.add_element('StoreKitConfigurationFileReference', { 'identifier' => '../../tests/storekit/Annual.storekit' })
scheme.test_action.build_configuration = 'Release'
scheme.save_as(project.path, 'FungoItaliaPurchaseUI', true)
