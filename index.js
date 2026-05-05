const express = require('express');
const basicAuth = require('express-basic-auth');
const fs = require('fs');
const axios = require('axios');
const app = express();

// Seguridad
app.use(basicAuth({
    users: { "abraham": "12345" },
    challenge: true
}));

// Interfaz
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Abraham AI</title>
            <style>
                body { font-family: sans-serif; background: #0f172a; color: white; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                .card { background: #1e293b; padding: 30px; border-radius: 20px; width: 90%; max-width: 400px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
                input { width: 100%; padding: 12px; border-radius: 10px; border: none; background: #0f172a; color: white; margin-bottom: 15px; box-sizing: border-box; outline: none; }
                button { width: 100%; padding: 12px; border-radius: 10px; border: none; background: #38bdf8; color: #0f172a; font-weight: bold; cursor: pointer; }
                #resultado { margin-top: 20px; text-align: left; background: #111827; padding: 15px; border-radius: 10px; font-size: 14px; min-height: 40px; }
            </style>
        </head>
        <body>
            <div class="card">
                <h1>🤖 Abraham AI</h1>
                <input type="text" id="p" placeholder="¿A quién buscas?">
                <button onclick="buscar()">CONSULTAR</button>
                <div id="resultado">Esperando...</div>
            </div>
            <script>
                async function buscar() {
                    const q = document.getElementById('p').value;
                    const r = document.getElementById('resultado');
                    if(!q) return;
                    r.innerHTML = "Buscando...";
                    try {
                        const res = await fetch('/api/ia?q=' + encodeURIComponent(q));
                        const text = await res.text();
                        r.innerHTML = text;
                    } catch (e) { r.innerHTML = "Error de conexión."; }
                }
            </script>
        </body>
        </html>
    `);
});

// API con Alyacore
app.get('/api/ia', async (req, res) => {
    const q = req.query.q;
    try {
        const db = fs.readFileSync('personas.json', 'utf-8');
        
        // CORREGIDO: Sin barras invertidas raras
        const mensajeFinal = "Contexto: " + db + ". Pregunta: " + q;

        const response = await axios.get('https://api.alyacore.xyz/ai/chatgpt', {
            params: {
                text: mensajeFinal,
                key: 'Alya-QLK5j2wJ'
            }
        });

        res.send(response.data.result || "No hay respuesta.");
    } catch (e) {
        res.status(500).send("Error en la IA.");
    }
});

app.listen(process.env.PORT || 3000);
