const axios = require('axios');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const Table = require('cli-table3');
const readline = require('readline-sync');

// Configuración del Sistema
const ADMIN = "pro_abraham";
const DB_PATH = './personas.json';
const EVIDENCE_DIR = './evidencia';

// Crear carpeta de evidencias si no existe
if (!fs.existsSync(EVIDENCE_DIR)){
    fs.mkdirSync(EVIDENCE_DIR);
}

// Función para descargar imagen de perfil
async function descargarEvidencia(url, username) {
    try {
        const filepath = path.join(EVIDENCE_DIR, `${username}_perfil.jpg`);
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream'
        });
        
        return new Promise((resolve, reject) => {
            const writer = fs.createWriteStream(filepath);
            response.data.pipe(writer);
            writer.on('finish', () => resolve(filepath));
            writer.on('error', reject);
        });
    } catch (error) {
        console.log(chalk.red(`[ERROR] No se pudo descargar la evidencia visual de @${username}.`));
        return null;
    }
}

// Función principal de extracción de inteligencia
async function investigarObjetivo(usuario) {
    console.log(chalk.blue(`\n[SISTEMA] Iniciando rastreo de fuentes para el objetivo: @${usuario}...`));
    console.log(chalk.gray(`[LOG] Conectando con servidores y extrayendo metadatos...`));
    
    try {
        // Extracción mediante API pública de web_profile_info
        const url = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${usuario}`;
        
        const response = await axios.get(url, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
                'X-IG-App-ID': '936619743392459'
            }
        });

        const targetData = response.data.data.user;
        
        if (!targetData) {
            throw new Error("Perfil inaccesible.");
        }

        console.log(chalk.yellow(`[LOG] Metadatos confirmados. Descargando fotografía de alta resolución...`));
        const fotoPath = await descargarEvidencia(targetData.profile_pic_url_hd, usuario);

        const infoInvestigacion = {
            id_expediente: `INTEL-${Math.floor(Math.random() * 90000) + 10000}`,
            objetivo_username: targetData.username,
            nombre_completo: targetData.full_name,
            biografia: targetData.biography || "No especificado",
            metricas: {
                seguidores: targetData.edge_followed_by.count,
                seguidos: targetData.edge_follow.count
            },
            es_privado: targetData.is_private,
            foto_guardada_en: fotoPath || "Fallo en descarga",
            fecha_extraccion: new Date().toISOString(),
            agente_cargo: ADMIN
        };

        guardarEnBaseDatos(infoInvestigacion);
        mostrarReporte(infoInvestigacion);

    } catch (error) {
        // Sistema de contingencia si Instagram bloquea la solicitud por IP
        console.log(chalk.red(`\n[ALERTA] Servidor destino bloqueó la solicitud de extracción profunda.`));
        console.log(chalk.magenta(`[SISTEMA] Iniciando protocolo de simulación de expediente para resguardo del target...`));
        
        const simulacion = {
            id_expediente: `INTEL-SIM-${Math.floor(Math.random() * 90000) + 10000}`,
            objetivo_username: usuario,
            nombre_completo: `Sujeto Identificado (${usuario})`,
            biografia: "[INFORMACIÓN RESTRINGIDA]",
            metricas: { seguidores: "N/A", seguidos: "N/A" },
            es_privado: true,
            foto_guardada_en: "No disponible en simulación",
            fecha_extraccion: new Date().toISOString(),
            agente_cargo: ADMIN
        };
        guardarEnBaseDatos(simulacion);
        mostrarReporte(simulacion);
    }
    
    // Devolvemos el menú
    setTimeout(mostrarMenu, 2000);
}

function guardarEnBaseDatos(data) {
    let baseDatos = [];
    try {
        const contenido = fs.readFileSync(DB_PATH, 'utf-8');
        if(contenido) baseDatos = JSON.parse(contenido);
    } catch (e) {
        // Si el archivo no existe, arranca con el array vacío
    }
    
    baseDatos.push(data);
    fs.writeFileSync(DB_PATH, JSON.stringify(baseDatos, null, 4));
    console.log(chalk.green(`\n[EXITO] Expediente almacenado de forma segura por el Agente ${ADMIN}.`));
}

function mostrarReporte(data) {
    const tabla = new Table({
        head: [chalk.cyan('CAMPO DE INVESTIGACIÓN'), chalk.cyan('REGISTRO')],
        colWidths: [26, 55],
        wordWrap: true
    });

    tabla.push(
        ['ID DE CASO', chalk.bold(data.id_expediente)],
        ['OBJETIVO', `@${data.objetivo_username}`],
        ['NOMBRE REAL', data.nombre_completo],
        ['BIOGRAFÍA', data.biografia],
        ['SEGUIDORES', data.metricas.seguidores.toString()],
        ['PERFIL PRIVADO', data.es_privado ? chalk.red("SÍ") : chalk.green("NO")],
        ['UBICACIÓN EVIDENCIA', data.foto_guardada_en],
        ['AGENTE ASIGNADO', chalk.blue(data.agente_cargo)]
    );

    console.log(chalk.yellow("\n============== REPORTE DE EXTRACCIÓN =============="));
    console.log(tabla.toString());
    console.log(chalk.yellow("===================================================\n"));
}

function mostrarMenu() {
    const opcion = readline.question(chalk.white('Ingrese [1] para rastrear objetivo, [0] para salir del panel: '));
        
    if (opcion === '1') {
        const target = readline.question(chalk.magenta('Ingrese el nombre de usuario del objetivo (sin el @): '));
        if (target) {
            investigarObjetivo(target);
        } else {
            mostrarMenu();
        }
    } else if (opcion === '0') {
        console.log(chalk.gray('\n[SISTEMA] Cerrando sesión. Hasta pronto.\n'));
        process.exit(0);
    } else {
        console.log(chalk.red('[ERROR] Comando inválido.'));
        mostrarMenu();
    }
}

function iniciarSistema() {
    console.clear();
    console.log(chalk.cyan(`
    █████████████████████████████████████████████████████████
    █                                                       █
    █         CENTRO DE INTELIGENCIA Y MONITOREO            █
    █                                                       █
    █   ADMINISTRADOR PRINCIPAL: ${ADMIN}                 █
    █   ESTADO DEL SISTEMA: EN LINEA                        █
    █████████████████████████████████████████████████████████
    `));
    console.log(chalk.gray(`Derechos reservados a ${ADMIN} y a los colaboradores Eduardo YT VIP y Gerardl Craftman\n`));

    mostrarMenu();
}

iniciarSistema();

