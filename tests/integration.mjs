import assert from 'node:assert/strict';
const base='http://127.0.0.1:5173';
const input={name:'测试',date:'1994-02-25',time:'02:30',sex:'female',calendar:'solar',leap:false,place:'北京',timezone:'Asia/Shanghai',partnerGender:'male'};
async function call(overrides={}){const r=await fetch(base+'/api/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...input,...overrides})});return {status:r.status,...await r.json()};}
let r=await call();assert.equal(r.status,200);assert.deepEqual(r.report.pillars,['甲戌','丙寅','壬午','辛丑']);assert.deepEqual(r.report.stars,['天相']);
r=await call({date:'1990-02-13',time:'15:37',sex:'male',partnerGender:'female'});assert.deepEqual(r.report.pillars,['庚午','戊寅','己酉','壬申']);assert.deepEqual(r.report.stars,['太阳']);
let l=await call({date:'1990-01-18',time:'15:37',sex:'male',calendar:'lunar'});assert.deepEqual(l.report.pillars,r.report.pillars);
r=await call({date:'2025-06-10',calendar:'lunar',leap:true});assert.equal(r.status,200);assert.match(r.report.conventions[0],/2025-8-3/);
r=await call({date:'1990-07-01',time:'15:00'});assert.match(r.report.conventions[2],/14:00/);
r=await call({date:'1994-02-30'});assert.equal(r.status,400);
r=await call({time:''});assert.equal(r.status,400);
r=await call({date:'2025-05-10',calendar:'lunar',leap:true});assert.equal(r.status,400);
r=await call({date:'2021-11-07',time:'01:30',timezone:'America/New_York'});assert.equal(r.status,400);
r=await call({date:'2021-03-14',time:'02:30',timezone:'America/New_York'});assert.equal(r.status,400);
r=await call({date:'2099-01-01'});assert.equal(r.status,400);
const p=await fetch(base+'/api/portrait',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)});assert.ok([401,503].includes(p.status));
console.log('PASS: both chart fixtures, lunar equivalence, leap month, DST, invalid date/time, DST fold/gap, future date, missing provider.');
