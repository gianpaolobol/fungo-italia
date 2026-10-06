import React,{useEffect,useState} from 'react';
import {Image,Pressable,ScrollView,StyleSheet,Text,View} from 'react-native';
import {VisualReviewItem} from '../src/visualReviewQueue';
function Thumbnail({id,index,onRemove,canRemove}:{id:string;index:number;onRemove?:()=>void;canRemove:boolean}){
 const [uri,setUri]=useState<string|null>(null),[error,setError]=useState('');
 useEffect(()=>{let alive=true;setUri(null);setError('');void import('expo-media-library').then(async({Asset})=>new Asset(id).getUri()).then(value=>{if(alive)setUri(value);}).catch(()=>{if(alive)setError('Fotografia non disponibile: verifica permessi o disponibilità sul dispositivo.');});return()=>{alive=false;};},[id]);
 return <View style={s.card}>{uri?<Image source={{uri}} style={s.image} resizeMode="cover" accessibilityLabel={'Fotografia '+(index+1)} onError={()=>setError('Fotografia non visualizzabile. Verifica la disponibilità sul dispositivo.')}/>:<View style={s.image}><Text style={s.note}>{error?'':'Caricamento…'}</Text></View>}<Text style={s.caption}>Scatto {index+1}</Text>{!!error&&<Text accessibilityRole="alert" style={s.note}>{error}</Text>}{onRemove&&<Pressable accessibilityRole="button" accessibilityLabel={'Rimuovi scatto '+(index+1)+' dalla bozza'} disabled={!canRemove} onPress={onRemove} style={[s.button,!canRemove&&{opacity:.45}]}><Text>Rimuovi dalla bozza</Text></Pressable>}</View>;
}
export default function ObservationPhotos({item,onRemove}:{item:VisualReviewItem;onRemove?:(id:string)=>void}){
 if(!item.assetIds.length)return <Text style={s.note}>Nessuna fotografia selezionata.</Text>;
 return <View><Text style={s.note}>Scatti preselezionati automaticamente. Rimuovi quelli non pertinenti alla stessa osservazione; conserva almeno uno scatto. Gli originali nella libreria non vengono eliminati.</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.row}>{item.assetIds.map((id,i)=><Thumbnail key={id} id={id} index={i} canRemove={item.assetIds.length>1} onRemove={onRemove?()=>onRemove(id):undefined}/>)}</ScrollView></View>;
}
const s=StyleSheet.create({row:{gap:8,paddingVertical:4},card:{width:150,gap:4},image:{width:150,height:150,borderRadius:12,backgroundColor:'#dde5dc',justifyContent:'center',padding:8},caption:{fontSize:12,color:'#506757'},note:{color:'#607268'},button:{minHeight:48,padding:10,borderWidth:1,borderColor:'#ccd8cb',borderRadius:10,justifyContent:'center'}});
