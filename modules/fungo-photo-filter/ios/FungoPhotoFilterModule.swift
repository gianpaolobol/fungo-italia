import ExpoModulesCore
import Photos
import Vision
import UIKit
import ImageIO

private final class CompletionGate {
  private let lock = NSLock()
  private var finished = false
  func resolve(_ promise: Promise, _ value: [String: Any]) {
    lock.lock()
    let deliver = !finished
    finished = true
    lock.unlock()
    if deliver { promise.resolve(value) }
  }
}

public class FungoPhotoFilterModule: Module {
  private static let visionQueue = DispatchQueue(label: "it.fungoitalia.photo-vision", qos: .userInitiated)
  public func definition() -> ModuleDefinition {
    Name("FungoPhotoFilter")
    AsyncFunction("createSnapshot") { (promise: Promise) in
      let options = PHFetchOptions()
      options.sortDescriptors = [NSSortDescriptor(key: "creationDate", ascending: false)]
      let assets = PHAsset.fetchAssets(with: .image, options: options)
      guard assets.count <= 100000 else { promise.reject("TOO_MANY_ASSETS", "Seleziona meno foto nelle Impostazioni"); return }
      var manifest: [[String: Any]] = []
      assets.enumerateObjects { asset, _, _ in
        manifest.append(["id": "ph://" + asset.localIdentifier, "creationTime": asset.creationDate.map { $0.timeIntervalSince1970 * 1000 } as Any? ?? NSNull()])
      }
      promise.resolve(manifest)
    }
    AsyncFunction("classifyAsset") { (assetId: String, promise: Promise) in
      let gate = CompletionGate()
      let fallback: [String: Any] = ["supported": false, "predictions": [], "reason": "Miniatura non disponibile localmente"]
      let rawId = assetId.hasPrefix("ph://") ? String(assetId.dropFirst(5)) : assetId
      let assets = PHAsset.fetchAssets(withLocalIdentifiers: [rawId], options: nil)
      guard let asset = assets.firstObject else { promise.resolve(fallback); return }
      let options = PHImageRequestOptions()
      options.deliveryMode = .highQualityFormat
      options.resizeMode = .fast
      options.isNetworkAccessAllowed = false
      let manager = PHImageManager.default()
      let request = manager.requestImage(for: asset, targetSize: CGSize(width: 512, height: 512), contentMode: .aspectFit, options: options) { image, info in
        if (info?[PHImageResultIsDegradedKey] as? Bool) == true { return }
        guard let image = image, let cgImage = image.cgImage else { gate.resolve(promise, fallback); return }
        let preview = UIGraphicsImageRenderer(size: CGSize(width: 160, height: 160)).image { _ in
          let ratio = min(160 / image.size.width, 160 / image.size.height)
          let size = CGSize(width: image.size.width * ratio, height: image.size.height * ratio)
          image.draw(in: CGRect(x: (160 - size.width) / 2, y: (160 - size.height) / 2, width: size.width, height: size.height))
        }
        let uri = "data:image/jpeg;base64," + (preview.jpegData(compressionQuality: 0.5)?.base64EncodedString() ?? "")
        Self.visionQueue.async {
          do {
            let request = VNClassifyImageRequest()
            let supported = try request.supportedIdentifiers().contains { label in
              let lower = label.lowercased()
              return lower.contains("mushroom") || lower.contains("fungus") || lower.contains("fungi")
            }
            guard supported else {
              gate.resolve(promise, ["supported": false, "predictions": [], "reason": "Il classificatore di questo dispositivo non espone una classe fungo", "uri": uri])
              return
            }
            let orientations: [UIImage.Orientation: CGImagePropertyOrientation] = [.up: .up, .down: .down, .left: .left, .right: .right, .upMirrored: .upMirrored, .downMirrored: .downMirrored, .leftMirrored: .leftMirrored, .rightMirrored: .rightMirrored]
            try VNImageRequestHandler(cgImage: cgImage, orientation: orientations[image.imageOrientation] ?? .up, options: [:]).perform([request])
            let observations = request.results ?? []
            var selected = Array(observations.prefix(3))
            if let fungal = observations.first(where: { $0.identifier.lowercased().contains("mushroom") || $0.identifier.lowercased().contains("fungus") || $0.identifier.lowercased().contains("fungi") }), !selected.contains(where: { $0.identifier == fungal.identifier }) { selected.append(fungal) }
            gate.resolve(promise, ["supported": true, "uri": uri, "predictions": selected.map { ["label": $0.identifier, "score": Double($0.confidence)] }])
          } catch { gate.resolve(promise, fallback) }
        }
      }
      DispatchQueue.global().asyncAfter(deadline: .now() + 15) {
        manager.cancelImageRequest(request)
        gate.resolve(promise, fallback)
      }
    }
  }
}
