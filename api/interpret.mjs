import worker from '../backend/worker.mjs';
// Per-instance fallback. For a public paid API, also configure Vercel Firewall limits.
const counters=new Map();
function limiter(limit){return {async limit({key}){const now=Date.now(),id=limit+':'+key;let c=counters.get(id);if(!c||now-c.start>=60000)c={start:now,count:0};c.count++;counters.set(id,c);if(counters.size>5000)for(const [k,v]of counters)if(now-v.start>=60000)counters.delete(k);return {success:c.count<=limit};}};}
export default async function handler(req,res){
 const headers=new Headers();for(const [k,v] of Object.entries(req.headers))if(v!==undefined)headers.set(k,Array.isArray(v)?v.join(','):v);
 // Ignore client-provided Cloudflare headers; use Vercel's proxy-derived address.
 headers.set('CF-Connecting-IP',(req.headers['x-vercel-forwarded-for']||req.socket?.remoteAddress||'unknown').toString().split(',')[0]);
 let body;
 if(req.method==='POST'){
  if(req.body!==undefined){body=typeof req.body==='string'?req.body:JSON.stringify(req.body);}
  else{const chunks=[];let size=0;for await(const c of req){size+=c.length;if(size>16000){res.statusCode=413;res.end();return;}chunks.push(c);}body=Buffer.concat(chunks).toString();}
 }
 const response=await worker.fetch(new Request('https://backend.invalid/interpret',{method:req.method,headers,body}),{
  DEEPSEEK_API_KEY:process.env.DEEPSEEK_API_KEY,
  DEEPSEEK_MODEL:process.env.DEEPSEEK_MODEL||'deepseek-flash',
  ALLOWED_ORIGINS:process.env.ALLOWED_ORIGINS||'https://george351419-sys.github.io',
  REQUEST_LIMITER:limiter(3),SITE_LIMITER:limiter(30),
 });
 res.statusCode=response.status;response.headers.forEach((v,k)=>res.setHeader(k,v));res.end(await response.text());
}
