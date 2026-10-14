import {chromium} from 'playwright-core';
import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {once} from 'node:events';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {serve} from './serve.mjs';
const basePath='/midas-gen-nx-landing',server=serve(0,{root:resolve('.render/pages'),basePath});await once(server,'listening');const origin=`http://127.0.0.1:${server.address().port}`,url=origin+basePath+'/teaser/';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1280,height:900},acceptDownloads:true,reducedMotion:'reduce'}),errors=[],bad=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)bad.push(`${r.status()} ${r.url()}`);});
 await page.goto(url);await page.waitForFunction(()=>document.querySelector('#hero').readyState>=2);
 await page.click('#play');await page.waitForFunction(()=>document.querySelector('#hero').currentTime>.2);await page.click('#play');
 await page.click('[data-theme=blue]');await page.waitForFunction(()=>document.querySelector('#hero').readyState>=2&&document.querySelector('#hero').currentSrc.includes('blue'));
 await page.click('#compare');await page.waitForFunction(()=>[...document.querySelectorAll('.card-media video')].every(v=>!v.paused&&v.currentTime>.2));await page.click('#compare');
 for(const a of await page.locator('a[download]').all()){
  const name=(await a.getAttribute('href')).split('/').pop(),event=page.waitForEvent('download');await a.click();const download=await event;const file=await download.path();assert.ok(file);const hash=x=>createHash('sha256').update(x).digest('hex');assert.equal(hash(await readFile(file)),hash(await readFile(resolve('exports',name))));
 }
 await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.goto(url+'render.html?theme=blue&t=6.8');await page.waitForFunction(()=>window.ready);assert.equal(await page.$eval('#date',e=>getComputedStyle(e).opacity),'1');
 assert.deepEqual(errors,[]);assert.deepEqual(bad,[]);
 console.log('PASS: nested Pages path, both videos, comparison controls, six actual downloads with matching SHA-256, mobile layout and vendored live WebGL.');
}finally{await browser.close();server.close();}
