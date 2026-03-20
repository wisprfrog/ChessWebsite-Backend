import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import usuarioModel from '../models/usuario.js';

export const login = async (req, res) => {
  const { nombre_usuario, correo, contrasenia } = req.body;

  if(!contrasenia || (!nombre_usuario && !correo)) return res.status(401).json({ message: 'Faltan datos requeridos' });

  try{
    // Verificar si el usuario existe en la base de datos
    const resultado = await usuarioModel.selectDatosUsuario(nombre_usuario, correo);
    
    const usuario = resultado.rows[0];
    
    if (!usuario) return res.status(401).json({ message: 'Usuario no encontrado' });
    
    // Verificar la contraseña
    const isPasswordValid = await bcrypt.compare(contrasenia, usuario.contrasenia);
    if (!isPasswordValid) return res.status(401).json({ message: 'Credenciales invalidas' });
    
    // Generar un token JWT
    const token = jwt.sign({
      id_usuario: usuario.id_usuario,
      nombre_usuario: usuario.nombre_usuario,
      correo: usuario.correo},
      process.env.JWT_SECRET,
      { expiresIn: '31d' }
    );
    
    // Retornar el token al cliente
    res.status(200).json({
      mensaje: 'Inicio de sesión exitoso',
      token: token,
      datos_usuario: {
        id_usuario: usuario.id_usuario,
        nombre_usuario: usuario.nombre_usuario,
        correo: usuario.correo
      }
    }
  );
  }
  catch(error){
    res.status(500).json({ message: 'Error interno del servidor', error });
  }
};