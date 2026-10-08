import type {BirthInput,Report} from './types';
export const assetUrl=(path:string)=>path;
export const imageUnavailableMessage='画像服务尚未接通。你的专属文字报告已生成，接通后即可绘制新画像。';
export const availabilityNote='文字解读已可用，画像服务待接通。';
export const privacyNote='不保存出生资料到浏览器或历史记录';
export async function imageStatus(){const r=await fetch('/api/status');return (await r.json() as {imageReady:boolean}).imageReady;}
export async function createReport(input:BirthInput){
 const r=await fetch('/api/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)});
 const d=await r.json() as {error?:string;report:Report;imageReady:boolean};if(!r.ok)throw new Error(d.error||'请检查出生信息后重试。');return d;
}
export async function createPortrait(input:BirthInput){
 const r=await fetch('/api/portrait',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)});
 const d=await r.json() as {error?:string;image:string};if(!r.ok)throw new Error(d.error||'画像生成失败，请稍后重试。');return d.image;
}
