import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {installPreviewShell} from './preview-shell.mjs';
function harness({initial='index.html',hash='',reduced=false}={}){
 const events=new Map(),stack=[{state:null,hash}],scrolls=[];let cursor=0,mounts=0,frame;
 const context={URLSearchParams,location:{hash},matchMedia:()=>({matches:reduced}),addEventListener(type,fn){events.set(type,fn)}};
 function makeFrame(){
  const handlers=new Map();
  const win={scrollY:0,addEventListener(name,fn){handlers.set(name,fn)},scrollTo(options){this.scrollY=options.top;scrolls.push(options);handlers.get('scroll')?.()}};
  return {contentWindow:win,contentDocument:{title:'PhoneCam Link',documentElement:{classList:{contains(){return false}}},getElementById(id){return {scrollIntoView(options){win.scrollY={connection:4200,'use-cases':720}[id]||100;scrolls.push(options);handlers.get('scroll')?.()}}}},replaceWith(next){frame=next;mounts++}};
 }
 frame=makeFrame();
 const history={get state(){return stack[cursor].state},replaceState(state,_,url){stack[cursor]={state,hash:url};context.location.hash=url},pushState(state,_,url){stack.splice(cursor+1);stack.push({state,hash:url});cursor++;context.location.hash=url}};
 context.history=history;context.window=context;context.document={getElementById(){return frame},createElement(){return makeFrame()}};
 vm.createContext(context);vm.runInContext(`(${installPreviewShell.toString()})({'index.html':'Home','downloads.html':'Downloads','get-started.html':'Get Started'},${JSON.stringify(initial)});`,context);
 function load(){frame.onload()}
 load();
 return {stack,context,scrolls,get mounts(){return mounts},get page(){return frame.srcdoc},load,
  scroll(y){frame.contentWindow.scrollTo({top:y})},
  pageTo(page,hash=''){events.get('message')({source:frame.contentWindow,data:{type:'phonecam-preview-navigate',page,hash}})},
  section(hash){events.get('message')({source:frame.contentWindow,data:{type:'phonecam-preview-section',hash}})},
  back(){const before=frame;cursor--;context.location.hash=stack[cursor].hash;events.get('popstate')({state:stack[cursor].state});if(frame!==before)load()},
  forward(){const before=frame;cursor++;context.location.hash=stack[cursor].hash;events.get('popstate')({state:stack[cursor].state});if(frame!==before)load()},
  get y(){return frame.contentWindow.scrollY}
 };
}
test('Preview Back/Forward restores all three pages and their scroll positions',()=>{
 const h=harness();h.scroll(600);h.pageTo('downloads.html');h.load();h.scroll(350);h.pageTo('get-started.html');h.load();h.scroll(200);
 assert.equal(h.stack.length,3);h.back();assert.equal(h.page,'Downloads');assert.equal(h.y,350);
 h.back();assert.equal(h.page,'Home');assert.equal(h.y,600);
 h.forward();assert.equal(h.page,'Downloads');assert.equal(h.y,350);
 h.forward();assert.equal(h.page,'Get Started');assert.equal(h.y,200);
});
test('Section history scrolls the current frame without remounting it',()=>{
 const h=harness();h.scroll(230);const mounts=h.mounts;h.section('#connection');assert.equal(h.y,4200);assert.equal(h.mounts,mounts);assert.equal(h.stack.length,2);
 // Same-page popstate must not reload the iframe or run its load handler again.
 h.back();assert.equal(h.y,230);assert.equal(h.mounts,mounts);
 h.forward();assert.equal(h.y,4200);assert.equal(h.mounts,mounts);
});
test('A direct preview section URL opens the intended page and section',()=>{
 const h=harness({hash:'#page=home&section=connection',initial:'downloads.html'});assert.equal(h.page,'Home');assert.equal(h.y,4200);
});
test('Repeated current-page links do not add duplicate entries and reduced motion stays immediate',()=>{
 const h=harness({reduced:true});h.pageTo('index.html');assert.equal(h.stack.length,1);h.section('#use-cases');assert.equal(h.y,720);assert.equal(h.scrolls.at(-1).behavior,'instant');
});
