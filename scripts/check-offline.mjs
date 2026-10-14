import {chromium} from 'playwright-core';
import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {readFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
await mkdir('.render/offline-downloads',{recursive:true});
try{
const page=await browser.newPage({viewport:{width:1440,height:1000},acceptDownloads:true,reducedMotion:'reduce'});
const errors=[],network=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))network.push(r.url());});
// This managed browser blocks file:// navigation. Load the exact HTML bytes
// into an empty document, keeping external network requests observable.
await page.setContent(await readFile(resolve('exports/gen_teaser_preview.html'),'utf8')); 
await page.waitForFunction(()=>['red','blue'].every(id=>document.getElementById(id).readyState>=2));
assert.ok(await page.evaluate(()=>['red','blue'].every(id=>document.getElementById(id).duration===8)));
await page.click('#compare');await page.waitForFunction(()=>['red','blue'].every(id=>{const v=document.getElementById(id);return !v.paused&&v.currentTime>.2;}));
await page.click('#compare');assert.ok(await page.evaluate(()=>['red','blue'].every(id=>document.getElementById(id).paused)));
for(const name of ['gen_teaser_red.mp4','gen_teaser_red.gif','gen_teaser_blue.mp4','gen_teaser_blue.gif']){
const downloadPromise=page.waitForEvent('download');await page.click(`[data-file="${name}"]`);const download=await downloadPromise;assert.equal(download.suggestedFilename(),name);const out=resolve('.render/offline-downloads',name);await download.saveAs(out);const hash=x=>createHash('sha256').update(x).digest('hex');assert.equal(hash(await readFile(out)),hash(await readFile(resolve('exports',name))));}
await page.evaluate(async()=>{await Promise.all([...document.querySelectorAll('video')].map(v=>new Promise(resolve=>{v.addEventListener('seeked',resolve,{once:true});v.currentTime=6.8;})));});
await page.screenshot({path:'.render/offline-preview.png',fullPage:true});
assert.deepEqual(errors,[]);assert.deepEqual(network,[]);
console.log('PASS: offline HTML playback, comparison, all four downloads with SHA-256 equality, no HTTP requests or script errors. Direct file:// navigation is not verified: managed Chromium blocks that protocol.');
}finally{await browser.close();}
