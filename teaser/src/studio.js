const hero=document.querySelector('#hero'),play=document.querySelector('#play'),big=document.querySelector('#big-play'),seek=document.querySelector('#seek'),loop=document.querySelector('#loop');
hero.loop=true;
async function toggle(){if(hero.paused){await hero.play().catch(()=>{});}else hero.pause();}
play.onclick=toggle;big.onclick=toggle;hero.onclick=toggle;
function state(){play.textContent=hero.paused?'▶':'Ⅱ';play.setAttribute('aria-label',hero.paused?'재생':'일시 정지');big.classList.toggle('hidden',!hero.paused||hero.currentTime>.1);}
hero.addEventListener('play',state);hero.addEventListener('pause',state);hero.addEventListener('ended',state);
hero.addEventListener('timeupdate',()=>{seek.value=hero.currentTime;document.querySelector('#time').innerHTML=`${hero.currentTime.toFixed(2).padStart(5,'0')} <em>/ 08.00</em>`;});
seek.oninput=()=>{hero.currentTime=Number(seek.value);state();};
document.querySelector('#restart').onclick=()=>{hero.currentTime=0;hero.play().catch(()=>{});};
loop.onclick=()=>{hero.loop=!hero.loop;loop.classList.toggle('enabled',hero.loop);loop.setAttribute('aria-pressed',String(hero.loop));};
document.querySelector('#fullscreen').onclick=()=>hero.requestFullscreen?.();
document.querySelectorAll('.theme').forEach(button=>button.onclick=()=>{
 const t=hero.currentTime,wasPlaying=!hero.paused,theme=button.dataset.theme;
 document.querySelectorAll('.theme').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});
 hero.src=`exports/gen_teaser_${theme}.mp4`;hero.poster=`exports/gen_teaser_${theme}_poster.png`;hero.setAttribute('aria-label',`GEN NX ${theme==='red'?'붉은':'푸른'} 버전 티저`);
 document.querySelector('#edition-name').textContent=theme==='red'?'CRIMSON / EDITION 01':'BLUEPRINT / EDITION 02';
 hero.addEventListener('loadedmetadata',()=>{hero.currentTime=t;if(wasPlaying)hero.play().catch(()=>{});},{once:true});
});
const compare=document.querySelector('#compare'),pair=[document.querySelector('#red-compare'),document.querySelector('#blue-compare')];
compare.onclick=async()=>{hero.pause();const pause=pair.every(v=>!v.paused);if(pause)pair.forEach(v=>v.pause());else{pair.forEach(v=>{v.currentTime=0;});await Promise.all(pair.map(v=>v.play().catch(()=>{})));}compare.innerHTML=pause?'두 버전 동시 재생 <span>↗</span>':'두 버전 일시 정지 <span>Ⅱ</span>';};
if(!matchMedia('(prefers-reduced-motion: reduce)').matches)hero.play().catch(()=>{});
