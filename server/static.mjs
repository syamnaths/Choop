import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const mime = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.webp':'image/webp', '.svg':'image/svg+xml', '.ico':'image/x-icon', '.woff2':'font/woff2' };
export async function getStaticResponse(requestUrl, method, root = resolve('dist')) {
  if (!['GET','HEAD'].includes(method)) return {status:405,headers:{Allow:'GET, HEAD'},body:Buffer.alloc(0)};
  let pathname;
  try { pathname = decodeURIComponent(new URL(requestUrl,'http://localhost').pathname); } catch { return {status:400,headers:{},body:Buffer.alloc(0)}; }
  if (pathname.includes('\0') || pathname.split('/').some(part => part.startsWith('.')) || pathname.includes('\\')) return {status:404,headers:{},body:Buffer.alloc(0)};
  const base = resolve(root), target = resolve(base, `.${pathname}`);
  if (target !== base && !target.startsWith(base + sep)) return {status:404,headers:{},body:Buffer.alloc(0)};
  let file = target;
  try { if ((await stat(file)).isDirectory()) file = resolve(file,'index.html'); await stat(file); }
  catch { if (extname(pathname)) return {status:404,headers:{},body:Buffer.alloc(0)}; file=resolve(base,'index.html'); }
  const type=mime[extname(file).toLowerCase()]; if(!type) return {status:404,headers:{},body:Buffer.alloc(0)};
  try { const body=await readFile(file); return {status:200,headers:{'Content-Type':type,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'},body:method==='HEAD'?Buffer.alloc(0):body}; }
  catch { return {status:404,headers:{},body:Buffer.alloc(0)}; }
}
