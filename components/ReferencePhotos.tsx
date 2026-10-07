import React,{useState} from 'react';
import {Image,Linking,Modal,Pressable,ScrollView,StyleSheet,Text,View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {referenceImageAssets} from '../src/data/reference-image-assets';
export type ReferenceImage={src:string;view:'lateral'|'top'|'underside';alt:string;credit:string;subjectTaxon?:string;sourceUrl?:string;licenseUrl?:string};
const publicHttps=(value?:string)=>typeof value==='string'&&/^https:\/\/[a-z0-9.-]+(?::[0-9]+)?(?:[/?#][^\s]*)?$/i.test(value);
const views=[['lateral','Fianco'],['top','Sopra'],['underside','Sotto']] as const;
const referenceLabel=(photo:ReferenceImage|undefined|null,fallback:string)=>photo?.alt.endsWith(' — base esterna')?'Base esterna':fallback;
export default function ReferencePhotos({taxon}:{taxon:{scientificName:string;referenceImages?:ReferenceImage[]}}){
 const [selected,setSelected]=useState<ReferenceImage|null>(null),[zoom,setZoom]=useState(1),[width,setWidth]=useState(320);
 const photos=taxon.referenceImages||[],subjects=[...new Set((taxon.referenceImages||[]).map(p=>p.subjectTaxon).filter(Boolean))];
 if(!photos.length)return <Text style={styles.pending}>Immagini di riferimento non ancora disponibili.</Text>;
 const asset=selected?referenceImageAssets[selected.src]:undefined;
 const dimensions=asset?Image.resolveAssetSource(asset):null;
 const imageWidth=Math.max(240,width-24)*zoom,imageHeight=dimensions?.height&&dimensions.width?imageWidth*dimensions.height/dimensions.width:imageWidth;
 const close=()=>{setSelected(null);setZoom(1);};
 return <View>
  {subjects.length===1&&subjects[0]!==taxon.scientificName&&<Text style={styles.subject}>Specie raffigurata: {subjects[0]}</Text>}
  <View style={styles.triptych}>{views.map(([view,label])=>{
   const photo=photos.find(p=>p.view===view),source=photo?referenceImageAssets[photo.src]:undefined;
   const caption=referenceLabel(photo,label);
   return <View key={view} style={styles.cell}>{photo&&source?<Pressable accessibilityRole="button" accessibilityLabel={'Ingrandisci vista '+caption.toLowerCase()+' di '+(photo.subjectTaxon||taxon.scientificName)} onPress={()=>{setSelected(photo);setZoom(1);}} style={styles.thumbnail}><Image source={source} accessibilityLabel={photo.alt} style={styles.image} resizeMode="contain"/></Pressable>:<View style={styles.thumbnail}><Text style={styles.pending}>Vista non disponibile</Text></View>}<Text style={styles.caption}>{caption}</Text>{subjects.length>1&&photo?.subjectTaxon&&photo.subjectTaxon!==taxon.scientificName&&<Text style={styles.subject}>{photo.subjectTaxon}</Text>}</View>;
  })}</View>
  <Modal visible={!!selected} animationType="fade" onRequestClose={close}>
   <SafeAreaView style={styles.viewer} onLayout={event=>setWidth(event.nativeEvent.layout.width)}>
    <View style={styles.controls}><Pressable accessibilityRole="button" onPress={close} style={styles.button}><Text>Chiudi immagine</Text></Pressable><Text style={styles.title}>{selected?.subjectTaxon||taxon.scientificName}{selected?' · '+referenceLabel(selected,views.find(([view])=>view===selected.view)?.[1]||''):''}</Text></View>
    <View style={styles.controls}><Pressable accessibilityRole="button" accessibilityState={{disabled:zoom<=1}} disabled={zoom<=1} onPress={()=>setZoom(z=>Math.max(1,z-.5))} style={styles.button}><Text>Riduci</Text></Pressable><Text accessibilityLiveRegion="polite">{Math.round(zoom*100)}%</Text><Pressable accessibilityRole="button" accessibilityState={{disabled:zoom>=4}} disabled={zoom>=4} onPress={()=>setZoom(z=>Math.min(4,z+.5))} style={styles.button}><Text>Ingrandisci</Text></Pressable></View>
    <ScrollView style={styles.stage} nestedScrollEnabled><ScrollView horizontal nestedScrollEnabled contentContainerStyle={styles.canvas}>{asset&&selected&&<Image source={asset} accessibilityLabel={selected.alt} resizeMode="contain" style={{width:imageWidth,height:imageHeight}}/>}</ScrollView></ScrollView>
    <ScrollView style={styles.creditBox}><Text selectable style={styles.credit}>{selected?.credit}</Text>{([['sourceUrl','Fonte'],['licenseUrl','Licenza']] as const).map(([field,label])=>selected&&publicHttps(selected[field])?<Pressable key={field} accessibilityRole="link" accessibilityLabel={label+' della fotografia'} onPress={()=>{void Linking.openURL(selected[field]!).catch(()=>{});}} style={styles.button}><Text>{label}</Text></Pressable>:null)}</ScrollView>
   </SafeAreaView>
  </Modal>
 </View>;
}
const styles=StyleSheet.create({triptych:{flexDirection:'row',gap:7,marginVertical:10},cell:{flex:1,minWidth:0},thumbnail:{aspectRatio:1,backgroundColor:'#eef2eb',borderRadius:10,overflow:'hidden',alignItems:'center',justifyContent:'center',minHeight:44},image:{width:'100%',height:'100%'},caption:{fontSize:12,textAlign:'center',marginTop:4,color:'#193c27'},subject:{fontSize:11,textAlign:'center',color:'#4b5f50',marginTop:2},pending:{fontSize:12,color:'#4b5f50',marginVertical:8,textAlign:'center'},viewer:{flex:1,backgroundColor:'#f7faf5'},controls:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:8,paddingHorizontal:12,paddingVertical:6},button:{minHeight:44,minWidth:44,padding:10,borderRadius:10,backgroundColor:'#e3eddf',justifyContent:'center'},title:{flex:1,fontWeight:'600',fontSize:16},stage:{flex:1,backgroundColor:'#e3eadd'},canvas:{padding:12,alignItems:'flex-start'},creditBox:{maxHeight:110,padding:12},credit:{fontSize:12,color:'#4b5f50',lineHeight:18}});
