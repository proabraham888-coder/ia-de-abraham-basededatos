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

// DECODIFICACIÓN DE TU LLAVE DE OPENAI
const apikey_base64 = 'c2stcHJvai1tUzN4bGZueXo0UjBPWV8zbm1DVDlMQmlmYXhYbVdaa0ptUVFJMDVKR2FxdHZCbk9ncWZjRXdCbEJmMU5WN0lYa0pncVJuM3BNc1QzQmxia0ZKMVJ5aEJzUl93NzRXbll5LWdjdkowT0NQUXliWTBOcENCcDZIOTlCVVVtcWxuTjVraEZxMk43TGlMU0RsU0s1cXA5Tm1kWVZXc0E=';
const OPENAI_KEY = Buffer.from(apikey_base64, 'base64').toString('utf-8');

// INTERFAZ VISUAL
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>GataBot-MD | Abraham AI</title>
            <style>
                body { font-family: sans-serif; background: #0b0f1a; color: white; margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden; }
                .card { background: #161e2d; padding: 20px; border-radius: 25px; width: 95%; max-width: 450px; height: 85vh; display: flex; flex-direction: column; box-shadow: 0 15px 50px rgba(0,0,0,0.6); border: 1px solid #2d3748; }
                #chat { flex-grow: 1; overflow-y: auto; margin-bottom: 15px; padding: 10px; display: flex; flex-direction: column; gap: 12px; scroll-behavior: smooth; }
                .msg { padding: 12px 16px; border-radius: 15px; font-size: 14px; max-width: 85%; line-height: 1.5; }
                .user { background: #2d3748; align-self: flex-end; border-bottom-right-radius: 2px; }
                .ai { background: #1e3a8a; align-self: flex-start; border-bottom-left-radius: 2px; border-left: 3px solid #38bdf8; }
                .loader { height: 3px; width: 0%; background: #38bdf8; margin-bottom: 10px; transition: 0.3s; border-radius: 10px; }
                .input-area { display: flex; gap: 8px; background: #0b0f1a; padding: 10px; border-radius: 15px; }
                input { flex-grow: 1; padding: 12px; border: none; background: transparent; color: white; outline: none; }
                button { background: #38bdf8; border: none; padding: 10px 18px; border-radius: 12px; font-weight: bold; cursor: pointer; }
            </style>
        </head>
        <body>
            <div class="card">
                <h2 style="text-align:center; color:#38bdf8; margin:0 0 10px 0; font-size:18px;">🐈 GATABOT-MD AI</h2>
                <div id="chat"><div class="msg ai">¡Hola! Soy GataBot-MD. ¿A quién buscamos hoy?</div></div>
                <div id="barra" class="loader"></div>
                <div class="input-area">
                    <input type="text" id="p" placeholder="Escribe tu petición..." onkeypress="if(event.key==='Enter') buscar()">
                    <button onclick="buscar()">ENVIAR</button>
                </div>
            </div>
            <script>
                const sndEnviar = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
                const sndRespuesta = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');

                async function buscar() {
                    const input = document.getElementById('p');
                    const chat = document.getElementById('chat');
                    const barra = document.getElementById('barra');
                    const q = input.value;
                    if(!q) return;

                    sndEnviar.play();
                    chat.innerHTML += '<div class="msg user">' + q + '</div>';
                    input.value = "";
                    barra.style.width = "100%";
                    chat.scrollTop = chat.scrollHeight;

                    try {
                        const res = await fetch('/api/ia?q=' + encodeURIComponent(q));
                        const text = await res.text();
                        
                        sndRespuesta.play();
                        barra.style.width = "0%";
                        chat.innerHTML += '<div class="msg ai"><b>GataBot:</b> ' + text + '</div>';
                        chat.scrollTop = chat.scrollHeight;

                        const speech = new SpeechSynthesisUtterance(text);
                        speech.lang = 'es-ES';
                        window.speechSynthesis.speak(speech);
                    } catch (e) { 
                        barra.style.width = "0%";
                        chat.innerHTML += '<div class="msg ai">❌ Error en los motores de IA.</div>'; 
                    }
                }
            </script>
        </body>
        </html>
    `);
});

// LÓGICA DE IA
app.get('/api/ia', async (req, res) => {
    const text = req.query.q;
    let db = "Sin datos";
    try { db = fs.readFileSync('personas.json', 'utf-8'); } catch(e) {}
    
    const syms1 = "Actuaras como un Bot de WhatsApp creado por GataNina-Li, eres GataBot-MD. Datos: " + db;

    try {
        // Intento 1: Alyacore
        const response = await axios.get('https://api.alyacore.xyz/ai/chatgpt', {
            params: { text: "Instruccion: " + syms1 + ". Pregunta: " + text, key: 'Alya-QLK5j2wJ' }
        });
        if (response.data && response.data.result) return res.send(response.data.result);
        throw new Error();
    } catch (err) {
        // Intento 2: OpenAI (CORREGIDO)
        try {
            const gptRes = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: 'gpt-4o-mini',
                messages: [
                    {role: 'system', content: syms1},
                    {role: 'user', content: text}
                ]
            }, {
                headers: { 'Authorization': 'Bearer ' + OPENAI_KEY }
            });
            res.send(gptRes.data.choices[0].message.content);
        } catch (err2) {
            res.status(500).send("Ninguna IA respondió.");
        }
    }
});

app.listen(process.env.PORT || 3000);

