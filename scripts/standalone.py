"""Build a genuinely offline comparison page with embedded downloadable media."""
from pathlib import Path
import base64,json
root=Path(__file__).resolve().parent.parent
files={}
for theme in ['red','blue']:
    for suffix,mime in [('.mp4','video/mp4'),('.gif','image/gif'),('_poster.png','image/png')]:
        name=f'gen_teaser_{theme}{suffix}'
        files[name]={'mime':mime,'data':base64.b64encode((root/'exports'/name).read_bytes()).decode()}
html='''<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>GEN NX — Teaser comparison</title><link rel="icon" href="data:,"><style>
*{box-sizing:border-box}body{margin:0;background:#100e12;color:#e8e2e8;font-family:Arial,sans-serif}main{max-width:1440px;margin:auto;padding:50px 5vw}header{display:flex;justify-content:space-between;align-items:center;margin-bottom:40px}.brand{font-size:24px;font-weight:bold}.brand small{font-size:13px;color:#cf7e87}header span{font-size:11px;color:#ab919e;letter-spacing:2px}h1{font-size:38px;font-weight:400;letter-spacing:-1px;margin:0 0 14px}.intro{font-size:13px;line-height:1.8;color:#a696a4}.controls{display:flex;gap:12px;margin:28px 0}button{border:1px solid #65434f;background:#291b24;color:#eedee8;border-radius:4px;padding:12px 19px;cursor:pointer}section{display:grid;grid-template-columns:1fr 1fr;gap:24px}article{overflow:hidden;border:1px solid #3a2934;border-radius:5px;background:#171218}video{width:100%;aspect-ratio:16/9;display:block;background:#08060a}h2{font-size:19px;font-weight:400;margin:20px}h2 small{font-size:11px;color:#a891a0;margin-left:12px}.links{display:flex;border-top:1px solid #332630}.links a{flex:1;padding:18px 20px;color:#d7bdcf;text-decoration:none;font-size:12px}.links a+a{border-left:1px solid #332630}footer{margin-top:30px;font-size:11px;color:#98818f;line-height:1.8}a:focus-visible,button:focus-visible{outline:2px solid #ce91af;outline-offset:3px}@media(max-width:800px){section{grid-template-columns:1fr}h1{font-size:30px}main{padding:30px 5vw}header span{font-size:9px}}
</style></head><body><main><header><div class="brand">GEN <small>NX</small></div><span>11.2026 / RELEASE TEASER</span></header><h1>A new dimension.</h1><p class="intro">Crimson과 Blueprint, 두 가지 빛으로 만나는 다음의 GEN NX.<br>8초 · 1920 × 1080 · 무음</p><div class="controls"><button id="compare">두 버전 동시 재생</button><button id="reset">처음으로</button></div><section>'''
for theme,title in [('red','01 / Crimson'),('blue','02 / Blueprint')]:
    html+=f'<article><video id="{theme}" controls muted playsinline loop preload="metadata"></video><h2>{title}</h2><div class="links"><a data-file="gen_teaser_{theme}.mp4" download="gen_teaser_{theme}.mp4">MP4 다운로드 ↓</a><a data-file="gen_teaser_{theme}.gif" download="gen_teaser_{theme}.gif">GIF 다운로드 ↓</a></div></article>'
html+='''</section><footer>이 파일에는 두 영상과 GIF가 포함되어 있습니다. 인터넷 연결이나 서버 설치 없이 열 수 있습니다.<br>로고는 제공된 이미지에서 재구성한 시안이며, 공식 벡터와의 정확한 일치는 확인되지 않았습니다.</footer></main><script id="media" type="application/json">'''+json.dumps(files,separators=(',',':'))+'''</script><script>
const files=JSON.parse(document.querySelector('#media').textContent),urls={};
for(const [name,file] of Object.entries(files)){const bytes=Uint8Array.from(atob(file.data),c=>c.charCodeAt(0));urls[name]=URL.createObjectURL(new Blob([bytes],{type:file.mime}));}
document.querySelector('#media').remove();
const videos=['red','blue'].map(theme=>{const v=document.querySelector('#'+theme);v.src=urls['gen_teaser_'+theme+'.mp4'];v.poster=urls['gen_teaser_'+theme+'_poster.png'];return v;});
document.querySelectorAll('[data-file]').forEach(a=>a.href=urls[a.dataset.file]);
const compare=document.querySelector('#compare');
compare.onclick=async()=>{if(videos.every(v=>!v.paused)){videos.forEach(v=>v.pause());compare.textContent='두 버전 동시 재생';}else{videos.forEach(v=>v.currentTime=0);await Promise.all(videos.map(v=>v.play()));compare.textContent='두 버전 일시 정지';}};
document.querySelector('#reset').onclick=()=>{videos.forEach(v=>{v.pause();v.currentTime=0;});compare.textContent='두 버전 동시 재생';};
window.addEventListener('pagehide',()=>Object.values(urls).forEach(u=>URL.revokeObjectURL(u)));
</script></body></html>'''
path=root/'exports/gen_teaser_preview.html'
path.write_text(html)
print(f'{path.name}: {path.stat().st_size/1024/1024:.1f} MiB')
