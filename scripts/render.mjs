import {chromium} from 'playwright-core';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {mkdir} from 'node:fs/promises';
import {serve} from './serve.mjs';
const width=1920,height=1080,fps=30,duration=8;
const selected=process.argv.slice(2).filter(t=>['red','blue'].includes(t));
const themes=selected.length?selected:['red','blue'];
await mkdir('exports',{recursive:true});await mkdir('.render',{recursive:true});
const server=serve(0);await once(server,'listening');
const port=server.address().port;
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
function ffmpeg(args){const p=spawn('ffmpeg',['-hide_banner','-loglevel','error',...args],{stdio:['pipe','inherit','inherit']});p.stdin.on('error',()=>{});p.done=new Promise((resolve,reject)=>{p.on('error',reject);p.on('close',c=>c===0?resolve():reject(new Error(`ffmpeg exited ${c}`)));});return p;}
try{
 const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const theme of themes){
  await page.goto(`http://127.0.0.1:${port}/render.html?theme=${theme}`);await page.waitForFunction(()=>window.ready);
  const file=`exports/gen_teaser_${theme}`;
  const encoder=ffmpeg(['-y','-f','image2pipe','-vcodec','mjpeg','-framerate',String(fps),'-i','pipe:0','-an','-vf','scale=in_range=pc:out_range=tv:out_color_matrix=bt709','-color_range','tv','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-c:v','libx264','-preset','slow','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart','-threads','4',file+'.mp4']);
  let finalFrame;
  for(let i=0;i<fps*duration;i++){
   const t=i/fps;
   let buffer;
   if(t>=6.4&&finalFrame)buffer=finalFrame;
   else{await page.evaluate(t=>window.renderFrame(t),t);buffer=await page.screenshot({type:'jpeg',quality:97,animations:'disabled'});if(t>=6.4)finalFrame=buffer;}
   if(!encoder.stdin.write(buffer))await once(encoder.stdin,'drain');
   if(i%30===0)console.log(`${theme}: ${i}/${fps*duration} frames`);
  }
  encoder.stdin.end();await encoder.done;
  await page.evaluate(()=>window.renderFrame(6.8));await page.screenshot({path:file+'_poster.png'});
  for(const t of [.9,2.8,4.5,6.8]){await page.evaluate(t=>window.renderFrame(t),t);await page.screenshot({path:`.render/${theme}-${t}.png`});}
  console.log(`${theme}: encoding GIF`);
  const gif=ffmpeg(['-y','-i',file+'.mp4','-filter_complex','fps=15,scale=640:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=160:stats_mode=diff[p];[b][p]paletteuse=dither=sierra2_4a:diff_mode=rectangle','-loop','0',file+'.gif']);gif.stdin.end();await gif.done;
  console.log(`${theme}: MP4, GIF and poster complete`);
 }
 if(errors.length)throw new Error(errors.join('\n'));
}finally{await browser.close();server.close();}
