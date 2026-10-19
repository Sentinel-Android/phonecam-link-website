// srcdoc inherits its container's base URL. Handle fragment links inside the
// document explicitly so they cannot navigate the frame to the outer HTML file.
export function installPreviewNavigation() {
 document.addEventListener('click',event=>{
  const link=event.target.closest('a[href]');
  if(!link||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||event.button!==0)return;
  const href=link.getAttribute('href');
  if(href.startsWith('#')){
   event.preventDefault();
   parent.postMessage({type:'phonecam-preview-section',hash:href},'*');
   return;
  }
  const match=/^\.\/(index\.html|downloads\.html|get-started\.html)(#.*)?$/.exec(href);
  if(match){event.preventDefault();parent.postMessage({type:'phonecam-preview-navigate',page:match[1],hash:match[2]||''},'*');}
 });
}
