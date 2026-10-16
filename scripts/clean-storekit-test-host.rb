require 'xcodeproj'
path = Dir.glob('ios/*.xcodeproj').first or abort 'App project missing'
project = Xcodeproj::Project.open(path)
target = project.targets.find { |t| t.name == 'AnnualStoreKitTests' } or abort 'Hosted test target missing'
app = project.targets.find { |t| t.name == 'FungoItalia' } or abort 'Production host missing'
provider = ->(file) { file.file_ref && File.basename(file.file_ref.path.to_s) == 'ExpoModulesProvider.swift' }
abort 'Production Expo provider is missing' if app.source_build_phase.files.count(&provider).zero?
removed = target.source_build_phase.files.select(&provider)
removed.each(&:remove_from_project)
target.shell_script_build_phases.select { |phase| phase.name == '[Expo] Configure project' }.each(&:remove_from_project)
abort 'Duplicate test provider remains' unless target.source_build_phase.files.count(&provider).zero?
project.save
puts "HOSTED_TEST_PROVIDER_CLEANED #{removed.length}; production provider preserved"
