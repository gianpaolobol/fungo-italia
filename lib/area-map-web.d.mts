export const OSM_TILES:string;
export function mountWebAreaMap(container:HTMLDivElement,areas:{id:string;name:string;region:string;center:[number,number]}[],post:(message:{ready?:boolean;error?:boolean;id?:string})=>void,options?:{tileUrl?:string;signal?:AbortSignal}):Promise<()=>void>;
