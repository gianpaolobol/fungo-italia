import Foundation
import Vision
import ImageIO

let request = VNClassifyImageRequest()
let fungalLabels = try request.supportedIdentifiers().filter { $0.lowercased().contains("mushroom") || $0.lowercased().contains("fungus") || $0.lowercased().contains("fungi") }
print("Fungal classes: \(fungalLabels)")
let samples = [
 "amanita-caesarea-lateral-460.jpg",
 "clitocybe-nebularis-lateral-241.jpg",
 "imleria-badia-lateral-194.jpg",
 "cantharellus-cibarius-complex-lateral-456.jpg",
 "boletus-edulis-s-l-lateral-40.jpg"
]
var candidateCount = 0
for sample in samples {
 let url = URL(fileURLWithPath: "web/public/images/reference/" + sample)
 try VNImageRequestHandler(url: url, options: [:]).perform([request])
 let results = request.results ?? []
 let fungal = results.filter { fungalLabels.contains($0.identifier) }.map { $0.confidence }.max() ?? 0
 if fungal >= 0.15 { candidateCount += 1 }
 print("\(sample): fungal=\(fungal); top=\(results.prefix(3).map { "\($0.identifier):\($0.confidence)" })")
}
print("SMOKE candidates=\(candidateCount)/\(samples.count), fungalLabelAvailable=\(!fungalLabels.isEmpty)")
print("Diagnostic smoke test on macOS. Does not establish iPhone accuracy or species identity.")
