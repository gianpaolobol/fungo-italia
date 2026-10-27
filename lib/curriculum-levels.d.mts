export function curriculumItemsForLevel<T extends {curriculum?:{level?:string}}>(taxa:T[],level?:'minimum'|'desirable'|'deep'):T[];
export function buildObjectiveModules(taxa:{id:string;kind?:string;curriculum?:{objectiveId?:string}}[],objectives:any[]):any[];
