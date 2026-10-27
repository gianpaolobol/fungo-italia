import React from 'react';
import {Pressable,StyleSheet,View} from 'react-native';

/** Shared native/web drawing keeps the subscription entry independent of emoji fonts. */
export default function MushroomAccess({selected,onPress}:{selected:boolean;onPress:()=>void}){
 return <Pressable testID="subscription-access" accessibilityRole="button" accessibilityLabel="Abbonamento" accessibilityHint="Apri o gestisci l’abbonamento annuale" accessibilityState={{expanded:selected}} onPress={onPress} style={[s.button,selected&&s.selected]}>
  <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={s.mushroom}>
   <View style={s.coin}/><View style={s.stem}/><View style={s.cap}><View style={s.slot}/></View>
  </View>
 </Pressable>;
}
const s=StyleSheet.create({
 button:{width:48,minHeight:48,flexShrink:0,alignItems:'center',justifyContent:'center',borderRadius:14,borderWidth:1,borderColor:'#a2b398',backgroundColor:'#fff'},
 selected:{backgroundColor:'#e7f0e2',borderColor:'#174f2b'},
 mushroom:{width:30,height:30},
 stem:{position:'absolute',width:10,height:17,left:10,bottom:0,borderRadius:4,backgroundColor:'#174f2b'},
 cap:{position:'absolute',top:9,left:0,width:30,height:17,borderTopLeftRadius:18,borderTopRightRadius:18,borderBottomLeftRadius:5,borderBottomRightRadius:5,backgroundColor:'#174f2b',overflow:'hidden'},
 coin:{position:'absolute',top:0,left:12,width:7,height:10,borderRadius:4,borderWidth:1,borderColor:'#8b6c22',backgroundColor:'#dfc878'},slot:{position:'absolute',top:4,left:10,width:10,height:2,borderRadius:1,backgroundColor:'#0b2d17'},spot:{position:'absolute',width:5,height:4,borderRadius:3,backgroundColor:'#f4f7f2'},
 left:{left:5,top:11},top:{left:13,top:5},right:{right:4,top:12},
});
