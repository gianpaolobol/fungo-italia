export function curriculumItemsForLevel<T extends {curriculum?:{level?:string}}>(taxa:T[],level?:'minimum'|'desirable'|'deep'):T[];
