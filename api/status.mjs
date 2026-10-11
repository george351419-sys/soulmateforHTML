export default function handler(req,res){
 const origin=req.headers.origin;const allowed=(process.env.ALLOWED_ORIGINS||'https://george351419-sys.github.io').split(',').map(s=>s.trim());
 res.setHeader('Cache-Control','no-store');res.setHeader('Vary','Origin');
 if(origin&&allowed.includes(origin))res.setHeader('Access-Control-Allow-Origin',origin);
 res.setHeader('Content-Type','application/json');res.end(JSON.stringify({imageReady:!!process.env.ARK_API_KEY}));
}
