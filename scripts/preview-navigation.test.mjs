import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {installPreviewNavigation} from './preview-navigation.mjs';
function environment({reduced=false}={}){
 let click;const messages=[],scrolls=[];
 const target={scrollIntoView(options){scrolls.push(options)}};
 const context={document:{body:target,addEventListener(type,fn){click=fn},getElementById(id){return ['use-cases','app-preview','connection','experience'].includes(id)?target:null}},window:{matchMedia(){return {matches:reduced}}},parent:{postMessage(data){messages.push(data)}}};
 vm.runInNewContext(`(${installPreviewNavigation.toString()})();`,context);
 return {messages,scrolls,click(href,extra={}){let prevented=false;click({button:0,target:{closest(){return {getAttribute(){return href}}}},preventDefault(){prevented=true},...extra});return prevented}};
}
test('Offline same-page section links scroll inside the embedded document',()=>{
 const e=environment();for(const id of ['use-cases','app-preview','connection','experience'])assert.equal(e.click('#'+id),true);
 assert.equal(e.scrolls.length,0);assert.equal(e.messages.length,4);assert.equal(e.messages[0].type,'phonecam-preview-section');assert.equal(e.messages[0].hash,'#use-cases');
});
test('Offline cross-page links retain their section target; external and modified clicks stay native',()=>{
 const e=environment();assert.equal(e.click('./index.html#connection'),true);assert.equal(e.messages[0].page,'index.html');assert.equal(e.messages[0].hash,'#connection');
 assert.equal(e.click('https://github.com/example/app'),false);assert.equal(e.click('./downloads.html',{ctrlKey:true}),false);
});
test('The home logo asks the parent to record a top-of-page route',()=>{
 const e=environment({reduced:true});assert.equal(e.click('#'),true);assert.equal(e.messages[0].type,'phonecam-preview-section');assert.equal(e.messages[0].hash,'#');
});
