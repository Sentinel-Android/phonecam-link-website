import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';

// A tiny DOM harness exercises real event handlers and animation lifecycle.
// It does not claim to validate browser rendering or responsive layout.
const source=await readFile(new URL('../app.js',import.meta.url),'utf8');
function harness({reduced=false}={}) {
 const nodes=new Map(),observers=[],frames=new Map(),windowEvents=new Map(),scrollCalls=[];let counter=0,now=1;
 const classes=()=>({values:new Set(),add(v){this.values.add(v)},remove(v){this.values.delete(v)},toggle(v,on){if(on===undefined)on=!this.values.has(v);on?this.values.add(v):this.values.delete(v);},contains(v){return this.values.has(v)}});
 class Element {
  constructor(dataset={}){this.dataset=dataset;this.attrs={};this.events={};this.classList=classes();this.style={values:{},setProperty(k,v){this.values[k]=v}};this.textContent='';this.hidden=false;this.disabled=false;this.firstElementChild={getBoundingClientRect:()=>({height:100})};}
  setAttribute(k,v){this.attrs[k]=String(v)}getAttribute(k){return this.attrs[k]??null}
  addEventListener(k,fn){(this.events[k]??=[]).push(fn)}
  dispatch(k,details={}){for(const fn of this.events[k]||[])fn({currentTarget:this,target:this,preventDefault(){},...details})}
  querySelector(s){return node(s)}querySelectorAll(){return []}focus(){}matches(s){return this.selector===s}
  closest(){return this}getBoundingClientRect(){return {top:0,bottom:0,height:100}}
 }
 function node(selector){if(!nodes.has(selector)){const n=new Element();n.selector=selector;nodes.set(selector,n)}return nodes.get(selector)}
 const formats=['wide','portrait'].map(format=>new Element({format}));
 const lenses=['ultra','wide','tele','periscope','front'].map(lens=>new Element({lens}));
 const rings=['.lens-ring-one','.lens-ring-two','.lens-ring-three','.lens-ring-four'].map(node);
 const tabs=['wifi','usb-adb','wifi-direct'].map(id=>{const t=new Element();t.setAttribute('aria-controls',`panel-${id}`);return t;});
 const packets=[node('packet-short'),node('packet-long')];packets[0].getTotalLength=()=>125;packets[1].getTotalLength=()=>860;
 const queryAll=s=>s==='.usb-packet'?packets:s==='.format-selector button'?formats:s==='[data-lens]'?lenses:s==='.lens-ring'?rings:s==='.connection-tabs [role="tab"]'?tabs:[];
 const document={documentElement:node(':root'),hidden:false,querySelector:node,querySelectorAll:queryAll,getElementById:node,addEventListener(){}};
 class IO{constructor(callback){this.callback=callback;observers.push(this)}observe(target){this.target=target}unobserve(){}}
 const context={document,scrollY:0,scrollTo(options){scrollCalls.push(options);this.scrollY=options.top;for(const fn of windowEvents.get('scroll')||[])fn();},innerWidth:390,innerHeight:800,IntersectionObserver:IO,sessionStorage:{getItem(){return null},setItem(){}},matchMedia:()=>({matches:reduced,addEventListener(){}}),requestAnimationFrame(fn){const id=++counter;frames.set(id,fn);return id},cancelAnimationFrame(id){frames.delete(id)}};
 context.window=context;context.addEventListener=(name,fn)=>{if(!windowEvents.has(name))windowEvents.set(name,[]);windowEvents.get(name).push(fn);};
 vm.createContext(context);vm.runInContext(source,context);
 const panel=node('.usb-playground'),observer=observers.find(x=>x.target===panel);
 return {nodes,node,formats,lenses,tabs,panel,context,packets,scrollCalls,
  enter(){observer.callback([{isIntersecting:true,intersectionRatio:.8}])},
  leave(){observer.callback([{isIntersecting:false,intersectionRatio:0}])},
  scroll(y){context.scrollY=y;for(const fn of windowEvents.get('scroll')||[])fn();},
  advance(ms){const end=now+ms;while(now<end){now+=16;const pending=[...frames.values()];frames.clear();for(const fn of pending)fn(now);}}
 };
}
test('Flip persists through landscape and portrait changes',()=>{
 const h=harness();h.node('#flip-toggle').dispatch('click');h.formats[1].dispatch('click');
 assert.equal(h.node('.demo-crop').dataset.flipped,'true');assert.equal(h.node('.demo-crop').dataset.format,'portrait');
 h.formats[0].dispatch('click');assert.equal(h.node('.demo-crop').dataset.flipped,'true');
 h.node('#flip-toggle').dispatch('click');assert.equal(h.node('.demo-crop').dataset.flipped,'false');
});
test('Periscope and face-free front view update their illustration states',()=>{
 const h=harness();h.lenses[3].dispatch('click');assert.equal(h.node('.lens-showcase').dataset.lens,'periscope');assert.match(h.node('#lens-photo').style.transform,/3.3/);
 h.lenses[4].dispatch('click');assert.equal(h.node('.lens-showcase').dataset.lens,'front');assert.equal(h.node('.front-camera-badge').hidden,false);assert.match(h.node('#lens-description').textContent,/empty chair/);
 h.lenses[1].dispatch('click');assert.equal(h.node('.front-camera-badge').hidden,true);
});
test('USB demo plays once, pauses, holds completion and resets only offscreen',()=>{
 const h=harness();h.advance(2000);assert.equal(h.panel.dataset.demoState,'ready');
 h.enter();h.advance(5500);assert.equal(h.node('#phone-start-value').textContent,'Camera started');
 const caption=h.node('#usb-step-caption').textContent;
 h.node('.demo-play-pause').dispatch('click');h.advance(5000);assert.equal(h.node('#usb-step-caption').textContent,caption);
 h.node('.demo-play-pause').dispatch('click');h.advance(13000);assert.equal(h.panel.dataset.demoState,'complete');assert.equal(h.node('#pc-connect-value').textContent,'Connected');
 h.enter();h.advance(3000);assert.equal(h.panel.dataset.demoState,'complete');
 h.leave();assert.equal(h.panel.dataset.demoState,'ready');assert.equal(h.node('#pc-connect-value').textContent,'Connect');
 h.enter();h.advance(8500);assert.equal(h.node('#pc-mode-value').textContent,'USB · ADB');
 h.node('.motion-toggle').dispatch('click');const state=h.node('#pc-connect-value').textContent;h.advance(5000);assert.equal(h.node('#pc-connect-value').textContent,state);
});
test('Reduced motion shows the final state and keeps the text steps available',()=>{
 const h=harness({reduced:true});h.enter();h.advance(20000);assert.equal(h.panel.dataset.demoState,'complete');assert.equal(h.node('.demo-play-pause').disabled,true);
});

