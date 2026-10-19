// A complete offline review of all three pages. The hosted site stays multi-page.
import { readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { root, render, pages } from './render.mjs';
import { installPreviewNavigation } from './preview-navigation.mjs';
import { installPreviewShell } from './preview-shell.mjs';
const names = {'index.html':'PhoneCam-Link-Preview.html','downloads.html':'PhoneCam-Link-Downloads.html','get-started.html':'PhoneCam-Link-Get-Started.html'};
const documents={};
const css=await readFile(path.join(root,'styles.css'),'utf8');
const js=await readFile(path.join(root,'app.js'),'utf8');
const faviconSVG='data:image/svg+xml;base64,'+(await readFile(path.join(root,'assets/favicon.svg'))).toString('base64');
const faviconPNG='data:image/png;base64,'+(await readFile(path.join(root,'assets/favicon-32.png'))).toString('base64');
const bridge=`(${installPreviewNavigation.toString()})();`;
for (const page of pages) {
 let {html}=await render({page});
 html=html.replace('<link rel="stylesheet" href="./styles.css">',`<style>${css}</style>`).replace('<script defer src="./app.js"></script>','');
 html=html.replace('</body>',`<script>(()=>{${bridge}\n${js}})();</script>\n</body>`);
 for(const file of await readdir(path.join(root,'assets'))){
  const mime={'.webp':'image/webp','.jpg':'image/jpeg','.svg':'image/svg+xml','.png':'image/png'}[path.extname(file)];
  if(mime&&html.includes(`./assets/${file}`)) html=html.replaceAll(`./assets/${file}`,`data:${mime};base64,${(await readFile(path.join(root,'assets',file))).toString('base64')}`);
 }
 documents[page]=html;
}
const payload=JSON.stringify(documents).replaceAll('<','\\u003c');
for(const page of pages){
 const shell=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>PhoneCam Link — Offline preview</title><link rel="icon" type="image/png" sizes="32x32" href="${faviconPNG}"><link rel="icon" type="image/svg+xml" href="${faviconSVG}"><style>html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#f7f8fc}iframe{width:100%;height:100%;border:0;display:block}</style></head><body><iframe id="preview-frame" title="PhoneCam Link website preview"></iframe><script>(${installPreviewShell.toString()})(${payload},${JSON.stringify(page)});</script></body></html>`;
 await writeFile(path.join(root,names[page]),shell);console.log(`Created ${names[page]} (all pages included)`);
}
