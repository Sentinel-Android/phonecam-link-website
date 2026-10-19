import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveConfig, linkAttrs, render } from './render.mjs';
const raw={repositoryUrl:'',releaseTag:'',androidDownloadUrl:'',windowsDownloadUrl:'',siteUrl:'',releaseLabel:'Available on GitHub',description:'Phone camera sharing'};
test('An unconfigured preview never invents a repository or a download',()=>{
  const c=resolveConfig(raw,{siteUrl:''}); assert.equal(c.androidUrl,''); assert.equal(c.windowsUrl,''); assert.match(linkAttrs(c.androidUrl),/aria-disabled="true"/); assert.doesNotMatch(linkAttrs(c.androidUrl),/href=/);
});
test('Publishing requires both a real repository and a canonical URL',()=>{
  assert.throws(()=>resolveConfig(raw,{production:true,siteUrl:''}),/repositoryUrl/);
  assert.throws(()=>resolveConfig({...raw,repositoryUrl:'https://github.com/phonecam-dev/app'},{production:true,siteUrl:''}),/siteUrl/);
});
test('GitHub release targets stay distinct and tags are encoded',()=>{
  const c=resolveConfig({...raw,repositoryUrl:'https://github.com/phonecam-dev/app/',releaseTag:'test/tag',androidDownloadUrl:'https://github.com/phonecam-dev/app/releases/download/v1/app.apk'});
  assert.equal(c.releasesUrl,'https://github.com/phonecam-dev/app/releases'); assert.equal(c.windowsUrl,'https://github.com/phonecam-dev/app/releases/tag/test%2Ftag'); assert.match(c.androidUrl,/app\.apk$/);
});
test('Reject unsafe URLs and example placeholders; escape attributes',()=>{
  for(const repositoryUrl of ['javascript:alert(1)','https://github.com/OWNER/REPO','https://github.com.evil.test/a/b']) assert.throws(()=>resolveConfig({...raw,repositoryUrl}));
  for(const windowsDownloadUrl of ['javascript:alert(1)','https://evil.test/a/b/releases','https://github.com/a/b/issues']) assert.throws(()=>resolveConfig({...raw,windowsDownloadUrl}));
  assert.equal(linkAttrs('https://github.com/a/b/releases?a=1&b=2'),'href="https://github.com/a/b/releases?a=1&amp;b=2"');
});
test('Rendered HTML contains no template tokens and keeps essential copy without JS',async()=>{
  const {html}=await render({page:'downloads.html'}); assert.doesNotMatch(html,/\{\{[A-Z_]+\}\}/); assert.match(html,/<h1/); assert.match(html,/Android download/); assert.match(html,/Windows download/); assert.match(html,/id="download"/);
});

import { readFile } from 'node:fs/promises';
import { renderConnections } from './connectivity.mjs';
test('All pages render and preserve navigation',async()=>{
 for(const page of ['index.html','downloads.html','get-started.html']) {
  const {html}=await render({page,siteUrl:'https://example.com/project'});
  assert.doesNotMatch(html,/\{\{[A-Z_]+\}\}/);
  assert.match(html,/downloads.html/);
  assert.ok(html.includes(`https://example.com/project/${page==='index.html'?'':page}`));
 }
 await assert.rejects(()=>render({page:'../secret'}),/Unknown page/);
});
test('Connectivity expands and reorders without a fixed tab count',async()=>{
 const items=JSON.parse(await readFile(new URL('../content/connectivity.json',import.meta.url)));
 const extra={...items[0],id:'future-network',title:'Future network',visual:'network',status:'planned'};
 const html=renderConnections([extra,...items.reverse()]);
 assert.equal((html.match(/role="tab"/g)||[]).length,items.length+1);
 assert.equal((html.match(/role="tabpanel"/g)||[]).length,items.length+1);
 assert.match(html,/id="tab-future-network"[^>]+aria-selected="true"/);
 assert.throws(()=>renderConnections([extra,extra]),/unique/);
});
test('An independent GitHub releases index supplies download fallbacks',()=>{
 const c=resolveConfig({...raw,releasesUrl:'https://github.com/camera/releases-app/releases'});
 assert.equal(c.androidUrl,'https://github.com/camera/releases-app/releases/latest');
});

test('All production pages contain the shared top button and tab icon fallbacks',async()=>{
 for(const page of ['index.html','downloads.html','get-started.html']){
  const {html}=await render({page});assert.match(html,/id="scroll-top"[^>]*hidden/);assert.match(html,/image\/png" sizes="32x32" href="\.\/assets\/favicon-32.png"/);assert.match(html,/image\/svg\+xml" href="\.\/assets\/favicon.svg"/);
 }
});
