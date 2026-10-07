import React from 'react';
import {Linking,Pressable,Text,View} from 'react-native';
export type Commercialization={
 product:'fresh';wholeCard:boolean;reviewedAt:string;context:string;conditions:string;
 genusProvision?:{genus:string;label:string;source:{id:string;title:string;url:string;scope:string}};
 members:{scientificName:string;status:'national'|'regional'|'banned';label:string;regions:string[];sources:{id:string;title:string;url:string;scope:'national'|'regional'|'taxonomy';region?:string}[]}[];
};
type Taxon={scientificName:string;rank?:string;kind?:string;commercialization?:Commercialization};
const safe=(url:string)=>/^https:\/\/[a-z0-9.-]+(?::[0-9]+)?(?:[/?#][^\s]*)?$/i.test(url);
function Badge({member}:{member:Commercialization['members'][number]}){
 const banned=member.status==='banned',regional=member.status==='regional';
 return <Text style={{alignSelf:'flex-start',fontSize:12,lineHeight:18,fontWeight:'700',paddingHorizontal:8,paddingVertical:3,borderRadius:9,borderWidth:1,borderColor:banned?'#ba7773':regional?'#8ba4af':'#769780',backgroundColor:banned?'#f7eceb':regional?'#eef2f5':'#eaf3e9',color:banned?'#8a2825':regional?'#244859':'#174f2b'}}>{member.label}</Text>;
}
export default function CommercializationInfo({taxon:t,Fold}:{taxon:Taxon;Fold:React.ComponentType<{title:string;children:React.ReactNode}>}){
 const c=t.commercialization;if(!c)return null;
 return <View style={{gap:6}}>{c.wholeCard&&<Badge member={c.members[0]}/>}<Fold title={c.wholeCard?'Commercializzazione · riferimenti':'Specie commerciabili comprese nella scheda'}>
 {!c.wholeCard&&<Text style={{fontSize:13,lineHeight:19,color:'#435c49'}}>{c.genusProvision?'Le specie elencate sono esempi dell’ambito previsto per il genere.':'Le indicazioni riguardano solo le specie elencate.'}</Text>}
 {c.genusProvision&&<Text style={{fontSize:13,lineHeight:19,color:'#435c49'}}>{c.genusProvision.label}</Text>}
 {c.members.map(member=><View key={member.scientificName} style={{gap:4,marginVertical:7}}>{!c.wholeCard&&<Text style={{fontSize:14,fontWeight:'700',color:'#243f2c'}}>{member.scientificName}</Text>}{!c.wholeCard&&<Badge member={member}/>} {member.sources.filter(source=>safe(source.url)).map(source=><Pressable key={source.id} accessibilityRole="link" accessibilityLabel={source.title} onPress={()=>{void Linking.openURL(source.url).catch(()=>{});}} style={{minHeight:44,justifyContent:'center'}}><Text style={{fontSize:12,lineHeight:18,color:'#174f2b',textDecorationLine:'underline'}}>{source.title}</Text></Pressable>)}</View>)}
 <Text style={{fontSize:13,lineHeight:19,color:'#435c49'}}>{c.context}</Text><Text style={{fontSize:13,lineHeight:19,color:'#435c49'}}>{c.conditions}</Text><Text style={{fontSize:13,lineHeight:19,color:'#435c49'}}>La commerciabilità è distinta dalla commestibilità e non certifica gli esemplari raccolti. Le integrazioni regionali indicate sono quelle verificate per questa scheda.</Text>
 </Fold></View>;
}
