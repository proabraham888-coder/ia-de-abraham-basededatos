const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de Identidad
const ADMIN = "pro_abraham";
const DB_PATH = './personas.json';

// Verificar base de datos
if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, '[]');

// --- INTERFAZ HTML/CSS DEL DASHBOARD ---
const getDashboardHTML = (data) => `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IA-ABRAHAM | Intelligence Center</title>
    <style>
        :root { --bg: #0d1117; --card: #161b22; --border: #30363d; --accent: #58a6ff; --success: #238636; }
        body { background: var(--bg); color: #c9d1d9; font-family: 'Segoe UI', Tahoma, sans-serif; margin: 0; padding: 20px; }
        .container { max-width: 1000px; margin: auto; border: 1px solid var(--border); padding: 30px; border-radius: 12px; background: var(--card); }
        h1 { color: var(--accent); text-align: center; font-size: 24px; border-bottom: 1px solid var(--border); padding-bottom: 15px; }
        .status-bar { display: flex; justify-content: space-between; font-size: 12px; color: #8b949e; margin-bottom: 20px; text-transform: uppercase; }
        .search-area { display: flex; gap: 10px; margin: 30px 0; }
        input { flex: 1; padding: 12px; background: var(--bg); border: 1px solid var(--border); color: white; border-radius: 6px; outline: none; }
        input:focus { border-color: var(--accent); }
        button { padding: 12px 25px; background: var(--success); color: white; border: none; cursor: pointer; border-radius: 6px; font-weight: bold; }
        button:hover { background: #2ea043; }
        .table-container { overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { background: var(--bg); color: var(--accent); text-align: left; padding: 12px; border: 1px solid var(--border); }
        td { padding: 12px; border: 1px solid var(--border); font-size: 14px; }
        tr:hover { background: #1f242c; }
        .badge { background: rgba(88, 166, 255, 0.1); color: var(--accent); padding: 3px 8px; border-radius: 12px; font-size: 12px; border: 1px solid var(--accent); }
        #loader { display: none; text-align: center; color: #e3b341; margin-bottom: 15px; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="status-bar">
            <span>Agente: ${ADMIN}</span>
            <span style="color:var(--success)">● Sistema Activo</span>
        </div>
        <h1>COMMAND CENTER - INVESTIGACIÓN</h1>
        
        <div class="search-area">
            <input type="text" id="userInput" placeholder="Ingresa usuario de Instagram (ej: cristiano)">
            <button onclick="ejecutarExtraccion()">EXTRAER INTELIGENCIA</button>
        </div>

        <div id="loader">Cargando protocolos de extracción... por favor espere...</div>

        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Expediente</th>
                        <th>Objetivo</th>
                        <th>Seguidores</th>
                        <th>Agente</th>
                        <th>Fecha</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(exp => `
                        <tr>
                            <td><small>${exp.id_expediente}</small></td>
                            <td><span class="badge">@${exp.objetivo}</span></td>
                            <td>${exp.seguidores.toLocaleString()}</td>
                            <td>${exp.agente}</td>
                            <td>${new Date(exp.fecha).toLocaleDateString()}</td>
                        </tr>
                    `).reverse().join('')}
                </tbody>
            </table>
        </div>
    </div>

    <script>
        async function ejecutarExtraccion() {
            const user = document.getElementById('userInput').value;
            if(!user) return alert('Debe especificar un objetivo.');
            
            document.getElementById('loader').style.display = 'block';
            try {
                const response = await fetch(\`/investigar?usuario=\${user}\`);
                const resData = await response.json();
                if(resData.status === "EXITO") {
                    location.reload();
                } else {
                    alert('Error: No se pudo completar la extracción OSINT.');
                }
            } catch (err) {
                alert('Fallo en la comunicación con el servidor.');
            } finally {
                document.getElementById('loader').style.display = 'none';
            }
        }
    </script>
</body>
</html>
`;

// --- RUTAS DEL SERVIDOR ---

app.get('/', (req, res) => {
    try {
        const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8') || "[]");
        res.send(getDashboardHTML(db));
    } catch (e) {
        res.send("Error al cargar la base de datos.");
    }
});

app.get('/investigar', async (req, res) => {
    const usuario = req.query.usuario;
    if (!usuario) return res.status(400).json({ status: "ERROR" });

    try {
        const apiURL = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${usuario}`;
        const response = await axios.get(apiURL, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'X-IG-App-ID': '936619743392459'
            }
        });

        const user = response.data.data.user;
        const nuevoExpediente = {
            id_expediente: `CASE-\${Math.floor(1000 + Math.random() * 9000)}`,
            objetivo: user.username,
            seguidores: user.edge_followed_by.count,
            agente: ADMIN,
            fecha: new Date().toISOString()
        };

        let db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8') || "[]");
        db.push(nuevoExpediente);
        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

        res.json({ status: "EXITO", data: nuevoExpediente });

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "ERROR", msg: "Fallo en la extracción" });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor de Inteligencia corriendo en puerto \${PORT}`);
});

