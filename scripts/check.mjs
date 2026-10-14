import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {chromium} from 'playwright-core';
import {once} from 'node:events';
import {mkdir,writeFile} from 'node:fs/promises';
import {serve} from './serve.mjs';
await mkdir('.render',{recursive:true});
const report={media:[],browser:[]};
for(const theme of ['red','blue']){
 const file=`exports/gen_teaser_${theme}.mp4`;
 const meta=JSON.parse(execFileSync('ffprobe',['-v','error','-show_format','-show_streams','-of','json',file]));
 const stream=meta.streams.find(s=>s.codec_type==='video');
 assert.equal(stream.width,1920);assert.equal(stream.height,1080);assert.equal(stream.codec_name,'h264');assert.equal(stream.pix_fmt,'yuv420p');assert.equal(stream.nb_frames,'240');assert.equal(stream.r_frame_rate,'30/1');assert.equal(Number(meta.format.duration),8);assert.equal(meta.streams.length,1);
 execFileSync('ffmpeg',['-v','error','-i',file,'-f','null','-'],{stdio:'pipe'});
 const frames=[];
 for(const t of [1,3,5,7])frames.push(execFileSync('ffmpeg',['-v','error','-ss',String(t),'-i',file,'-frames:v','1','-f','md5','-']).toString().trim());
 assert.equal(new Set(frames).size,4,'Sequence must contain visually different scenes');
 const gif=JSON.parse(execFileSync('ffprobe',['-v','error','-show_format','-show_streams','-of','json',`exports/gen_teaser_${theme}.gif`]));assert.equal(gif.streams[0].width,640);assert.equal(gif.streams[0].height,360);assert.equal(gif.streams[0].nb_frames,'120');assert.ok(Math.abs(Number(gif.format.duration)-8)<.1);
 report.media.push({theme,width:stream.width,height:stream.height,frames:240,duration:8,codec:'h264',audio:false,gifFrames:120,decode:'passed',distinctScenes:4});
}
const server=serve(0);await once(server,'listening');const url=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1100},reducedMotion:'reduce'}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(url);await page.waitForFunction(()=>document.querySelector('#hero').readyState>=2);
 assert.equal(await page.$eval('#hero',v=>v.paused),true,'Reduced motion disables autoplay');
 await page.click('#big-play');await page.waitForTimeout(450);assert.ok(await page.$eval('#hero',v=>!v.paused&&v.currentTime>0));
 await page.click('#play');assert.equal(await page.$eval('#hero',v=>v.paused),true);
 await page.$eval('#seek',s=>{s.value='4.5';s.dispatchEvent(new Event('input'));});await page.waitForFunction(()=>Math.abs(document.querySelector('#hero').currentTime-4.5)<.1);
 await page.click('[data-theme=blue]');await page.waitForFunction(()=>document.querySelector('#hero').readyState>=2&&document.querySelector('#hero').currentSrc.includes('blue')&&document.querySelector('#hero').currentTime>4.4);
 await page.click('#loop');assert.equal(await page.$eval('#hero',v=>v.loop),false);
 await page.click('#restart');await page.waitForTimeout(250);assert.ok(await page.$eval('#hero',v=>!v.paused&&v.currentTime<2));
 await page.click('#compare');await page.waitForTimeout(500);assert.ok(await page.$eval('#red-compare',v=>!v.paused&&v.currentTime>0));assert.ok(await page.$eval('#blue-compare',v=>!v.paused&&v.currentTime>0));
 await page.click('#compare');assert.ok(await page.$eval('#blue-compare',v=>v.paused));
 for(const a of await page.locator('a[download]').all()){const href=await a.getAttribute('href');const r=await page.request.get(new URL(href,url).href);assert.equal(r.status(),200,href);}
 await page.click('[data-theme=red]');await page.waitForFunction(()=>document.querySelector('#hero').readyState>=2&&document.querySelector('#hero').currentSrc.includes('red'));
 await page.$eval('#hero',v=>{v.pause();v.currentTime=6.8;});await page.waitForTimeout(250);await page.screenshot({path:'.render/studio-desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'.render/studio-mobile.png',fullPage:true});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.goto(url+'/render.html?theme=blue&t=2.8');await page.waitForFunction(()=>window.ready);assert.ok(await page.$eval('canvas',c=>c.width>0));await page.evaluate(()=>window.renderFrame(6.8));assert.equal(await page.$eval('#date',e=>getComputedStyle(e).opacity),'1');
 assert.deepEqual(errors,[]);
 report.browser=['reduced-motion autoplay','play/pause','scrub','theme switch preserves time','loop toggle','restart','simultaneous comparison','downloads','desktop and mobile layout','live WebGL scene','no page errors'];
}finally{await browser.close();server.close();}
await writeFile('.render/validation.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
