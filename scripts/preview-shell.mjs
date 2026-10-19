// The outer document owns history; each page frame is a fresh browsing context.
// This avoids accumulating invisible iframe history alongside the page entries.
export function installPreviewShell(pages,initialPage) {
 let frame=document.getElementById('preview-frame'),current=null,loadedPage='',serial=0;
 const positions=new Map();
 const valid=page=>typeof page==='string'&&Object.hasOwn(pages,page);
 const normalizeHash=hash=>typeof hash==='string'&&hash.startsWith('#')&&hash.length>1?hash:'';
 const readRoute=()=>{
  const params=new URLSearchParams(window.location.hash.slice(1));
  const slug=params.get('page');
  const page=slug==='home'?'index.html':slug?slug+'.html':initialPage;
  return {page:valid(page)?page:initialPage,hash:params.get('section')?'#'+params.get('section'):''};
 };
 const routeURL=entry=>{
  const params=new URLSearchParams({page:entry.page==='index.html'?'home':entry.page.replace('.html','')});
  if(entry.hash)params.set('section',entry.hash.slice(1));
  return '#'+params.toString();
 };
 const createEntry=route=>({phonecamPreview:true,id:'preview-'+Date.now()+'-'+(++serial),page:route.page,hash:normalizeHash(route.hash),scrollY:0});
 const savePosition=()=>{
  if(current&&loadedPage===current.page)positions.set(current.id,frame.contentWindow.scrollY||0);
 };
 function position(entry,restore,smooth=false) {
  const saved=positions.get(entry.id)??entry.scrollY;
  const quiet=!smooth||window.matchMedia('(prefers-reduced-motion: reduce)').matches||frame.contentDocument.documentElement.classList.contains('motion-paused');
  if(restore&&Number.isFinite(saved)){frame.contentWindow.scrollTo({top:saved,left:0,behavior:'instant'});return;}
  const id=entry.hash?decodeURIComponent(entry.hash.slice(1)):'';
  const target=id?frame.contentDocument.getElementById(id):null;
  if(target)target.scrollIntoView({behavior:quiet?'instant':'smooth',block:'start'});
  else frame.contentWindow.scrollTo({top:0,left:0,behavior:quiet?'instant':'smooth'});
 }
 function show(entry,{restore=false,smooth=false}={}) {
  current=entry;
  if(loadedPage===entry.page){position(entry,restore,smooth);return;}
  const next=document.createElement('iframe');
  next.id='preview-frame';next.title='PhoneCam Link website preview';
  next.srcdoc=pages[entry.page];
  next.onload=()=>{
   if(frame!==next)return;
   loadedPage=entry.page;document.title=next.contentDocument.title;
   next.contentWindow.addEventListener('scroll',savePosition,{passive:true});
   position(entry,restore,false);
  };
  loadedPage='';frame.replaceWith(next);frame=next;
 }
 function navigate(route) {
  if(!valid(route.page))return;
  route.hash=normalizeHash(route.hash);
  if(current.page===route.page&&current.hash===route.hash){position(current,false,true);return;}
  savePosition();
  window.history.replaceState({...current,scrollY:positions.get(current.id)??0},'',routeURL(current));
  const entry=createEntry(route);
  window.history.pushState(entry,'',routeURL(entry));
  show(entry,{smooth:true});
 }
 window.addEventListener('message',event=>{
  if(event.source!==frame.contentWindow)return;
  const data=event.data;
  if(data?.type==='phonecam-preview-navigate')navigate({page:data.page,hash:data.hash});
  else if(data?.type==='phonecam-preview-section')navigate({page:current.page,hash:data.hash});
 });
 window.addEventListener('popstate',event=>{
  savePosition();
  let entry=event.state;
  if(!entry?.phonecamPreview||!valid(entry.page)){entry=createEntry(readRoute());window.history.replaceState(entry,'',routeURL(entry));}
  show(entry,{restore:true});
 });
 const route=readRoute(),stored=window.history.state;
 const entry=stored?.phonecamPreview&&stored.page===route.page&&stored.hash===route.hash?stored:createEntry(route);
 window.history.replaceState(entry,'',routeURL(entry));
 show(entry,{restore:Boolean(stored?.phonecamPreview)});
}
