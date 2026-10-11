import assert from 'node:assert/strict';
import worker from '../backend/worker.mjs';
const origin='https://george351419-sys.github.io';
const section={title:'取象',body:'倾向重视协调，需在真实互动中观察。'};
const input={pillars:['甲戌','丙寅','壬午','辛丑'],stars:['天相'],appearance:[section],traits:[section],relationship:[section]};
const env={ALLOWED_ORIGINS:origin,DEEPSEEK_API_KEY:'test-only-not-a-real-key',REQUEST_LIMITER:{limit:async()=>({success:true})},SITE_LIMITER:{limit:async()=>({success:true})}};
const req=(value=input,o=origin)=>new Request('https://example.test/interpret',{method:'POST',headers:{Origin:o,'Content-Type':'application/json'},body:JSON.stringify(value)});
assert.equal((await worker.fetch(req(input,'https://untrusted.test'),env)).status,403);
assert.equal((await worker.fetch(req(),{...env,DEEPSEEK_API_KEY:''})).status,503);
assert.equal((await worker.fetch(req({...input,name:'must not be sent'}),env)).status,400);
assert.equal((await worker.fetch(req(),{...env,REQUEST_LIMITER:{limit:async()=>({success:false})}})).status,429);
const original=globalThis.fetch;let called=false;
try{
 globalThis.fetch=async(url,options)=>{called=true;assert.equal(url,'https://api.deepseek.com/chat/completions');const body=JSON.parse(options.body);assert.equal(body.model,'deepseek-flash');const sent=JSON.parse(body.messages[1].content);assert.deepEqual(sent.spousePalaceMainStars,input.stars);assert.equal(sent.stars,undefined);assert.equal(sent.name,undefined);return Response.json({choices:[{message:{content:JSON.stringify({summary:'仅为传统取象。',appearance:[section],traits:[section],relationship:[section]})}}]});};
 const response=await worker.fetch(req(),env);assert.equal(response.status,200);assert.equal(response.headers.get('Access-Control-Allow-Origin'),origin);assert.equal((await response.json()).provider,'DeepSeek');assert.ok(called);
 globalThis.fetch=async()=>Response.json({choices:[{message:{content:'not json'}}]});assert.equal((await worker.fetch(req(),env)).status,502);
}finally{globalThis.fetch=original;}
console.log('PASS DeepSeek proxy: origin, missing secret, input minimization, rate limit, request format, validated response, malformed output.');
