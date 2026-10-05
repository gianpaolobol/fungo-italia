export type Role='public'|'registered'|'owner'|'admin';export type PrecisePoint={latitude:number;longitude:number};
export function mayReadPreciseLocation(role:Role,isOwner:boolean){return role==='admin'||(role==='owner'&&isOwner);}
export function locationForViewer(role:Role,isOwner:boolean,precise:PrecisePoint|null,publicArea:string|null){return mayReadPreciseLocation(role,isOwner)?{precision:'precise' as const,value:precise}:{precision:'generalized' as const,value:publicArea};}
export function assertNoPreciseLocationInPublicExport(value:unknown){const text=JSON.stringify(value);for(const key of ['preciseLocation','latitude','longitude','coordinate_private'])if(text.includes('"'+key+'"'))throw Error('Public export contains private location field: '+key);}
