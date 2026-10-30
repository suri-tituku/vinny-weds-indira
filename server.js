/**
 * Small dependency-free Node.js web server.
 * Run: npm start    → http://localhost:3000
 * Set PORT to override the port for hosting.
 */
const http = require('node:http');
const path = require('node:path');
const fs = require('node:fs/promises');
const { URL } = require('node:url');

const root = path.join(__dirname, 'public');
const port = Number(process.env.PORT) || 3000;
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.ics': 'text/calendar; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8'
};

http.createServer(async (req, res) => {
  try {
    if (!['GET', 'HEAD'].includes(req.method)) {
      res.writeHead(405, { Allow: 'GET, HEAD' });
      return res.end('Method Not Allowed');
    }

    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    let decoded;
    try { decoded = decodeURIComponent(url.pathname); }
    catch { res.writeHead(400); return res.end('Bad Request'); }

    const resolved = path.resolve(root, '.' + (decoded === '/' ? '/index.html' : decoded));
    if (resolved !== root && !resolved.startsWith(root + path.sep)) {
      res.writeHead(403);
      return res.end('Forbidden');
    }

    let info;
    try { info = await fs.stat(resolved); }
    catch { res.writeHead(404); return res.end('Not Found'); }
    if (!info.isFile()) { res.writeHead(404); return res.end('Not Found'); }

    const ext = path.extname(resolved).toLowerCase();
    const headers = {
      'Content-Type': mime[ext] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600'
    };
    res.writeHead(200, headers);
    if (req.method === 'HEAD') return res.end();
    res.end(await fs.readFile(resolved));
  } catch (error) {
    console.error(error);
    if (!res.headersSent) res.writeHead(500);
    res.end('Internal Server Error');
  }
}).listen(port, '0.0.0.0', () => {
  console.log(`\n💒 Vinay ♥ Indira Wedding Invitation`);
  console.log(`   Open: http://localhost:${port}`);
  console.log(`   Preview without envelope: http://localhost:${port}/?preview=1\n`);
});
