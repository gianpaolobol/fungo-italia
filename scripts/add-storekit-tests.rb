require 'xcodeproj'
project_path = Dir['ios/*.xcodeproj'].first
raise 'Missing native project' unless project_path
project = Xcodeproj::Project.open(project_path)
app = project.targets.find { |t| t.name == 'FungoItalia' }
raise 'Missing application target' unless app
test = project.new_target(:unit_test_bundle, 'AnnualStoreKitTests', :ios, '16.4')
test.add_dependency(app)
test.build_configurations.each do |config|
  config.build_settings.merge!({
    'PRODUCT_BUNDLE_IDENTIFIER' => 'it.fungoitalia.app.StoreKitTests',
    'GENERATE_INFOPLIST_FILE' => 'YES',
    'SWIFT_VERSION' => '5.9',
    'TEST_HOST' => '$(BUILT_PRODUCTS_DIR)/FungoItalia.app/FungoItalia',
    'BUNDLE_LOADER' => '$(TEST_HOST)',
    'CODE_SIGNING_ALLOWED' => 'NO'
  })
end
group = project.main_group.new_group('AnnualStoreKitTests')
swift = group.new_file('../tests/storekit/AnnualStoreKitTests.swift')
fixture = group.new_file('../tests/storekit/Annual.storekit')
test.add_file_references([swift])
test.resources_build_phase.add_file_reference(fixture)
project.save
scheme = Xcodeproj::XCScheme.new
scheme.add_build_target(app)
scheme.add_build_target(test, false)
scheme.add_test_target(test)
scheme.set_launch_target(app)
scheme.test_action.build_configuration = 'Release'
scheme.save_as(project.path, 'FungoItaliaStoreKit', true)
podfile = File.read('ios/Podfile')
raise 'Unexpected Podfile layout' unless podfile.match?(/\nend\s*\z/)
podfile = podfile.sub(/\nend\s*\z/, "\n  target 'AnnualStoreKitTests' do\n    inherit! :search_paths\n  end\nend\n")
File.write('ios/Podfile', podfile)
