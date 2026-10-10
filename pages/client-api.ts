import {analyze} from '../lib/analyze';
import type {BirthInput,Report} from '../lib/types';
const api=import.meta.env.VITE_INTERPRET_API_URL?.replace(/\/$/,'')||'';
export const assetUrl=(path:string)=>import.meta.env.BASE_URL+path.replace(/^\//,'');
export const imageUnavailableMessage='文字报告已生成。新画像需接通独立的 AI 生图服务，目前不会用示例图片替代你的画像。';
export const availabilityNote='可生成伴侣文字报告；AI 肖像绘制尚未接通。';
export const privacyNote=api?'排盘在浏览器完成；仅将命盘摘要发送给 DeepSeek，不发送姓名、生日原文或地点。':'出生资料仅在当前浏览器计算，不上传、不保存';
export async function imageStatus(){return false;}
export async function createReport(input:BirthInput){
 const report=analyze(input);
 if(!api)return {report:{...report,analysisNote:'基础取象报告 · DeepSeek 后端待配置'},imageReady:false};
 try{
  const {pillars,stars,appearance,traits,relationship}=report;
  const response=await fetch(api+'/interpret',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({pillars,stars,appearance,traits,relationship}),signal:AbortSignal.timeout(50000)});
  if(!response.ok)throw new Error();
  const data=await response.json() as {interpretation:Pick<Report,'summary'|'appearance'|'traits'|'relationship'>};
  const i=data.interpretation;
  if(!i||typeof i.summary!=='string'||!['appearance','traits','relationship'].every(k=>Array.isArray(i[k as keyof typeof i])))throw new Error();
  return {report:{...report,summary:i.summary,appearance:i.appearance,traits:i.traits,relationship:i.relationship,analysisNote:'DeepSeek 辅助解读 · 排盘事实由本地算法计算'},imageReady:false};
 }catch{return {report:{...report,analysisNote:'DeepSeek 暂时不可用，当前显示基础取象报告。'},imageReady:false};}
}
export async function createPortrait(_input:BirthInput):Promise<string>{throw new Error(imageUnavailableMessage);}
