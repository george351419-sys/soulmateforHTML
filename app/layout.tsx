import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
 title:'生辰造像馆 · 伴侣想象画像',
 description:'从生辰出发，探索伴侣的想象肖像、气质与相处特质。传统文化取象，仅供娱乐与自我探索。',
 icons:{icon:'/favicon.svg',shortcut:'/favicon.svg'},
};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="zh-CN"><body>{children}</body></html>}
