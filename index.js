const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const basicAuth = require('express-basic-auth');

const app = express();

// --- CONFIGURACIÓN ---
const USUARIO = "admin"; 
const PASSWORD = "TuPasswordSeguro"; // La contraseña que darás a tus amigos
const DESTINO = "http://145.2.1.50:8080"; // Aquí pones el link del servidor de Java
// ---------------------

app.use(basicAuth({
    users: { [USUARIO]: PASSWORD },
    challenge: true,
    realm: 'Acceso Privado'
}));

app.use('/', createProxyMiddleware({ 
    target: DESTINO, 
    changeOrigin: true,
    ws: true 
}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Servidor listo en puerto ' + PORT));
