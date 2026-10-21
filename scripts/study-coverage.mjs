import {readFile,writeFile} from 'node:fs/promises';
import {coverageInventory} from '../lib/study-coverage.mjs';
import {buildCurriculumBank} from '../lib/study-curriculum-bank.mjs';
const read=async name=>JSON.parse(await readFile(new URL('../src/data/'+name,import.meta.url),'utf8'));
const minimum=await read('catalog.json'),extended=await read('groups.json'),photo=await read('exam-bank.json'),theory=buildCurriculumBank(minimum,extended,photo),bank=[...photo,...theory];
const inventory=coverageInventory(minimum,extended,bank),questions=theory.reduce((n,c)=>n+c.questions.length,0);
const header=`# Copertura del percorso di studio

Inventario riproducibile da catalogo e banca effettiva.

Minimi: ${inventory.minimum.ready}/${inventory.minimum.total} schede con caso (${inventory.minimum.photographic} fotografici, ${inventory.minimum.theoretical} teorici).
Percorso aggiuntivo: ${inventory.extended.ready}/${inventory.extended.total} schede con caso teorico.
Nuove domande teoriche: ${questions}.

La copertura delle schede non equivale a copertura fotografica o a certificazione scientifica indipendente. I ${inventory.minimum.theoretical} minimi senza caso fotografico sono interrogati sui testi delle schede, senza inventare immagini, commestibilità o sindromi. I gruppi conservano integralmente limiti ed esempi nei testi. Ogni risposta è tracciata al campo canonico e al relativo hash; i riferimenti esterni sono riportati quando presenti nel campo. Il contenuto interno del catalogo conserva il proprio stato di revisione.

La preparazione conta soltanto le dimensioni realmente interrogate: una risposta teorica non genera evidenza di riconoscimento fotografico o commestibilità. La demo Agaricus utilizza soltanto quattro casi fotografici e conserva i propri progressi separatamente dal percorso completo. Lo storico completo resta consultabile dopo la scadenza dell’abbonamento.

| Percorso | Scheda | Caso | Domande teoriche |
|---|---|---|---|
`;
const names=new Map([...minimum,...extended].map(t=>[t.id,t.scientificName]));
const report=header+bank.map(c=>`| ${c.scope==='extended'?'Aggiuntivo':'Minimo'} | ${names.get(c.id).replaceAll('|','/')} | ${c.questionKind==='profile'?'Teorico sui testi':'Fotografico'} | ${c.questions?.length||'—'} |`).join('\n')+'\n';
if(process.argv.includes('--write'))await writeFile(new URL('../docs/STUDY-COVERAGE.md',import.meta.url),report);
console.log(JSON.stringify({minimum:inventory.minimum,extended:inventory.extended,theoryQuestions:questions,missing:inventory.missing.length}));
