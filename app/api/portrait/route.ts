import {analyze} from '@/lib/analyze';
import {imageConfig,json,readInput} from '@/lib/server';
import {getChatGPTUser} from '@/app/chatgpt-auth';
export async function POST(request:Request){
 try{
  const user=await getChatGPTUser();if(!user)return json({error:'请登录后生成画像。'},401);
  const report=analyze(await readInput(request));const {key,model}=imageConfig();
  if(!key)return json({error:'画像服务尚未接通。文字报告可以正常生成，接通后即可绘制新画像。'},503);
  const upstream=await fetch('https://api.openai.com/v1/images/generations',{method:'POST',headers:{'Authorization':`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({model,prompt:report.portraitPrompt,n:1,size:'1024x1536',quality:'medium',output_format:'png'}),signal:AbortSignal.timeout(180000)});
  if(!upstream.ok){await upstream.body?.cancel();return json({error:upstream.status===429?'画像服务当前繁忙或额度不足，请稍后再试。':'画像服务暂时不可用，请联系站点管理员检查配置。'},502)}
  const data=await upstream.json() as {data?:{b64_json?:string}[]};const b64=data.data?.[0]?.b64_json;
  if(!b64||b64.length>24000000)return json({error:'画像返回异常，请重试。'},502);
  return json({image:`data:image/png;base64,${b64}`});
 }catch(e){return json({error:e instanceof Error&&e.name==='TimeoutError'?'画像生成时间较长，请稍后重试。':e instanceof Error?e.message:'画像生成失败。'},400)}
}
