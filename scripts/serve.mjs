import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
const projectRoot=resolve(fileURLToPath(new URL('../',import.meta.url)));
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.mp4':'video/mp4','.gif':'image/gif','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2'};
export function serve(port=4173,{root=projectRoot,basePath=""}={}){return createServer(async(req,res)=>{
 try{
 let pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 if(basePath&&!pathname.startsWith(basePath+'/')){res.writeHead(404);return res.end();}
 pathname=pathname.slice(basePath.length);
 if(pathname.endsWith('/'))pathname+='index.html';
 const file=resolve(root,'.'+pathname);
 if(!file.startsWith(root+sep)){res.writeHead(403);return res.end();}
 const info=await stat(file);if(!info.isFile())throw new Error('not file');
 const data=await readFile(file),headers={'Content-Type':types[extname(file)]||'application/octet-stream','Accept-Ranges':'bytes','Cache-Control':'no-cache'};
 if(req.headers.range){const match=/bytes=(\d+)-(\d*)/.exec(req.headers.range);if(!match){res.writeHead(416);return res.end();}const start=Number(match[1]),end=Math.min(Number(match[2]||info.size-1),info.size-1);if(start>end){res.writeHead(416);return res.end();}res.writeHead(206,{...headers,'Content-Range':`bytes ${start}-${end}/${info.size}`,'Content-Length':end-start+1});res.end(data.subarray(start,end+1));}
 else{res.writeHead(200,{...headers,'Content-Length':info.size});res.end(data);}
 }catch{res.writeHead(404);res.end('Not found');}
 }).listen(port,'0.0.0.0');}
if(process.argv[1]===fileURLToPath(import.meta.url))serve(Number(process.env.PORT||4173)).on('listening',()=>console.log('GEN NX studio listening on port '+(process.env.PORT||4173)));
