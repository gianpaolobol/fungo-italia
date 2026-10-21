// The export commit identifies canonical bytes, not the CI run rebuilding them.
export function sourceExportCommit(manifest, previous) {
 const checksumSet=files=>JSON.stringify((files??[]).map(({name,bytes,sha256})=>({name,bytes,sha256})).sort((a,b)=>a.name.localeCompare(b.name)));
 if(previous?.sourceExportCommit&&checksumSet(previous.sourceFileChecksums)===checksumSet(manifest.files))return previous.sourceExportCommit;
 return manifest.commit??null;
}
