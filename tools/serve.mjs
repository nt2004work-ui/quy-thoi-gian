// Máy chủ tĩnh tối giản để thử cục bộ: node tools/serve.mjs [cổng]
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('..', import.meta.url));
const port = +process.argv[2] || 5180;
const T = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };
http.createServer(async (q, r) => {
  let p = decodeURIComponent(new URL(q.url, 'http://x').pathname);
  if (p.endsWith('/')) p += 'index.html';
  const full = join(root, p);
  const rel = relative(root, full);
  if (rel.startsWith('..') || isAbsolute(rel)) { r.writeHead(403); return r.end('403'); }
  try { const b = await readFile(full); r.writeHead(200, { 'Content-Type': T[extname(full)] || 'application/octet-stream' }); r.end(b); }
  catch { r.writeHead(404); r.end('404'); }
}).listen(port, () => console.log('http://localhost:' + port));
