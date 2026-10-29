import React,{useState} from 'react';import {Pressable,StyleSheet,Text,View} from 'react-native';
import PhotoExam from './PhotoExam';import TheoryExam from './TheoryExam';
export default function ExamHub({demo,adaptiveIds,onAccess}:{demo:boolean;adaptiveIds?:string[];onAccess?:()=>void}){
 const [kind,setKind]=useState<'photo'|'theory'>('photo');
 return <View style={{flex:1}}><View style={s.tabs}>
  <Pressable accessibilityRole="button" accessibilityState={{selected:kind==='photo'}} onPress={()=>setKind('photo')} style={[s.tab,kind==='photo'&&s.active]}><Text style={s.text}>Riconoscimento fotografico</Text></Pressable>
  <Pressable accessibilityRole="button" accessibilityState={{selected:kind==='theory'}} accessibilityHint={demo?'Richiede accesso completo. Apri la schermata di accesso.':undefined} onPress={()=>{if(demo)onAccess?.();else setKind('theory');}} style={[s.tab,kind==='theory'&&s.active]}><Text style={s.text}>Esame teorico{demo?' · completo':''}</Text></Pressable>
 </View>{demo&&<Text style={[s.text,{paddingHorizontal:16,paddingBottom:10}]}>Richiede accesso completo. Tocca Esame teorico per verificare le opzioni disponibili.</Text>}
 <View style={{flex:1,display:kind==='photo'?'flex':'none'}}><PhotoExam demo={demo} adaptiveIds={adaptiveIds}/></View>{kind==='theory'&&!demo&&<TheoryExam/>}</View>;
}
const s=StyleSheet.create({tabs:{flexDirection:'row',gap:8,padding:12},tab:{flex:1,minHeight:52,padding:10,borderWidth:1,borderColor:'#789180',borderRadius:12,justifyContent:'center'},active:{backgroundColor:'#e0eddc',borderWidth:2,borderColor:'#174f2b'},text:{fontSize:14,fontWeight:'700',color:'#174f2b',textAlign:'center'}});
