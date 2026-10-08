import {env} from 'cloudflare:workers';
export function imageConfig(){const e=env as unknown as Record<string,string|undefined>;return {key:e.OPENAI_API_KEY||'',model:e.IMAGE_MODEL||'gpt-image-2'};}
export function json(data:unknown,status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}})}
export async function readInput(request:Request){
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)throw new Error('请求来源不匹配，请从本站提交。');
 if(!request.headers.get('content-type')?.includes('application/json'))throw new Error('仅接受 JSON 请求。');
 const text=await request.text();if(text.length>5000)throw new Error('输入过长。');try{return JSON.parse(text)}catch{throw new Error('输入格式无效。')}
}
