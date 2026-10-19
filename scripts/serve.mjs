import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { render, root, pages } from './render.mjs';
const built = process.argv.includes('--dist');
const base = path.resolve(built ? path.join(root,'dist') : root);
const portIndex = process.argv.indexOf('--port');
const port = Number(portIndex >= 0 ? process.argv[portIndex+1] : process.env.PORT || 5173);
// --base is a local test convenience for project sites hosted under /REPO/.
const baseIndex = process.argv.indexOf('--base');
const prefix = baseIndex >= 0 ? '/' + process.argv[baseIndex+1].replace(/^\/+|\/+$/g,'') : '';
const host = process.env.HOST || '127.0.0.1';
const mime = { '.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.webp':'image/webp','.jpg':'image/jpeg','.svg':'image/svg+xml','.png':'image/png','.txt':'text/plain; charset=utf-8','.xml':'application/xml' };
createServer(async (req,res) => {
  if (!['GET','HEAD'].includes(req.method)) { res.writeHead(405,{Allow:'GET, HEAD'}).end(); return; }
  try {
    let pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if (prefix) {
      if (pathname === prefix) { res.writeHead(302,{Location:prefix+'/'}).end(); return; }
      if (!pathname.startsWith(prefix+'/')) { res.writeHead(404).end('Not found'); return; }
      pathname = pathname.slice(prefix.length);
    }
    const relative = pathname === '/' ? 'index.html' : pathname.slice(1);
    const file = path.resolve(base,relative);
    if (!file.startsWith(base+path.sep) || (!built && ![...pages,'styles.css','app.js'].includes(relative) && !/^assets\/[\w.-]+\.(webp|jpg|svg|png)$/.test(relative))) { res.writeHead(404).end('Not found'); return; }
    const bytes = !built && pages.includes(relative) ? (await render({page:relative})).html : await readFile(file);
    res.writeHead(200,{'Content-Type':mime[path.extname(file)] || 'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
    res.end(req.method === 'HEAD' ? undefined : bytes);
  } catch (error) { res.writeHead(error.code === 'ENOENT' ? 404 : 500,{'Content-Type':'text/plain'}).end(error.code === 'ENOENT' ? 'Not found' : 'Preview error: '+error.message); }
}).listen(port,host,() => console.log(`PhoneCam Link ${built ? 'build preview' : 'development'}: http://${host}:${port}${prefix}/`));
