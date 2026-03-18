import turso from "../config/db.js";

async function obtenerUsuarios() {
  try {
    // Ejecutar una consulta SQL
    const resultado = await turso.execute("SELECT * FROM usuario");
    
    return resultado.rows;

  } catch (error) {
    console.error("Error al conectar con Turso:", error);
  }
}

export default obtenerUsuarios;