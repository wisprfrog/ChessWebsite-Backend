import { db } from '../config/db.js';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET;

export const registrarUsuario = async (req, res) => {
  // 1. Ahora también extraemos el correo del paquete que envía React
  const { nombre_usuario, correo, contrasenia } = req.body; 

  try {
    // 2. Revisamos si el usuario O el correo ya existen
    const usuarioExistente = await db.execute(
      "SELECT * FROM usuario WHERE nombre_usuario = ? OR correo = ?", 
      [nombre_usuario, correo]
    );

    if (usuarioExistente.rows.length > 0) {
      return res.status(400).json({ message: "El nombre de usuario o el correo ya están en uso" });
    }

    // 3. Insertamos los 3 datos en Turso
    await db.execute(
      "INSERT INTO usuario (nombre_usuario, correo, contrasenia) VALUES (?, ?, ?)", 
      [nombre_usuario, correo, contrasenia]
    );

    res.status(200).json({ message: "Usuario creado con éxito" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// 2. Agregamos "export const" aquí también
export const iniciarSesion = async (req, res) => {
  const { nombre_usuario, contrasenia } = req.body;
  try {
    const resultado = await db.execute("SELECT * FROM usuario WHERE nombre_usuario = ? AND contrasenia = ?", [nombre_usuario, contrasenia]);
    const usuarioValido = resultado.rows[0];
    if (usuarioValido) {
      const token = jwt.sign({ id: usuarioValido.id, nombre_usuario: usuarioValido.nombre_usuario }, SECRET_KEY, { expiresIn: '24h' });
      res.status(200).json({ token, nombre_usuario: usuarioValido.nombre_usuario });
    } else {
      res.status(401).json({ message: "Usuario o contraseña incorrectos" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error interno" });
  }
};

// IMPORTANTE: Asegúrate de borrar cualquier "module.exports = {}" que haya quedado hasta abajo.