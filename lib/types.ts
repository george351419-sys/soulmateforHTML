export type BirthInput = {name:string;date:string;time:string;sex:'female'|'male';calendar:'solar'|'lunar';leap:boolean;place:string;timezone:string;partnerGender:'male'|'female';};
export type Section = {title:string;body:string;basis?:string};
export type Report = {name:string;title:string;summary:string;tags:string[];appearance:Section[];traits:Section[];relationship:Section[];pillars:string[];stars:string[];evidence:string[];conventions:string[];portraitPrompt:string;partnerGender:'male'|'female';};
