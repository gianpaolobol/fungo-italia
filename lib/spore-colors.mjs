// Indicative display swatches derived only from the recorded spore-print words.
// Preserve the original text: a swatch is not a calibrated taxonomic measurement.
export function sporeColors(print){
 if(!print?.label)return [];
 if(/^#[0-9a-f]{6}$/i.test(print.color||''))return [print.color];
 const parts=print.label.startsWith('Esempi documentati:')?print.label.split(' — ').slice(1).map(x=>x.split(/[.;]/)[0]):[print.label.split(/[.;]/)[0].split(/\b(?:in|nella|secondo|documentata|documentato)\b/i)[0]];
 const result=[];
 const rules=[[/brun[oa]-porpora|bruno scuro, cioccolato/i,'#65404e'],[/brun[oa]-oliv/i,'#6e7040'],[/brun[oa]-ruggine|ruggine|bruno-rossastr/i,'#9c5634'],[/bruno tabacco|brun[oa]|cannella|siena/i,'#79553c'],[/bianc/i,'#f7f5ed'],[/crema/i,'#eee0b5'],[/ocra/i,'#c49a47'],[/giall/i,'#dfc65a'],[/rosa/i,'#d9a4a7'],[/ner[ao]|nerastr/i,'#222222'],[/violace|porpora/i,'#72506e'],[/verd/i,'#78976d'],[/aranciat/i,'#e7b77f']];
 for(let part of parts){
  // Treat qualified compound brown colors as one hue, not generic brown + qualifier.
  const compound=rules.slice(0,3).find(([rx])=>rx.test(part));
  if(compound){result.push(compound[1]);part=part.replace(compound[0],'');}
  for(const [rx,color]of rules.slice(3))if(rx.test(part))result.push(color);
 }
 return [...new Set(result)];
}
