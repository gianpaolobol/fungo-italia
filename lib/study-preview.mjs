export function previewCases(bank){return ['free','conditional','deadly'].map(category=>bank.find(c=>c.category===category)).filter(Boolean);}
