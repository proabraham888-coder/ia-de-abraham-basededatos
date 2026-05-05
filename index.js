const express = require('express');
const basicAuth = require('express-basic-auth');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');

const app = express();
const genAI = new GoogleGenerativeAI("AIzaSyDNKRopoJ1xdQoX8epvmyR1LdrXpIFsTPU");

app.use(basicAuth({
    users: { "abraham": "12345" }, // Usuario y contraseña para el link
    challenge: true
}));

async function consultarIA(pregunta) {
    const data = fs.readFileSync('personas.json', 'utf-8');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Eres un asistente de base de datos. Tienes estos datos: ${data}. 
    Responde de forma precisa a: ${pregunta}. Si pides una lista, usa viñetas.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
}

app.get('/buscar', async (req, res) => {
    const q = req.query.q;
    if (!q) return res.send("Escribe una pregunta en la URL, ej: ?q=quien es Juan");
    try {
        const respuesta = await consultarIA(q);
        res.send(`<h2>Resultado:</h2><p>${respuesta}</p>`);
    } catch (e) { res.status(500).send("Error: " + e.message); }
});

app.listen(process.env.PORT || 3000);
