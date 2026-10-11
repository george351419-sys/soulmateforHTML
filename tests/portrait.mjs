import assert from 'node:assert/strict';
import handler from '../api/portrait.mjs';
process.env.ARK_API_KEY='test-secret';
process.env.ALLOWED_ORIGINS='https://example.com';
let sent;
globalThis.fetch=async(url,opts)=>{sent={url,...JSON.parse(opts.body)};return {ok:true,json:async()=>({data:[{url:'https://example.com/image.png'}]})};};
let n=0;
async function call(body,origin='https://example.com'){
 const req={method:'POST',headers:{origin,'x-vercel-forwarded-for':String(++n)},body};
 const res={setHeader(){},end(value){this.data=JSON.parse(value);}};
 await handler(req,res);return res;
}
assert.equal((await call({gender:'male',features:['自然清秀']})).statusCode,200);
assert.equal(sent.model,'doubao-seedream-5-0-flash-260915');
assert.equal(sent.watermark,false);
await call({gender:'female',features:['自然清秀']});
assert.match(sent.prompt,/24至27岁的年轻成年女性/);
assert.equal((await call({gender:'male',features:['自然'],name:'private'})).statusCode,400);
assert.equal((await call({gender:'male',features:['自然']},'https://bad.com')).statusCode,403);
globalThis.fetch=async()=>({ok:true,json:async()=>({data:[{url:'javascript:bad'}]})});
assert.equal((await call({gender:'female',features:['自然']})).statusCode,502);
delete process.env.ARK_API_KEY;
assert.equal((await call({gender:'female',features:['自然']})).statusCode,503);
console.log('PASS portrait: payload, privacy schema, origin, response validation, missing secret.');
