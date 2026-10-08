import {imageConfig,json} from '@/lib/server';
export async function GET(){return json({imageReady:!!imageConfig().key})}
