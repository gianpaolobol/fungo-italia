Pod::Spec.new do |s|
  s.name = 'FungoSubscription'
  s.version = '1.0.0'
  s.summary = 'Verified annual StoreKit 2 subscription for Fungo Italia'
  s.description = 'Local Expo module using Apple verified subscription transactions.'
  s.author = 'Fungo Italia'
  s.homepage = 'https://gianpaolobol.github.io/fungo-italia/'
  s.license = { :type => 'Proprietary' }
  s.platforms = { :ios => '15.1' }
  s.source = { :git => 'https://github.com/gianpaolobol/fungo-italia.git' }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.frameworks = 'StoreKit'
  s.swift_version = '5.9'
  s.source_files = '**/*.{h,m,mm,swift}'
  s.pod_target_xcconfig = { 'DEFINES_MODULE' => 'YES' }
end
