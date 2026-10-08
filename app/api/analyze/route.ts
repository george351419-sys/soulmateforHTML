import {analyze} from '@/lib/analyze';
import {imageConfig,json,readInput} from '@/lib/server';
export async function POST(request:Request){try{return json({report:analyze(await readInput(request)),imageReady:!!imageConfig().key})}catch(e){return json({error:e instanceof Error?e.message:'排盘失败，请检查出生信息。'},400)}}
