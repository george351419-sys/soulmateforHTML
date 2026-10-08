import {z} from 'zod';
import {Solar,Lunar} from 'lunar-javascript';
import {astro} from 'iztro';
import {generateChart} from './ziwei/algorithm';
import {themes,elements} from './interpretations';
import type {BirthInput,Report,Section} from './types';
export const birthSchema=z.object({name:z.string().trim().min(1,'请填写姓名或昵称').max(30),date:z.string().regex(/^\d{4}-\d{1,2}-\d{1,2}$/,'日期请填写为 YYYY-MM-DD'),time:z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/,'请填写有效出生时间'),sex:z.enum(['male','female']),calendar:z.enum(['solar','lunar']),leap:z.boolean(),place:z.string().trim().min(1,'请填写出生地点').max(80),timezone:z.enum(['Asia/Shanghai','Asia/Hong_Kong','Asia/Taipei','Asia/Singapore','Asia/Tokyo','America/New_York','America/Los_Angeles','Europe/London','Europe/Paris','Australia/Sydney']),partnerGender:z.enum(['male','female'])}).strict();
function wallParts(ms:number,tz:string){const p=new Intl.DateTimeFormat('en-GB',{timeZone:tz,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(new Date(ms));const get=(k:string)=>Number(p.find(x=>x.type===k)?.value);return Date.UTC(get('year'),get('month')-1,get('day'),get('hour'),get('minute'),get('second'));}
function offset(ms:number,tz:string){return wallParts(ms,tz)-ms;}
export function normalizedBirth(input:BirthInput){
 let [y,m,d]=input.date.split('-').map(Number);const [h,mi]=input.time.split(':').map(Number);
 if(y<1901||y>2100||m<1||m>12||d<1||d>31)throw new Error('日期超出支持范围，请输入 1901–2100 年的有效日期。');
 if(input.leap&&input.calendar!=='lunar')throw new Error('公历日期不能选择闰月。');
 if(input.calendar==='lunar'){try{const l=Lunar.fromYmdHms(y,input.leap?-m:m,d,h,mi,0);if(l.getYear()!==y||l.getMonth()!==(input.leap?-m:m)||l.getDay()!==d)throw new Error();const s=l.getSolar();y=s.getYear();m=s.getMonth();d=s.getDay();}catch{throw new Error('农历日期或闰月无效，请检查月份、日期和闰月选项。')}}
 const local=Date.UTC(y,m-1,d,h,mi);const check=new Date(local);if(check.getUTCFullYear()!==y||check.getUTCMonth()+1!==m||check.getUTCDate()!==d)throw new Error('出生日期不存在，请检查月份和天数。');
 // Find all UTC instants corresponding to the supplied wall clock; reject ambiguous DST folds/gaps.
 const candidates=new Set<number>();for(const probe of [local-86400000,local,local+86400000]){const utc=local-offset(probe,input.timezone);if(wallParts(utc,input.timezone)===local)candidates.add(utc);}
 if(candidates.size!==1)throw new Error('这个钟点处于夏令时跳变或重复区间，请核对出生记录后再试。');
 const utc=[...candidates][0];if(utc>Date.now())throw new Error('出生日期不能晚于今天。');
 const actual=local-utc;const standard=Math.min(offset(Date.UTC(y,0,15,12),input.timezone),offset(Date.UTC(y,6,15,12),input.timezone));
 const dst=actual-standard;const date=new Date(local-dst);
 return {year:date.getUTCFullYear(),month:date.getUTCMonth()+1,day:date.getUTCDate(),hour:date.getUTCHours(),minute:date.getUTCMinutes(),dstMinutes:dst/60000,solarInput:`${y}-${m}-${d} ${input.time}`,normalized:date.toISOString().slice(0,16).replace('T',' ')};
}
const wx:Record<string,string>={甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水'};
const control:Record<string,string>={木:'土',火:'金',土:'水',金:'木',水:'火'};
export function analyze(value:unknown):Report{
 const parsed=birthSchema.safeParse(value);if(!parsed.success)throw new Error(parsed.error.issues[0]?.message||'请检查出生信息。');const input=parsed.data;const n=normalizedBirth(input);
 const lunar=Solar.fromYmdHms(n.year,n.month,n.day,n.hour,n.minute,0).getLunar();const eight=lunar.getEightChar();eight.setSect(2);
 const pillars=[eight.getYear(),eight.getMonth(),eight.getDay(),eight.getTime()];
 astro.config({dayDivide:'current'});const timeIndex=n.hour===23?12:Math.floor((n.hour+1)/2);
 const chart=generateChart({year:n.year,month:n.month,day:n.day,hour:timeIndex,gender:input.sex});
 const spouse=chart.palaces.find(p=>p.branch===(chart.mingGongBranch+10)%12)!;
 if(!spouse)throw new Error('夫妻宫计算失败，请检查日期。');
 const main=spouse.stars.filter(s=>s.type==='major').map(s=>s.name);
 const used=main.length?main:(spouse.borrowedStars||[]);const chosen=used.map(s=>themes[s]).filter(Boolean);if(!chosen.length)throw new Error('当前星系暂无法解读，请核对排盘。');
 const names=used.join('、');const mainBasis=main.length?`夫妻宫${names}`:`夫妻宫无主星，采用借对宫法参考${names}`;
 const day=pillars[2][0],dayElement=wx[day];const partnerElement=input.sex==='male'?control[dayElement]:Object.keys(control).find(k=>control[k]===dayElement)!;
 const spouseStems=(['甲','乙','丙','丁','戊','己','庚','辛','壬','癸']).filter(g=>wx[g]===partnerElement);
 const hidden=[eight.getYearHideGan(),eight.getMonthHideGan(),eight.getDayHideGan(),eight.getTimeHideGan()];
 const positions=spouseStems.map(g=>{const loc=pillars.flatMap((p,i)=>[...(p[0]===g?[`${['年','月','日','时'][i]}干`]:[]),...(hidden[i].includes(g)?[`${['年','月','日','时'][i]}支藏干`]:[])]);return loc.length?`${g}见于${loc.join('、')}`:''}).filter(Boolean);
 const palaceBranch=pillars[2][1];const palaceStyle='子午卯酉'.includes(palaceBranch)?'夫妻宫地支的传统口诀偏向端正、清秀的形象。':'辰戌丑未'.includes(palaceBranch)?'夫妻宫地支的传统口诀偏向朴实、厚重的形象。':'夫妻宫地支的传统口诀偏向自然、灵动的形象，无法据此区分具体颜值。';
 const combined=chosen.map(t=>t.tag);const neutralTitle=chosen.length>1?`${combined[0]}，\n亦有${combined[1]}`:`${combined[0]}，\n自有其风采`;
 const appearance:Section[]=[{title:'轮廓与五官',body:chosen.map(t=>t.face).join(' 两种取象并置时，'),basis:mainBasis},{title:'八字的补充意象',body:`${palaceStyle}配偶星五行属${partnerElement}，${elements[partnerElement].face}。若与紫微描述不同，应保留差异，不据此锁定具体脸型。`,basis:`日支${palaceBranch}；传统${input.sex==='male'?'财星':'官杀'}取配偶`},{title:'画像中的创作选择',body:'具体五官、肤色、发型、衣着和约三十岁的年龄感属于艺术选择。不能从命盘确定身高、眼皮形态或真实年龄差。'}];
 const traits:Section[]=[{title:'性格倾向',body:chosen.map(t=>t.temperament).join(' 同时，'),basis:mainBasis},{title:'能力与做事风格',body:chosen.map(t=>t.ability).join(' 同时，'),basis:'星曜的现代行为转述，不是能力测评'},{title:'责任与关系中的角色',body:`八字以${partnerElement}为配偶星五行，属于传统的角色定位。${positions.length?positions.join('；')+'。':'原局未见明显配偶星，不能因此判断没有伴侣。'}不能仅凭这个角色，把对方说成有钱、强势或必然可靠。`,basis:`${day}${dayElement}日主，${input.sex==='male'?'财星':'官杀'}取配偶`}];
 const relationship:Section[]=[{title:'表达关心的方式',body:chosen.map(t=>t.care).join(' 同时，'),basis:mainBasis},{title:'可能出现的摩擦',body:chosen.map(t=>t.friction).join(' 同时，'),basis:'优势的另一面，须由真实互动验证'},{title:'在现实中慢慢确认',body:chosen.map(t=>t.observe).join(' ')+' 如果现实与描述不符，应接受描述不成立，不把任何行为都解释为应验。'}];
 const branches='子丑寅卯辰巳午未申酉戌亥';
 return {name:input.name,title:neutralTitle,summary:`以${combined.join('、')}为视觉主调，结合${partnerElement}的${elements[partnerElement].style}意象，形成一幅自然的伴侣想象肖像。这里描绘的是传统符号启发的一种可能。`,tags:combined,pillars,stars:main,evidence:[`紫微夫妻宫在${branches[spouse.branch]}，${mainBasis}。`,`八字日主${day}，日支${palaceBranch}为夫妻宫；配偶星五行为${partnerElement}。`,positions.join('；')||'配偶星未明显出现，不补造信息。','两套体系的描述相容不构成独立验证；没有推断职业、收入或忠诚度。'],conventions:[`${input.calendar==='solar'?'公历':'农历'+(input.leap?'闰月':'')}输入；换算公历 ${n.solarInput}。`,`出生地点：${input.place}；采用时区 ${input.timezone}，以所选时区为准。`,`排盘标准时间：${n.normalized}；${n.dstMinutes?`已回拨夏令时 ${n.dstMinutes} 分钟。`:'无夏令时回拨。'}`,'晚子时按当日（sect=2）；不做经度校正；紫微闰月采用 fixLeap=true。','出生地用于确认时间口径，不参与外貌推断；姓名只用于称呼。','配偶星采用传统男女婚配角色规则；画像性别可自行选择，不用于推定性取向。'],appearance,traits,relationship,partnerGender:input.partnerGender,portraitPrompt:`Create a realistic portrait of one fictional adult ${input.partnerGender==='male'?'man':'woman'}, around thirty years old as an artistic choice, with a natural East Asian appearance as a stylistic default, not a prediction or identifiable real person. Core symbolic appearance: ${chosen.map(t=>t.face).join(' ')} ${elements[partnerElement].face}. Balanced natural features, real skin texture, restrained natural expression. Neat dark hair, understated everyday clothing, chest-up framing, soft window daylight, plain softly blurred background. No celebrity likeness, no beauty filter, no exaggerated anatomy, no text, no watermarks, no astrology charts. Face, age, ethnicity and styling are fictional creative choices. Do not imply personality can be read from this face.`};
}
