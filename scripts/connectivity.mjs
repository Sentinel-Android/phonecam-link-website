import { transportArt } from './transport-art.mjs';
import { escapeHTML } from './html.mjs';
const statuses = { implemented: 'In the app', planned: 'Planned', testing: 'In testing' };
const visuals = new Set(['wireless','cable','direct','network']);
const icon = name => `<svg aria-hidden="true"><use href="#i-${name}"/></svg>`;
export function validateConnections(items) {
  if (!Array.isArray(items) || !items.length) throw new Error('Connectivity needs at least one item.');
  const ids = new Set();
  for (const item of items) {
    if (!item || typeof item !== 'object' || !/^[a-z][a-z0-9-]*$/.test(item.id) || ids.has(item.id)) throw new Error('Connectivity ids must be unique lowercase identifiers.');
    ids.add(item.id);
    if (!(item.status in statuses)) throw new Error(`Unknown connection status: ${item.status}`);
    if (!visuals.has(item.visual)) throw new Error(`Unknown visual: ${item.visual}`);
    for (const field of ['title','eyebrow','headline','description','note']) if (typeof item[field] !== 'string' || !item[field].trim()) throw new Error(`Connection ${item.id} needs ${field}.`);
    if (!Array.isArray(item.steps) || !item.steps.length || !item.steps.every(s=>typeof s === 'string' && s.trim())) throw new Error('Connection steps must be nonempty strings.');
  }
  return items;
}
export function renderConnections(items) {
  validateConnections(items);
  const tabs = items.map((item,i)=>`<button type="button" role="tab" id="tab-${item.id}" aria-controls="panel-${item.id}" aria-selected="${i===0}" tabindex="${i===0 ? 0 : -1}">${icon(item.visual==='cable'?'cable':'wifi')}<span>${escapeHTML(item.title)}</span>${item.status==='planned'?'<small>PLANNED</small>':''}</button>`).join('\n');
  const panels = items.map((item,i)=>`<section class="connection-panel" id="panel-${item.id}" role="tabpanel" aria-labelledby="tab-${item.id}" tabindex="0" ${i?'hidden':''} data-visual="${item.visual}">
    <div class="connection-story"><span class="feature-status ${item.status}">${statuses[item.status]}</span><p class="eyebrow">${escapeHTML(item.eyebrow)}</p><h3>${escapeHTML(item.headline)}</h3><p>${escapeHTML(item.description)}</p><ol class="connection-steps">${item.steps.map(s=>`<li>${escapeHTML(s)}</li>`).join('')}</ol><p class="connection-note">${escapeHTML(item.note)}</p></div>
    ${transportArt(item.visual,item.id)}
  </section>`).join('\n');
  return `<div class="connection-tabs" role="tablist" aria-label="Connection methods">${tabs}</div><div class="connection-panels">${panels}</div>`;
}