test('Cable signal uses each complete measured path, including long cables',()=>{
 const h=harness();
 for(const [packet,length] of h.packets.map((p,i)=>[p,[125,860][i]])){
  const vars=packet.style.values;
  assert.equal(Number(vars['--wire-length']),length);
  assert.equal(Number(vars['--packet-length'])+Number(vars['--packet-gap']),length);
  assert.equal(packet.dataset.ready,'true');
 }
});

test('Scroll-to-top appears after scrolling and disappears on return to the top',()=>{
 const h=harness(),button=h.node('#scroll-top');
 assert.equal(button.getAttribute('aria-hidden'),'true');assert.equal(button.inert,true);h.scroll(500);assert.equal(button.classList.contains('is-visible'),true);assert.equal(button.inert,false);
 button.dispatch('click');assert.equal(h.context.scrollY,0);assert.equal(button.classList.contains('is-visible'),false);assert.equal(button.getAttribute('aria-hidden'),'true');assert.equal(button.hidden,false);assert.equal(h.scrollCalls[0].behavior,'smooth');
});
test('Scroll-to-top remains usable with motion paused or reduced',()=>{
 const h=harness({reduced:true});h.scroll(350);assert.equal(h.node('#scroll-top').classList.contains('is-visible'),true);
 h.node('#scroll-top').dispatch('click');assert.equal(h.scrollCalls[0].behavior,'auto');assert.equal(h.node('#scroll-top').getAttribute('aria-hidden'),'true');
});
