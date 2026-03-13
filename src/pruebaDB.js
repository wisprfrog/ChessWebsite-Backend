import { db } from './config/db.js';

async function ejecutarPrueba() {
  try {
    console.log(" Conectando a Turso...");

    // 1. Crear la tabla (Si ya existe, Turso simplemente ignora este paso)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      );
    `);
    console.log(" Tabla 'usuarios' creada o verificada correctamente.");

    // 2. Insertar un usuario manualmente
    // Usamos un bloque try/catch pequeñito aquí por si corres el script dos veces 
    // y el usuario ya existe (por la regla UNIQUE que le pusimos).
    try {
      await db.execute(
        "INSERT INTO usuarios (username, password) VALUES (?, ?)", 
        ["jugador_maestro", "password123"]
      );
      console.log(" Usuario 'jugador_maestro' registrado con éxito.");
    } catch (insertError) {
      console.log("El usuario de prueba ya existía. Saltando inserción.");
    }

    // 3. Hacer una consulta (SELECT) para ver qué hay adentro
    const resultado = await db.execute("SELECT * FROM usuarios");
    
    console.log("\n Datos actuales en tu base de datos Turso:");
    // console.table es una joya de Node.js que te dibuja una tablita en la terminal
    console.table(resultado.rows); 

  } catch (error) {
    console.error("❌ Ocurrió un error general:", error.message);
  }
}

// Ejecutamos la función
ejecutarPrueba();