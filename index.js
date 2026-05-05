const express = require('express');
const basicAuth = require('express-basic-auth');
const fs = require('fs');
const axios = require('axios');
const app = express();

// Seguridad: Usuario y Contraseña
app.use(basicAuth({
    users: { "abraham": "12345" },
    challenge: true
}));

// Interfaz Visual
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
                button { width: 100%; padding: 12px; margin-top: 15px; border-radius: 10px; border: none; background: #38bdf8; color: #0f172a; font-weight: bold; cursor: pointer; transition: 0.3s; }
                button:hover { background: #7dd3fc; }
                #resultado { margin-top: 20px; padding: 15px; background: #1a2232; border-radius: 10px; text-align: left; font-size: 14px; border-left: 4px solid #38bdf8; min-height: 40px; color: #e2e8f0; }
            </style>
        </head>
        <body>
            <div class="card">
                <h1>🤖 Abraham AI</h1>
                <p>Consultor de Base de Datos Personal</p>
                <input type="text" id="pregunta" placeholder="Ej: ¿Quién es Valentina Gómez?">
                <button onclick="enviar()">CONSULTAR AHORA</button>
                <div id="resultado">Esperando pregunta...</div>
            </div>
            <script>
                async function enviar() {
                    const input = document.getElementById('pregunta');
                    const r = document.getElementById('resultado');
                    if(!input.value) return;
                    r.innerHTML = "<span style='color: #38bdf8;'>Buscando información...</span>";
                    try {
                        const res = await fetch('/api/ia?q=' + encodeURIComponent(input.value));
                        const text = await res.text();
                        r.innerHTML = text;
                    } catch (e) { r.innerHTML = "❌ Error de conexión."; }
                }
            </script>
        </body>
        </html>
    `);
});

// Lógica de la API con el nuevo endpoint
app.get('/api/ia', async (req, res) => {
    const q = req.query.q;
    try {
        // Leemos la base de datos para dársela a la IA
        const db = fs.readFileSync('personas.json', 'utf-8');
        
        // Creamos el mensaje combinando tus datos y la pregunta
        const mensajeCompleto = \`Contexto de mi base de datos: \${db}. Pregunta del usuario: \${q}. Responde de forma breve y precisa.\`;

        const response = await axios.get('https://api.alyacore.xyz/ai/chatgpt', {
            params: {
                text: mensajeCompleto,
                key: 'Alya-QLK5j2wJ'
            }
        });

        // La nueva API devuelve la respuesta en response.data.result
        const respuestaIA = response.data.result || "No pude procesar la información.";
        res.send(respuestaIA);

    } catch (error) {
        console.error(error);
        res.status(500).send("Error: La IA de Alyacore no respondió correctamente.");
    }
});

app.listen(process.env.PORT || 3000);
