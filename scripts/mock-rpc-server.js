const http = require('http');
const PORT = process.env.RPC_PORT || 4000;

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/rpc') {
    let data = '';
    req.on('data', chunk => (data += chunk));
    req.on('end', () => {
      let body = {};
      try { body = JSON.parse(data || '{}'); } catch {}
      const { method, params } = body;

      res.setHeader('Content-Type', 'application/json');

      if (method === 'ping') {
        res.writeHead(200);
        return res.end(JSON.stringify({ result: 'pong' }));
      }
      if (method === 'sum' && Array.isArray(params)) {
        const total = params.reduce((a, b) => a + Number(b || 0), 0);
        res.writeHead(200);
        return res.end(JSON.stringify({ result: total }));
      }
      if (method === 'authRequired') {
        if (!req.headers['authorization']) {
          res.writeHead(401);
          return res.end(JSON.stringify({ error: 'missing auth' }));
        }
        res.writeHead(200);
        return res.end(JSON.stringify({ result: 'ok' }));
      }

      res.writeHead(400);
      return res.end(JSON.stringify({ error: 'unknown method' }));
    });
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`Mock RPC s
