// All motion is progressive enhancement. Copy and links remain in the HTML.
const root = document.documentElement;
const media = window.matchMedia('(prefers-reduced-motion: reduce)');
const motionButton = document.querySelector('.motion-toggle');
let userMotion = null;
try { userMotion = sessionStorage.getItem('phonecam-motion'); } catch { /* Storage is optional. */ }
let paused = userMotion ? userMotion === 'paused' : media.matches;
let frame = 0;
let usbDemo = null;
const stage = document.querySelector('.device-stage');
const cinema = document.querySelector('.cinema');
const topButton=document.querySelector('#scroll-top');
function updateTopButton(){
  if(!topButton)return;
  const visible=(window.scrollY||0)>80;
  topButton.hidden=false;
  topButton.classList.toggle('is-visible',visible);
  topButton.setAttribute('aria-hidden',String(!visible));
  topButton.tabIndex=visible?0:-1;
  topButton.inert=!visible;
}
topButton?.addEventListener('click',()=>window.scrollTo({top:0,left:0,behavior:paused||media.matches?'auto':'smooth'}));
updateTopButton();
const clamp = n => Math.min(1, Math.max(0, n));

function renderScroll() {
  frame = 0;
  if (paused || document.hidden) return;
  const stageBounds = stage?.getBoundingClientRect();
  if (stageBounds && stageBounds.bottom > 0 && stageBounds.top < innerHeight) {
    stage.style.setProperty('--hero-progress', clamp(-stageBounds.top / 600).toFixed(3));
  }
  const bounds = cinema?.getBoundingClientRect();
  if (bounds && bounds.bottom > 0 && bounds.top < innerHeight) {
    const travel = bounds.height - cinema.firstElementChild.getBoundingClientRect().height;
    cinema.style.setProperty('--cinema-progress', clamp(-bounds.top / Math.max(1, travel)).toFixed(3));
  }
}
function queueScroll() { updateTopButton(); if (!paused && !frame) frame = requestAnimationFrame(renderScroll); }
function applyMotion() {
  root.classList.toggle('motion-paused', paused);
  motionButton.setAttribute('aria-pressed', String(paused));
  motionButton.setAttribute('aria-label', paused ? 'Enable motion' : 'Pause motion');
  if (paused) {
    cancelAnimationFrame(frame); frame = 0;
    stage?.style.setProperty('--hero-progress', '0');
  } else queueScroll();
  usbDemo?.syncMotion();
}
motionButton.addEventListener('click', () => {
  paused = !paused;
  userMotion = paused ? 'paused' : 'active';
  try { sessionStorage.setItem('phonecam-motion', userMotion); } catch { /* Optional preference. */ }
  applyMotion();
});
media.addEventListener('change', () => { if (!userMotion) { paused = media.matches; applyMotion(); } });
applyMotion();
window.addEventListener('scroll', queueScroll, { passive: true });
window.addEventListener('resize', queueScroll, { passive: true });
document.addEventListener('visibilitychange', queueScroll);

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      entry.target.classList.add('is-visible'); observer.unobserve(entry.target);
    }
  }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  root.classList.add('reveal-ready');
}

const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('#mobile-nav');
function closeMenu(returnFocus = false) {
  menu.hidden = true;
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open menu');
  if (returnFocus) menuButton.focus();
}
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menu.hidden = open;
  menuButton.setAttribute('aria-expanded', String(!open));
  menuButton.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
});
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => closeMenu()));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) closeMenu(true); });
document.addEventListener('click', e => { if (!menu.hidden && !e.target.closest('.site-header')) closeMenu(); });
matchMedia('(min-width: 761px)').addEventListener('change', e => { if (e.matches) closeMenu(); });

const descriptions = { wide: 'Landscape orientation.', portrait: 'Portrait orientation.' };
const formats = [...document.querySelectorAll('.format-selector button')];
for (const button of formats) button.addEventListener('click', () => {
  formats.forEach(b => b.setAttribute('aria-pressed', String(b === button)));
  document.querySelector('.demo-crop').dataset.format = button.dataset.format;
  document.querySelector('#format-description').textContent = descriptions[button.dataset.format];
});
const flipToggle = document.querySelector('#flip-toggle');
flipToggle?.addEventListener('click',()=>{
  const flipped = flipToggle.getAttribute('aria-checked') !== 'true';
  flipToggle.setAttribute('aria-checked',String(flipped));
  document.querySelector('.demo-crop').dataset.flipped = String(flipped);
});
document.querySelector('#grid-toggle')?.addEventListener('click', e => {
  const button = e.currentTarget;
  const visible = button.getAttribute('aria-pressed') !== 'true';
  button.setAttribute('aria-pressed', String(visible));
  button.setAttribute('aria-label', visible ? 'Hide composition grid' : 'Show composition grid');
  document.querySelector('#demo-scene').classList.toggle('show-grid', visible);
});
const dialog = document.querySelector('#scene-dialog');
const expand = document.querySelector('#expand-demo');
expand?.addEventListener('click', () => dialog.showModal());
dialog?.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog?.addEventListener('click', e => { if (e.target === dialog) { const b = dialog.getBoundingClientRect(); if (e.clientX < b.left || e.clientX > b.right || e.clientY < b.top || e.clientY > b.bottom) dialog.close(); } });
dialog?.addEventListener('close', () => expand.focus());


