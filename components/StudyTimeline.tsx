import React,{useState} from 'react';
import {StyleSheet,Text,View} from 'react-native';
import type {ProgressPoint} from '../lib/study-timeline.mjs';
export default function StudyTimeline({points}:{points:ProgressPoint[]}){
 const [width,setWidth]=useState(280);
 if(!points.length)return <Text style={s.note}>Qui vedrai il tuo andamento dopo le prime risposte.</Text>;
 const change=(points.at(-1)?.score||0)-(points[0].score||0),left=30,right=12,top=12,height=150,usable=Math.max(1,width-left-right);
 const first=Date.parse(points[0].at),last=Date.parse(points.at(-1)!.at);
 const xy=points.map((p,i)=>({x:left+(last>first?(Date.parse(p.at)-first)/(last-first):points.length>1?i/(points.length-1):.5)*usable,y:top+(100-(p.score||0))/100*height}));
 return <View style={{gap:12}}>{points.length>1&&<Text style={s.change}>{change>0?'+':''}{change} punti dalla prima prova rappresentata</Text>}
 <View onLayout={e=>setWidth(e.nativeEvent.layout.width)} style={{height:200}} accessibilityRole="image" accessibilityLabel={'Andamento della preparazione. '+points.map(p=>new Date(p.at).toLocaleDateString('it-IT')+': '+p.score+' per cento').join('; ')}>
 {[0,25,50,75,100].map(v=><View key={v} style={{position:'absolute',top:top+(100-v)/100*height,left:0,right:0,flexDirection:'row',alignItems:'center',gap:4}}><Text style={{width:26,fontSize:10,color:'#586655'}}>{v}%</Text><View style={{flex:1,height:1,backgroundColor:'#dce5d7'}}/></View>)}
 {xy.slice(1).map((p,i)=>{const a=xy[i],dx=p.x-a.x,dy=p.y-a.y,length=Math.hypot(dx,dy);return <View key={'line'+i} style={{position:'absolute',left:(a.x+p.x)/2-length/2,top:(a.y+p.y)/2-1.5,width:length,height:3,backgroundColor:'#285f40',transform:[{rotate:Math.atan2(dy,dx)+'rad'}]}}/>;})}
 {xy.map((p,i)=><View key={points[i].sessionId} style={{position:'absolute',left:p.x-4,top:p.y-4,width:8,height:8,borderRadius:4,backgroundColor:'#285f40',borderWidth:1,borderColor:'#fff'}}/>)}
 <View style={{position:'absolute',left,right,bottom:0,flexDirection:'row',justifyContent:'space-between'}}><Text style={s.note}>{new Date(points[0].at).toLocaleDateString('it-IT',{day:'2-digit',month:'2-digit'})}</Text>{points.length>1&&<Text style={s.note}>{new Date(points.at(-1)!.at).toLocaleDateString('it-IT',{day:'2-digit',month:'2-digit'})}</Text>}</View>
 </View><Text style={s.note}>Preparazione stimata nel tempo · scala 0–100%. Le distanze orizzontali rappresentano il tempo trascorso.</Text></View>;
}
const s=StyleSheet.create({note:{fontSize:12,lineHeight:19,color:'#586655'},change:{fontSize:17,fontWeight:'700',color:'#285f40'}});
