import React,{useState} from 'react';
import {Image,Pressable,ScrollView,StyleSheet,Text,TextInput,View} from 'react-native';
import {previewCases} from '../lib/study-preview.mjs';
import {detailQuestions,foodColors,foodLabels,gradeResponse,suggestNames} from '../web/public/exam-core';
import type {ExamCase,TrainingAnswer} from '../web/public/exam-core';
import bankData from '../src/data/exam-bank.json';
import {referenceImageAssets} from '../src/data/reference-image-assets';
const bank=bankData as unknown as ExamCase[],cases=previewCases(bank);
const blank:TrainingAnswer={name:'',category:'',choices:{},assisted:false};
// The demonstration has only component state: no quota, archive or study-store writes.
export default function ExamPreview({onAccess}:{onAccess:()=>void}){
 const [index,setIndex]=useState(0),[answer,setAnswer]=useState<TrainingAnswer>(blank),[submitted,setSubmitted]=useState(false);
 const item=cases[index],done=index>=cases.length,questions=item?detailQuestions(item,bank):[],grade=item&&submitted?gradeResponse(item,answer,bank):null;
 const button=(label:string,action:()=>void)=><Pressable accessibilityRole="button" onPress={action} style={s.button}><Text style={s.buttonText}>{label}</Text></Pressable>;
 return <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.page}>
  <Text accessibilityRole="header" style={s.title}>Prova gratuita del test</Text>
  <Text style={s.text}>Tre esempi guidati. Questa prova non consuma la sessione Base e non modifica i tuoi progressi.</Text>
  {done?<View style={s.card}><Text style={s.title}>Anteprima completata</Text><Text style={s.text}>Con Base hai tutte le schede degli obiettivi minimi e una sessione di 15 casi, con pausa, ripresa e correzione degli errori.</Text>{button('Scopri Base e accesso completo',onAccess)}{button('Ripeti la dimostrazione',()=>{setIndex(0);setAnswer(blank);setSubmitted(false);})}</View>:<>
   <Text style={s.title}>Esempio {index+1} di {cases.length}</Text>
   {item.photos.map((p,i)=>referenceImageAssets[p.src]&&<Image key={p.src} source={referenceImageAssets[p.src]} accessibilityLabel={'Vista fotografica '+(i+1)} resizeMode="contain" style={s.photo}/>)}
   {grade?<View style={s.card}><Text accessibilityRole="alert" style={s.title}>{grade.passed?'Risposta corretta':'Rivediamo la risposta'}</Text><Text style={grade.name?s.good:s.bad}>{grade.name?'✓':'✕'} Nome · {item.acceptedNames.join(' / ')}</Text><Text style={grade.category?s.good:s.bad}>{grade.category?'✓':'✕'} Commestibilità · {foodLabels[item.category]}</Text>{questions.map(q=><Text key={q.id} style={grade.details.find(d=>d.id===q.id)?.correct?s.good:s.bad}>{grade.details.find(d=>d.id===q.id)?.correct?'✓':'✕'} {q.title}: {q.options.filter(o=>q.correct.includes(o.id)).map(o=>o.label).join('; ')}</Text>)}{button('Continua la dimostrazione',()=>{setIndex(index+1);setAnswer(blank);setSubmitted(false);})}</View>:<>
    <TextInput accessibilityLabel="Nome scientifico nella dimostrazione" autoCorrect={false} maxLength={200} value={answer.name} onChangeText={name=>setAnswer({...answer,name})} style={s.input}/>
    {suggestNames(bank,answer.name).filter(n=>n!==answer.name).map(name=><Pressable accessibilityRole="button" key={name} style={s.option} onPress={()=>setAnswer({...answer,name,assisted:true})}><Text style={s.text}>{name}</Text></Pressable>)}
    <Text style={s.title}>Commestibilità</Text>{Object.entries(foodLabels).map(([category,label])=><Pressable key={category} accessibilityRole="radio" accessibilityState={{selected:answer.category===category}} onPress={()=>setAnswer({...answer,category})} style={[s.option,{backgroundColor:foodColors[category]},answer.category===category&&s.selected]}><Text style={[s.text,{color:category==='deadly'?'white':'#222'}]}>{answer.category===category?'● ':'○ '}{label}</Text></Pressable>)}
    {questions.map(q=><View key={q.id} style={s.card}><Text style={s.text}>{q.title}</Text>{q.options.map(o=>{const chosen=answer.choices[q.id]?.includes(o.id);return <Pressable key={o.id} accessibilityRole={q.multiple?'checkbox':'radio'} accessibilityState={{checked:!!chosen,selected:!!chosen}} style={[s.option,chosen&&s.selected]} onPress={()=>setAnswer({...answer,choices:{...answer.choices,[q.id]:q.multiple?(chosen?(answer.choices[q.id]||[]).filter(id=>id!==o.id):[...(answer.choices[q.id]||[]),o.id]):[o.id]}})}><Text style={s.text}>{chosen?'● ':'○ '}{o.label}</Text></Pressable>;})}</View>)}
    {button('Verifica la risposta di esempio',()=>setSubmitted(true))}
   </>}
  </>}
  <Text style={s.text}>Dimostrazione didattica. Il riconoscimento fotografico non autorizza il consumo.</Text>
  {!done&&button('Scopri Base e accesso completo',onAccess)}
 </ScrollView>;
}
const s=StyleSheet.create({page:{padding:18,gap:14},title:{fontSize:20,fontWeight:'700',color:'#174f2b'},text:{fontSize:15,lineHeight:23,color:'#304b39'},photo:{width:'100%',height:210,borderRadius:12,backgroundColor:'#e8eee5'},card:{padding:16,gap:12,borderRadius:14,backgroundColor:'white'},input:{padding:14,borderWidth:1,borderColor:'#789180',borderRadius:10,fontSize:17,backgroundColor:'white'},option:{padding:12,minHeight:48,borderWidth:1,borderColor:'#789180',borderRadius:10},selected:{borderWidth:3,borderColor:'#174f2b'},button:{padding:16,minHeight:50,backgroundColor:'#174f2b',borderRadius:12,alignItems:'center'},buttonText:{color:'white',fontSize:15,fontWeight:'700',textAlign:'center'},good:{fontSize:15,lineHeight:24,color:'#1f6f2a'},bad:{fontSize:15,lineHeight:24,color:'#a32424'}});
