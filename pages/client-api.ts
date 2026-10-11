import {analyze} from '../lib/analyze';
import serviceConfig from './service-config.json';
import type {BirthInput,Report} from '../lib/types';
const api=(import.meta.env.VITE_INTERPRET_API_URL||serviceConfig.apiUrl).replace(/\/$/,'');
export const assetUrl=(path:string)=>import.meta.env.BASE_URL+path.replace(/^\//,'');
export const imageUnavailableMessage='文字报告已生成。画像服务暂不可用，请稍后重试。';
export const availabilityNote='画像服务暂不可用，文字解读仍可使用。';
export const privacyNote=api?'出生信息在浏览器内计算；服务只接收去除身份信息后的摘要，不发送姓名、生日原文或地点。':'出生资料仅在当前浏览器计算，不上传、不保存';
export async function imageStatus(){if(!api)return false;try{const r=await fetch(api+'/api/status',{signal:AbortSignal.timeout(8000)});return r.ok&&(await r.json() as {imageReady?:boolean}).imageReady===true;}catch{return false;}}
export async function createReport(input:BirthInput){
 const report=analyze(input);
 const imageReady=await imageStatus();
 if(!api)return {report:{...report,analysisNote:'你的专属描述已生成'},imageReady};
 try{
  const {pillars,stars,appearance,traits,relationship}=report;
  const response=await fetch(api+'/interpret',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({pillars,stars,appearance,traits,relationship}),signal:AbortSignal.timeout(50000)});
  if(!response.ok)throw new Error();
  const data=await response.json() as {interpretation:Pick<Report,'summary'|'appearance'|'traits'|'relationship'>};
  const i=data.interpretation;
  if(!i||typeof i.summary!=='string'||!['appearance','traits','relationship'].every(k=>Array.isArray(i[k as keyof typeof i])))throw new Error();
  return {report:{...report,summary:i.summary,appearance:i.appearance,traits:i.traits,relationship:i.relationship,analysisNote:'你的专属描述已生成'},imageReady};
 }catch{return {report:{...report,analysisNote:'智能润色暂时不可用，当前显示基础描述。'},imageReady};}
}
export async function createPortrait(input:BirthInput):Promise<string>{
 const report=analyze(input);
 const response=await fetch(api+'/api/portrait',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({gender:report.partnerGender,features:report.appearance.slice(0,2).map(s=>s.body)}),signal:AbortSignal.timeout(125000)});
 const data=await response.json() as {image?:string;error?:string};
 if(!response.ok||!data.image)throw new Error(data.error||'画像生成失败，请稍后重试。');return data.image;
}
