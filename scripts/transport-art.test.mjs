import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {transportArt} from './transport-art.mjs';
const css=await readFile(new URL('../styles.css',import.meta.url),'utf8');
test('Wireless illustrations contain matching signal geometry and no USB hardware',()=>{
 for(const visual of ['wireless','direct']){
  const html=transportArt(visual);
  assert.doesNotMatch(html,/transport-usb-hardware|transport-wire|usb-packet/);
  const waves=[...html.matchAll(/class="wifi-signal" transform="translate\(([^)]+)\)"[^>]*>([\s\S]*?)<\/g><circle/g)];
  assert.equal(waves.length,2);assert.equal(waves[0][2],waves[1][2]);
  assert.equal(waves[0][1].split(' ')[1],waves[1][1].split(' ')[1]);
 }
});
test('USB packet follows the complete wire and uses its measured full-path animation',()=>{
 const html=transportArt('cable');
 const base=html.match(/class="transport-wire" d="([^"]+)"/)[1],pulse=html.match(/class="usb-packet" d="([^"]+)"/)[1];
 assert.equal(base,pulse);assert.match(css,/usb-full-path\s*\{\s*from\s*\{stroke-dashoffset:var\(--wire-length\)\}\s*to\s*\{stroke-dashoffset:0\}/);
 assert.match(css,/\.usb-packet\s*\{[^}]*stroke-dasharray:var\(--packet-length\) var\(--packet-gap\);[^}]*animation:usb-full-path/);
});
test('Flip mirrors horizontally without turning the image upside down',()=>{
 assert.match(css,/\.demo-crop\[data-flipped=true\]>img\s*\{\s*transform:scaleX\(-1\)/);
 assert.match(css,/\.demo-crop\[data-format=portrait\]\[data-flipped=true\]>img\s*\{\s*transform:scale\(-1\.05,1\.05\)/);
});