const lensViews = {
  ultra: {scale:1, label:'ULTRA WIDE · MORE IN THE FRAME', description:'A wider field of view for your desk, demonstrations and the whole room.', ring:'.lens-ring-one'},
  wide: {scale:1.35, label:'WIDE · EVERYDAY PERSPECTIVE', description:'An everyday perspective for calls, demos and more.', ring:'.lens-ring-two'},
  tele: {scale:2.2, label:'TELEPHOTO · A CLOSER LOOK', description:'Explore closer framing for details and demonstrations.', ring:'.lens-ring-three'},
  periscope: {scale:3.3, label:'PERISCOPE · DISTANT DETAILS', description:'Explore a tighter view of the distant mountain. This crop illustrates framing, not optical lens quality.', ring:'.lens-ring-four'},
  front: {scale:1, label:'FRONT CAMERA · YOUR SIDE OF THE SETUP', description:'Turn the camera toward your side of the setup: an empty chair and workspace, with the landscape beyond the window.', ring:'.lens-front-dot'}
};
const lensButtons = [...document.querySelectorAll('[data-lens]')];
function selectLens(button) {
  const view = lensViews[button.dataset.lens];
  document.querySelector('.lens-showcase').dataset.lens = button.dataset.lens;
  document.querySelector('.front-camera-badge').hidden = button.dataset.lens !== 'front';
  lensButtons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  document.querySelector('#lens-photo').style.transform = `scale(${view.scale})`;
  document.querySelector('#lens-view-label').textContent = view.label;
  document.querySelector('#lens-description').textContent = view.description;
  document.querySelectorAll('.lens-ring').forEach(r=>r.classList.toggle('selected',r.matches(view.ring)));
}
lensButtons.forEach(b=>b.addEventListener('click',()=>selectLens(b)));
if (lensButtons.length) selectLens(lensButtons.find(b=>b.dataset.lens==='wide'));
const range = document.querySelector('#comparison-range');
range?.addEventListener('input',()=> {
  range.closest('.comparison').style.setProperty('--split',`${range.value}%`);
  range.setAttribute('aria-valuetext',`${range.value}% simulated laptop view`);
});
// Measure the actual SVG path: one animation cycle equals the whole cable.
function updateCableSignals() {
  for(const packet of document.querySelectorAll('.usb-packet')) {
    try {
      const length=packet.getTotalLength();
      if(!Number.isFinite(length)||length<=0)continue;
      const pulse=Math.min(40,length*.12);
      packet.style.setProperty('--wire-length',String(length));
      packet.style.setProperty('--packet-length',String(pulse));
      packet.style.setProperty('--packet-gap',String(length-pulse));
      packet.dataset.ready='true';
    } catch { /* Hidden SVG geometry can be unavailable until its tab opens. */ }
  }
}
updateCableSignals();
const connectionTabs = [...document.querySelectorAll('.connection-tabs [role="tab"]')];
function selectConnection(tab, focus=false) {
  connectionTabs.forEach(t=>{
    const selected = t===tab;
    t.setAttribute('aria-selected',String(selected)); t.tabIndex = selected?0:-1;
    document.getElementById(t.getAttribute('aria-controls')).hidden = !selected;
  });
  updateCableSignals();
  if (focus) tab.focus();
}
connectionTabs.forEach((tab,index)=>{
  tab.addEventListener('click',()=>selectConnection(tab));
  tab.addEventListener('keydown',event=>{
    const keys = {ArrowRight:(index+1)%connectionTabs.length,ArrowLeft:(index-1+connectionTabs.length)%connectionTabs.length,Home:0,End:connectionTabs.length-1};
    if (event.key in keys) { event.preventDefault(); selectConnection(connectionTabs[keys[event.key]],true); }
  });
});


