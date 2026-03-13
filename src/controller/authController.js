import { db } from '../config/db.js';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET;

// 1. Agregamos "export const" para que el archivo de rutas lo pueda jalar
export const registrarUsuario = async (req, res) => {
  const { username, password } = req.body;
  try {
    const usuarioExistente = await db.execute("SELECT * FROM usuarios WHERE username = ?", [username]);
    if (usuarioExistente.rows.length > 0) {
      return res.status(400).json({ message: "Ese nombre de usuario ya está en uso" });
    }
    await db.execute("INSERT INTO usuarios (username, password) VALUES (?, ?)", [username, password]);
    res.status(200).json({ message: "Usuario creado con éxito" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error interno" });
  }
};

// 2. Agregamos "export const" aquí también
export const iniciarSesion = async (req, res) => {
  const { username, password } = req.body;
  try {
    const resultado = await db.execute("SELECT * FROM usuarios WHERE username = ? AND password = ?", [username, password]);
    const usuarioValido = resultado.rows[0];
    if (usuarioValido) {
      const token = jwt.sign({ id: usuarioValido.id, username: usuarioValido.username }, SECRET_KEY, { expiresIn: '24h' });
      res.status(200).json({ token, username: usuarioValido.username });
    } else {
      res.status(401).json({ message: "Usuario o contraseña incorrectos" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error interno" });
  }
};

// IMPORTANTE: Asegúrate de borrar cualquier "module.exports = {}" que haya quedado hasta abajo.