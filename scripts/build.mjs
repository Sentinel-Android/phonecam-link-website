import { mkdir, writeFile, copyFile, rm, readdir } from 'node:fs/promises';
import path from 'node:path';
import { render, root, escapeHTML, pages } from './render.mjs';
try {
  const { html, config } = await render({ production: process.argv.includes('--production') });
  const dist = path.join(root,'dist');
  await rm(dist,{recursive:true,force:true});
  await mkdir(path.join(dist,'assets'),{recursive:true});
  for (const page of pages) await writeFile(path.join(dist,page),(await render({page,production:process.argv.includes('--production')})).html);
  for (const file of ['styles.css','app.js']) await copyFile(path.join(root,file),path.join(dist,file));
  for (const file of await readdir(path.join(root,'assets'))) if (/\.(webp|jpg|svg)$/.test(file) || file==='favicon-32.png') await copyFile(path.join(root,'assets',file),path.join(dist,'assets',file));
  await writeFile(path.join(dist,'.nojekyll'),'');
  const robots = config.siteUrl ? `User-agent: *\nAllow: /\nSitemap: ${config.siteUrl}/sitemap.xml\n` : 'User-agent: *\nDisallow: /\n';
  await writeFile(path.join(dist,'robots.txt'),robots);
  if (config.siteUrl) await writeFile(path.join(dist,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map(page=>`<url><loc>${escapeHTML(config.siteUrl)}/${page==='index.html'?'':page}</loc></url>`).join('')}</urlset>\n`);
  await writeFile(path.join(dist,'404.html'),'<!doctype html><html lang="en"><meta charset="UTF-8"><meta name="viewport" content="width=device-width"><title>Page not found — PhoneCam Link</title><style>body{background:#f0f1f5;color:#191a1c;font:18px Arial;padding:12vh 10vw}h1{font-size:54px;letter-spacing:-3px}a{color:inherit}</style><h1>A different view.</h1><p>This page could not be found.</p><a href="'+(config.siteUrl ? escapeHTML(config.siteUrl)+'/' : './')+'">Return to PhoneCam Link →</a></html>');
  console.log(`Built dist/ (${config.repositoryUrl ? 'GitHub release links configured' : 'preview — release links unconfigured'}).`);
} catch (error) { console.error(error.message); process.exitCode = 1; }
