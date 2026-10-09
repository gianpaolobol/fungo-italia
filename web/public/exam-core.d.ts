export const foodLabels: Record<string, string>;
export function selectCases<T extends {id:string;category:string}>(bank:T[],count?:number,rng?:()=>number):T[];
export function gradeAnswer(c:{acceptedNames:string[];category:string},answer:{name?:string;category?:string;detail?:string}):{name:boolean;category:boolean;detail:null;danger:boolean};
