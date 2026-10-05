export type PhotoMeta={id:string;width:number|null;height:number|null;creationTime:number|null;isFavorite?:boolean};
export type SelectedPhoto={assetId:string;score:number;reasons:string[]};
export function rankObservationPhotos(photos:PhotoMeta[],max=8):SelectedPhoto[]{
 const times=photos.map(p=>p.creationTime).filter((x):x is number=>x!==null);
 const mid=times.length?(Math.min(...times)+Math.max(...times))/2:null;
 return photos.map(p=>{let score=0;const reasons:string[]=[];const pixels=(p.width||0)*(p.height||0);
  if(pixels>=12_000_000){score+=3;reasons.push('alta risoluzione');}else if(pixels>=4_000_000){score+=2;reasons.push('buona risoluzione');}
  if(p.width&&p.height){const ratio=Math.max(p.width,p.height)/Math.min(p.width,p.height);if(ratio<1.8){score+=1;reasons.push('inquadratura equilibrata');}}
  if(p.isFavorite){score+=1;reasons.push('preferita');}
  if(mid!==null&&p.creationTime!==null){const d=Math.abs(p.creationTime-mid);if(d<60_000){score+=1;reasons.push('centrale nella sequenza');}}
  return {assetId:p.id,score,reasons};
 }).sort((a,b)=>b.score-a.score).slice(0,max);
}
