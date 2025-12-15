// Servidor mock isolado para desenvolvimento (migrado de src/js/denuncia.js)
// Executar com: node backend/denuncia_server.js

const jsonServer = require('json-server');
const path = require('path');

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, '../codigo/db/db.json'));

// Ajuste de middlewares: manter o comportamento de desenvolvimento
const middlewares = jsonServer.defaults({ noCors: true });
server.use(middlewares);
server.use(router);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`JSON Server mock running at http://localhost:${PORT}`);
});
