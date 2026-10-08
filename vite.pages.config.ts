import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath} from 'node:url';
const path=(p:string)=>fileURLToPath(new URL(p,import.meta.url));
export default defineConfig({
 root:path('./pages'),base:'/soulmateforHTML/',publicDir:path('./public'),
 plugins:[react()],
 resolve:{alias:[{find:'@/lib/client-api',replacement:path('./pages/client-api.ts')},{find:'@',replacement:path('./')}]},
 build:{outDir:path('./dist-pages'),emptyOutDir:true},
});
