import React from 'react';
import {StyleSheet,Text,View} from 'react-native';
import {mushroomFill} from '../lib/study-timeline.mjs';
const labels=['Le prime basi','Il percorso prende forma','Continua a crescere','Consolida lo studio','Verso un percorso stabile'];
export default function StudyMushroom({stage,score}:{stage:number;score:number|null}){
 const fill=mushroomFill(score);
 return <View accessible accessibilityRole="progressbar" accessibilityLabel="Avanzamento dello studio" accessibilityValue={score===null?{text:'Da valutare'}:{min:0,max:100,now:fill.percent,text:fill.percent+' per cento'}} style={s.garden}>
  <View style={s.picture}><View style={s.halo}/>
  <View style={s.stem}><View style={[s.fill,{height:`${fill.stem}%`}]}/></View>
  <View style={s.cap}><View style={[s.fill,{height:`${fill.cap}%`}]}/></View>
  <View style={s.value}><Text adjustsFontSizeToFit minimumFontScale={0.7} numberOfLines={1} style={s.percent}>{score===null?'—':Math.round(fill.percent)+'%'}</Text></View>
  <View style={s.soil}/></View><Text style={s.stage}>{score===null?'Il tuo percorso inizia qui':'Preparazione stimata dalle verifiche'}</Text>
 </View>;
}
const s=StyleSheet.create({garden:{width:232,alignSelf:'center'},picture:{height:198,width:232},halo:{position:'absolute',top:0,left:6,width:220,height:202,borderRadius:110,backgroundColor:'#e8eee1'},cap:{position:'absolute',top:10,left:10,width:212,height:100,borderTopLeftRadius:110,borderTopRightRadius:110,borderBottomLeftRadius:20,borderBottomRightRadius:20,backgroundColor:'#d9e1d0',overflow:'hidden',borderWidth:2,borderColor:'#779171'},stem:{position:'absolute',top:110,left:95,width:42,height:80,backgroundColor:'#d9e1d0',overflow:'hidden',borderBottomLeftRadius:13,borderBottomRightRadius:13,borderWidth:2,borderColor:'#779171'},fill:{position:'absolute',bottom:0,left:0,right:0,backgroundColor:'#326c4a'},value:{position:'absolute',top:45,left:64,width:104,minHeight:54,alignItems:'center',justifyContent:'center',backgroundColor:'#f9fbf5',borderRadius:25},percent:{fontSize:32,fontWeight:'800',color:'#173e2a',fontVariant:['tabular-nums']},soil:{position:'absolute',top:188,left:36,width:160,height:7,borderRadius:4,backgroundColor:'#a4b697'},stage:{marginTop:6,width:232,textAlign:'center',fontSize:12,lineHeight:17,fontWeight:'600',color:'#496043'}});
