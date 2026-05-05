const express = require('express');
const basicAuth = require('express-basic-auth');
const fs = require('fs');
const axios = require('axios');
const app = express();

// SEGURIDAD
app.use(basicAuth({
    users: { "abraham": "12345" },
    challenge: true
}));

// INTERFAZ Y LÓGICA VISUAL
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Abraham AI Ultra</title>
            <style>
                body { font-family: 'Segoe UI', sans-serif; background: #0b0f1a; color: white; margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden; }
                .card { background: #161e2d; padding: 20px; border-radius: 25px; width: 95%; max-width: 450px; height: 85vh; display: flex; flex-direction: column; box-shadow: 0 15px 50px rgba(0,0,0,0.6); border: 1px solid #2d3748; }
                #chat { flex-grow: 1; overflow-y: auto; margin-bottom: 15px; padding: 10px; display: flex; flex-direction: column; gap: 12px; scroll-behavior: smooth; }
                .msg { padding: 12px 16px; border-radius: 15px; font-size: 14px; max-width: 85%; line-height: 1.5; position: relative; }
                .user { background: #2d3748; align-self: flex-end; border-bottom-right-radius: 2px; color: #e2e8f0; }
                .ai { background: #1e3a8a; align-self: flex-start; border-bottom-left-radius: 2px; border-left: 3px solid #38bdf8; }
                .loader { height: 3px; width: 0%; background: #38bdf8; margin-bottom: 10px; transition: 0.3s; border-radius: 10px; box-shadow: 0 0 10px #38bdf8; }
                .input-area { display: flex; gap: 8px; background: #0b0f1a; padding: 10px; border-radius: 15px; }
                input { flex-grow: 1; padding: 12px; border: none; background: transparent; color: white; outline: none; font-size: 15px; }
                button { background: #38bdf8; border: none; padding: 10px 18px; border-radius: 12px; color: #0b0f1a; font-weight: bold; cursor: pointer; transition: 0.2s; }
                button:active { transform: scale(0.95); }
                #chat::-webkit-scrollbar { width: 5px; }
                #chat::-webkit-scrollbar-thumb { background: #2d3748; border-radius: 10px; }
            </style>
        </head>
        <body>
            <div class="card">
                <h2 style="text-align:center; color:#38bdf8; margin-top:0; font-size:18px;">🤖 ABRAHAM AI GLOBAL</h2>
                <div id="chat">
                    <div class="msg ai">¡Hola Abraham! Soy tu IA híbrida. Puedo buscar en tu lista de personas o en todo internet. ¿A quién investigamos?</div>
                </div>
                <div id="barra" class="loader"></div>
                <div class="input-area">
                    <input type="text" id="p" placeholder="Pregunta algo..." onkeypress="if(event.key==='Enter') buscar()">
                    <button onclick="buscar()">ENVIAR</button>
                </div>
            </div>

            <script>
                // AUDIOS
                const sndEnviar = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
                const sndRespuesta = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');

                async function buscar() {
                    const input = document.getElementById('p');
                    const chat = document.getElementById('chat');
                    const barra = document.getElementById('barra');
                    const q = input.value;
                    if(!q) return;

                    // Efecto Enviar
                    sndEnviar.play();
                    chat.innerHTML += '<div class="msg user">' + q + '</div>';
                    input.value = "";
                    barra.style.width = "100%"; // Activa barra de carga
                    chat.scrollTop = chat.scrollHeight;

                    try {
                        const res = await fetch('/api/ia?q=' + encodeURIComponent(q));
                        const text = await res.text();
                        
                        // Efecto Respuesta
                        sndRespuesta.play();
                        barra.style.width = "0%"; // Apaga barra
                        chat.innerHTML += '<div class="msg ai">' + text + '</div>';
                        chat.scrollTop = chat.scrollHeight;

                        // Voz
                        const speech = new SpeechSynthesisUtterance(text);
                        speech.lang = 'es-ES';
                        speech.rate = 1.1;
                        window.speechSynthesis.speak(speech);

                    } catch (e) { 
                        barra.style.width = "0%";
                        chat.innerHTML += '<div class="msg ai">❌ Error al conectar con Alyacore.</div>'; 
                    }
                }
            </script>
        </body>
        </html>
    `);
});

// LÓGICA DE LA IA (DB + INTERNET)
app.get('/api/ia', async (req, res) => {
    const q = req.query.q;
    try {
        const db = fs.readFileSync('personas.json', 'utf-8');
        
        // Instrucción Híbrida
        const promptTotal = "Instrucciones: Eres un asistente experto. 1) Revisa mi DB: " + db + ". 2) Si la persona no está ahí, usa internet. Responde de forma natural y clara.";

        const response = await axios.get('https://api.alyacore.xyz/ai/chatgpt', {
            params: {
                text: "Pregunta: " + q + " | Filtro: " + promptTotal,
                key: 'Alya-QLK5j2wJ'
            }
        });

        res.send(response.data.result || "No encontré datos sobre eso.");
    } catch (e) {
        res.status(500).send("Error en el servidor de IA.");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Abraham AI corriendo en puerto ' + PORT));
