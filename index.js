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

// Interfaz (Sin cambios, sigue siendo la misma que te gustó)
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Abraham AI | Global</title>
            <style>
                body { font-family: sans-serif; background: #0f172a; color: white; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                .card { background: #1e293b; padding: 30px; border-radius: 20px; width: 90%; max-width: 400px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
                input { width: 100%; padding: 12px; border-radius: 10px; border: none; background: #0f172a; color: white; margin-bottom: 15px; box-sizing: border-box; outline: none; }
                button { width: 100%; padding: 12px; border-radius: 10px; border: none; background: #38bdf8; color: #0f172a; font-weight: bold; cursor: pointer; }
                #resultado { margin-top: 20px; text-align: left; background: #111827; padding: 15px; border-radius: 10px; font-size: 14px; min-height: 40px; line-height: 1.5; }
            </style>
        </head>
        <body>
            <div class="card">
                <h1>🌍 Abraham AI Global</h1>
                <p>Busca en mi DB o en Internet</p>
                <input type="text" id="p" placeholder="Ej: Messi o alguien de mi lista">
                <button onclick="buscar()">CONSULTAR</button>
                <div id="resultado">Esperando...</div>
            </div>
            <script>
                async function buscar() {
                    const q = document.getElementById('p').value;
                    const r = document.getElementById('resultado');
                    if(!q) return;
                    r.innerHTML = "Investigando...";
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

// Lógica Híbrida (DB Privada + Conocimiento Global)
app.get('/api/ia', async (req, res) => {
    const q = req.query.q;
    try {
        const db = fs.readFileSync('personas.json', 'utf-8');
        
        // Aquí está el truco: le damos permiso de buscar fuera si no está en la DB
        const instrucciones = "Eres un asistente con acceso a dos fuentes: 1) Mi base de datos privada: " + db + ". 2) Tu conocimiento global de internet. Si la persona está en mi base de datos, dame esos datos exactos. Si NO está, busca información pública en internet sobre esa persona y resúmela.";

        const response = await axios.get('https://api.alyacore.xyz/ai/chatgpt', {
            params: {
                text: "Pregunta: " + q + " | Instrucción: " + instrucciones,
                key: 'Alya-QLK5j2wJ'
            }
        });

        res.send(response.data.result || "No encontré información ni en la DB ni en internet.");
    } catch (e) {
        res.status(500).send("Error al consultar la IA.");
    }
});

app.listen(process.env.PORT || 3000);
