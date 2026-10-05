import React from 'react';
import {Image,ScrollView,StyleSheet,Text,View} from 'react-native';
import {VisualReviewItem} from '../src/visualReviewQueue';

export default function ObservationPhotos({item}:{item:VisualReviewItem}){
 if(!item.assetIds.length)return <Text style={s.note}>Nessuna fotografia selezionata.</Text>;
 return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.row}>
  {item.assetIds.map((id,i)=><View key={id} style={s.card}>
   <Image source={{uri:'ph://'+id}} style={s.image} resizeMode="cover"/>
   <Text style={s.caption}>Scatto {i+1}</Text>
  </View>)}
 </ScrollView>;
}
const s=StyleSheet.create({row:{gap:8,paddingVertical:4},card:{width:150,gap:4},image:{width:150,height:150,borderRadius:12,backgroundColor:'#dde5dc'},caption:{fontSize:12,color:'#506757'},note:{color:'#607268'}});