// One-shot viewport animation. Scroll never drives or reverses elapsed time.
function createUSBDemo() {
  const panel = document.querySelector('.usb-playground');
  if (!panel) return null;
  const duration = 17000;
  const camera = panel.querySelector('#usb-demo-camera');
  const caption = panel.querySelector('#usb-step-caption');
  const playButton = panel.querySelector('.demo-play-pause');
  let elapsed=0, last=0, raf=0, inView=false, entered=false, localPaused=false;
  const labels = ['Connect a USB data cable','Android: choose USB · ADB, then Start camera','Windows: choose USB · ADB, then Connect','Android: allow USB debugging if prompted','Connected'];
  const smooth=t=>{t=clamp(t);return t*t*(3-2*t);};
  const mix=(a,b,t)=>a+(b-a)*t;
  const narrow=innerWidth<=760;
  const phone=narrow?[-68,-383,2.8]:[135,-128,1.7];
  const pc=narrow?[-710,-235,2]:[-391,-90,1.45];
  const cameraKeys=[ [0,0,0,1], [1800,0,0,1], [2800,...phone], [6100,...phone], [7100,...pc], [10200,...pc], [11200,...phone], [14400,...phone], [15900,0,0,1], [duration,0,0,1] ];
  function render(time) {
    let a=cameraKeys[0],b=cameraKeys.at(-1);
    for(let i=1;i<cameraKeys.length;i++) if(time<=cameraKeys[i][0]){a=cameraKeys[i-1];b=cameraKeys[i];break;}
    const t=smooth((time-a[0])/Math.max(1,b[0]-a[0]));
    camera.setAttribute('transform',`translate(${mix(a[1],b[1],t)} ${mix(a[2],b[2],t)}) scale(${mix(a[3],b[3],t)})`);
    const step=time<1800?0:time<6600?1:time<10700?2:time<15100?3:4;
    if(caption.textContent!==labels[step]) caption.textContent=labels[step];
    panel.querySelector('.demo-step-index').textContent=`0${step+1} / 05`;
    panel.querySelector('.usb-connected-badge').hidden=step!==4;
    panel.querySelector('#phone-mode-value').textContent=time>=3400?'USB · ADB':'Wi-Fi';
    panel.querySelector('#phone-start-value').textContent=time>=4900?'Camera started':'Start camera';
    panel.querySelector('#pc-mode-value').textContent=time>=7900?'USB · ADB':'Wi-Fi';
    panel.querySelector('#pc-connect-value').textContent=time>=15100?'Connected':time>=9300?'Connecting…':'Connect';
    panel.querySelector('#adb-approval').setAttribute('visibility',time>=11200&&time<14200?'visible':'hidden');
    panel.querySelector('.usb-demo-progress i').style.width=`${time/duration*100}%`;
    const targets=[ [3200,3900,128,214,110,19], [4600,5400,128,174,114,14], [7700,8400,440,239,126,30], [9100,9900,602,252,142,34], [13200,14100,201,269,37,24] ];
    const active=targets.find(v=>time>=v[0]&&time<=v[1]);
    const highlight=panel.querySelector('#usb-click-highlight'),pointer=panel.querySelector('#usb-demo-pointer');
    highlight.setAttribute('visibility',active?'visible':'hidden');pointer.setAttribute('visibility',active?'visible':'hidden');
    if(active){const [, ,x,y,w,h]=active;for(const [k,v] of Object.entries({x:x-2,y:y-2,width:w+4,height:h+4})) highlight.setAttribute(k,v);pointer.setAttribute('cx',x+w*.7);pointer.setAttribute('cy',y+h*.75);}
    panel.dataset.demoState=time>=duration?'complete':time===0?'ready':'playing';
  }
  function stop(){if(raf)cancelAnimationFrame(raf);raf=0;last=0;}
  function tick(now){raf=0;if(!inView||paused||localPaused||document.hidden){last=0;return;}if(last)elapsed=Math.min(duration,elapsed+Math.min(80,now-last));last=now;render(elapsed);if(elapsed<duration)raf=requestAnimationFrame(tick);else{last=0;playButton.disabled=true;playButton.textContent='Demo complete';}}
  function syncMotion(){
    stop();
    if(paused&&media.matches&&!userMotion){render(duration);playButton.disabled=true;playButton.textContent='Motion paused';return;}
    playButton.disabled=paused||elapsed>=duration;
    playButton.textContent=elapsed>=duration?'Demo complete':paused?'Motion paused':localPaused?'Resume demo':'Pause demo';
    playButton.setAttribute('aria-pressed',String(localPaused));
    playButton.setAttribute('aria-label',localPaused?'Resume USB setup demo':'Pause USB setup demo');
    if(inView&&!paused&&!localPaused&&elapsed<duration&&!document.hidden)raf=requestAnimationFrame(tick);
  }
  function reset(){stop();elapsed=0;entered=false;localPaused=false;render(0);syncMotion();}
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries=>{
    for(const entry of entries){
      if(!entry.isIntersecting){inView=false;reset();}
      else if(entry.intersectionRatio>=.35){inView=true;entered=true;syncMotion();}
      else if(entered){inView=true;syncMotion();}
    }
  },{threshold:[0,.35]}) : null;
  if(observer)observer.observe(panel);else{inView=true;entered=true;}
  playButton.addEventListener('click',()=>{localPaused=!localPaused;syncMotion();});
  panel.querySelector('.demo-replay').addEventListener('click',()=>{elapsed=0;localPaused=false;render(0);syncMotion();});
  document.addEventListener('visibilitychange',syncMotion);
  render(0);syncMotion();
  return {syncMotion};
}
usbDemo=createUSBDemo();
