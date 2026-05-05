const express = require('express');
const basicAuth = require('express-basic-auth');
const fs = require('fs');
const axios = require('axios');
const app = express();

// --- CONFIGURACIÓN DE SEGURIDAD ---
app.use(basicAuth({
    users: { "abraham": "12345" }, // Usuario y Contraseña para entrar
    challenge: true
}));

// --- INTERFAZ WEB (HTML/CSS) ---
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Abraham AI | Alyacore</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f172a; color: white; margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }
                .card { background: #1e293b; padding: 40px; border-radius: 24px; width: 90%; max-width: 450px; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.5); border: 1px solid #334155; }
                h1 { color: #38bdf8; font-size: 24px; margin-bottom: 10px; }
                p { color: #94a3b8; font-size: 14px; margin-bottom: 30px; }
                input { width: 100%; padding: 15px; border-radius: 12px; border: 2px solid #334155; background: #0f172a; color: white; font-size: 16px; outline: none; transition: 0.3s; box-sizing: border-box; }
                input:focus { border-color: #38bdf8; }
                button { width: 100%; padding: 15px; margin-top: 20px; border-radius: 12px; border: none; background: #38bdf8; color: #0f172a; font-weight: bold; font-size: 16px; cursor: pointer; transition: 0.3s; }
                button:hover { background: #7dd3fc; transform: translateY(-2px); }
                #resultado { margin-top: 30px; padding: 15px; background: #334155; border-radius: 12px; text-align: left; font-size: 14px; line-height: 1.6; min-height: 50px; border-left: 4px solid #38bdf8; }
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

                    r.innerHTML = "<span style='color: #38bdf8;'>Analizando base de datos...</span>";
                    
                    try {
                        const res = await fetch('/api/ia?q=' + encodeURIComponent(input.value));
                        const data = await res.text();
                        r.innerHTML = data;
                        input.value = ""; // Limpia el buscador
                    } catch (e) {
                        r.innerHTML = "❌ Error al conectar con el servidor.";
                    }
                }
            </script>
        </body>
        </html>
    `);
});

// --- LÓGICA DE LA IA (CONEXIÓN API ALYACORE) ---
app.get('/api/ia', async (req, res) => {
    const preguntaUsuario = req.query.q;
    
    try {
        // 1. Cargamos tu base de datos de 100 personas
        const db = fs.readFileSync('personas.json', 'utf-8');
        
        // 2. Definimos el rol de la IA y le pasamos los datos
        const promptInterno = "Eres un asistente de búsqueda. Solo puedes responder usando esta información: " + db + ". Sé breve y profesional.";

        // 3. Llamada a Alyacore usando tu Key
        const response = await axios.get('https://api.alyacore.xyz/ai/gptprompt', {
            params: {
                text: preguntaUsuario,
                prompt: promptInterno,
                key: 'Alya-QLK5j2wJ' // Tu llave oficial
            }
        });

        // 4. Enviamos la respuesta limpia al navegador
        const respuestaIA = response.data.data || "No pude encontrar esa información.";
        res.send(respuestaIA);

    } catch (error) {
        console.error("Error en la API:", error.message);
        res.status(500).send("Error: La IA no está disponible en este momento.");
    }
});

// --- ENCENDER SERVIDOR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Servidor Pro en puerto ' + PORT));
