import {chromium} from 'playwright-core';
import {mkdir} from 'node:fs/promises';
await mkdir('.render',{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1280,height:720},deviceScaleFactor:1});
page.on('pageerror',e=>console.error(e));
for(const theme of ['red','blue']){
await page.goto(`http://127.0.0.1:4173/render.html?theme=${theme}`);await page.waitForFunction(()=>window.ready);
for(const t of [.9,2.8,4.5,6.8]){await page.evaluate(t=>window.renderFrame(t),t);await page.screenshot({path:`.render/${theme}-${t}.png`});}
}
await browser.close();
