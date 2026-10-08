import {analyze} from '../lib/analyze';
import type {BirthInput} from '../lib/types';
export const assetUrl=(path:string)=>import.meta.env.BASE_URL+path.replace(/^\//,'');
export const imageUnavailableMessage='文字报告已生成。此版本在浏览器内排盘；新画像需接通独立的 AI 生图服务，目前不会生成或替换成示例图片。';
export const availabilityNote='可直接生成文字报告；新画像待接通 AI 生图服务。';
export const privacyNote='出生资料仅在当前浏览器计算，不上传、不保存';
export async function imageStatus(){return false;}
export async function createReport(input:BirthInput){return {report:analyze(input),imageReady:false};}
export async function createPortrait(_input:BirthInput):Promise<string>{throw new Error(imageUnavailableMessage);}
