Pod::Spec.new do |s|
  s.name = 'FungoPhotoFilter'
  s.version = '1.0.0'
  s.summary = 'Private on-device photo filtering'
  s.description = 'PhotoKit thumbnails classified locally with Apple Vision.'
  s.author = 'Fungo Italia'
  s.homepage = 'https://github.com/gianpaolobol/fungo-italia'
  s.license = { :type => 'Proprietary' }
  s.platform = :ios, '16.4'
  s.source = { :git => 'https://github.com/gianpaolobol/fungo-italia.git' }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.frameworks = 'Photos', 'Vision', 'UIKit', 'ImageIO'
  s.swift_version = '5.9'
  s.source_files = '**/*.swift'
end
