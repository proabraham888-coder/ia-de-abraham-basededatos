const express = require('express');
const basicAuth = require('express-basic-auth');
const fs = require('fs');
const axios = require('axios');
const app = express();

app.use(basicAuth({
    users: { "abraham": "12345" },
    challenge: true
}));

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Abraham AI | Pro</title>
            <style>
                body { font-family: 'Segoe UI', sans-serif; background: #0f172a; color: white; margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }
                .card { background: #1e293b; padding: 30px; border-radius: 20px; width: 90%; max-width: 400px; text-align: center; box-shadow: 0 15px 35px rgba(0,0,0,0.4); border: 1px solid #334155; }
                h1 { color: #38bdf8; margin-bottom: 5px; }
                p { color: #94a3b8; font-size: 14px; margin-bottom: 25px; }
                input { width: 100%; padding: 12px; border-radius: 10px; border: 2px solid #334155; background: #0f172a; color: white; outline: none; box-sizing: border-box; }
                button { width: 100%; padding: 12px; margin-top: 15px; border-radius: 10px; border: none; background: #38bdf8; color: #0f172a; font-weight: bold; cursor: pointer; }
                #resultado { margin-top: 20px; padding: 15px; background: #1a2232; border-radius: 10px; text-align: left; font-size: 14px; border-left: 4px solid #38bdf8; min-height: 40px; }
            </style>
        </head>
        <body>
            <div class="card">
                <h1>🤖 Abraham DB-AI</h1>
                <p>Consulta datos de personas mediante IA</p>
                <input type="text" id="pregunta" placeholder="Ej: ¿Quién es Valentina Gómez?">
                <button onclick="enviar()">CONSULTAR AHORA</button>
                <div id="resultado">Esperando pregunta...</div>
            </div>
            <script>
                async function enviar() {
                    const input = document.getElementById('pregunta');
                    const r = document.getElementById('resultado');
                    if(!input.value) return;
                    r.innerHTML = "<span style='color: #38bdf8;'>Buscando en la base de datos...</span>";
                    try {
                        const res = await fetch('/api/ia?q=' + encodeURIComponent(input.value));
                        const data = await res.text();
                        r.innerHTML = data;
                    } catch (e) { r.innerHTML = "Error de conexión."; }
                }
            </script>
        </body>
        </html>
    `);
});

app.get('/api/ia', async (req, res) => {
    try {
        const db = fs.readFileSync('personas.json', 'utf-8');
        const promptInterno = "Eres un buscador de base de datos. Estos son tus únicos datos: " + db + ". Si te preguntan por alguien de la lista, da todos sus datos (edad, ciudad, gmail, etc). Si no está, di que no lo encontraste.";

        const response = await axios.get('https://api.alyacore.xyz/ai/gptprompt', {
            params: {
                text: req.query.q,
                prompt: promptInterno,
                key: 'Alya-QLK5j2wJ'
            }
        });

        res.send(response.data.data || "No pude encontrar esa información.");
    } catch (error) {
        res.status(500).send("Error en la IA.");
    }
});

app.listen(process.env.PORT || 3000);
