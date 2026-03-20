import byscrypt from 'bcrypt';
import usuarioModel from '../models/usuario.js';

export const getDatosUsuario = async (req, res) => {
  const { nombre_usuario, correo } = req.body;
  
 try{
    const resultado = await usuarioModel.selectDatosUsuario(nombre_usuario, correo);
    res.status(200).json({ message: 'Informacion usuario', informacion: resultado.rows });
  }
  catch(error){
    res.status(500).json({ message: 'Error interno del servidor', error });
  }
}

export const getNombreUsuarios = async (req, res) => {
  try{
    const resultado = await usuarioModel.selectNombreUsuarios();
    res.status(200).json({ message: 'Nombres de usuarios', nombres: resultado.rows });
  }
  catch(error){
    res.status(500).json({ message: 'Error interno del servidor', error });
  }
}

export const getIdUsuarios = async (req, res) => {
  try{
    const resultado = await usuarioModel.selectIdUsuarios();
    res.status(200).json({ message: 'IDs de usuarios', ids: resultado.rows });
  }
  catch(error){
    res.status(500).json({ message: 'Error interno del servidor', error });
  }
}

export const getIdUsuario = async (req, res) => {
  const {nombre_usuario, correo} = req.body;

  if(!nombre_usuario && !correo) return res.status(400).json({ message: 'Faltan datos requeridos' });

  try{
    const resultado = await usuarioModel.selectIdUsuario(nombre_usuario, correo);
    res.status(200).json({ message: 'Id del usuario:', nombres: resultado.rows });
  }
  catch(error){
    res.status(500).json({ message: 'Error interno del servidor', error });
  }
}

export const getCorreoUsuario = async (req, res) => {
  const {nombre_usuario, id_usuario} = req.body;

  if(!nombre_usuario && !id_usuario) return res.status(400).json({ message: 'Faltan datos requeridos' });

  try{
    const resultado = await usuarioModel.selectCorreoUsuario(nombre_usuario, id_usuario);
    res.status(200).json({ message: 'Correo del usuario:', nombres: resultado.rows });
  }
  catch(error){
    res.status(500).json({ message: 'Error interno del servidor', error });
  }
}

export const postUsuario = async (req, res) => {
  const { nombre_usuario, correo, contrasenia } = req.body;

  if(!nombre_usuario || !correo || !contrasenia) return res.status(400).json({ message: 'Faltan datos requeridos' });

  try {
    const contraseniaEncriptada = await byscrypt.hash(contrasenia, 10);

    const resultado = await usuarioModel.insertUsuario(nombre_usuario, correo, contraseniaEncriptada);
    res.status(201).json({ message: 'Usuario registrado', informacion: resultado.rows });
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor', error });
  }
}

export const putNombreUsuario = async (req, res) => {
  const { nombre_usuario, correo, nuevo_nombre_usuario } = req.body;

  if(!nombre_usuario || !correo || !nuevo_nombre_usuario) return res.status(400).json({ message: 'Faltan datos requeridos' });

  const resultadoCorreo = await usuarioModel.selectCorreoUsuario(nombre_usuario);

  if(correo !== resultadoCorreo.rows[0].correo){
    return res.status(403).json({ message: 'No autorizado para cambiar el nombre de usuario' });
  }

  try {
    const resultado = await usuarioModel.updateNombreUsuario(nombre_usuario, nuevo_nombre_usuario);
    res.status(200).json({ message: 'Nombre de usuario actualizado', informacion: resultado.rows });
  }
  catch(error){
    res.status(500).json({ message: 'Error interno del servidor', error });
  }
}

export const putContraseniaUsuario = async (req, res) => {
  const { correo, contrasenia, nueva_contrasenia } = req.body;

  if( !correo || !contrasenia || !nueva_contrasenia) return res.status(400).json({ message: 'Faltan datos requeridos' });

  const resultadoCorreo = await usuarioModel.selectCorreoUsuario(null, null, correo);
  const resultadoContrasenia = await usuarioModel.selectContraseniaUsuario(null, null, correo);

  if(!resultadoCorreo.rows[0] || !resultadoContrasenia.rows[0]){
    return res.status(404).json({ message: 'Usuario no encontrado' });
  }

  const isPasswordValid = await byscrypt.compare(contrasenia, resultadoContrasenia.rows[0].contrasenia);
  if(correo !== resultadoCorreo.rows[0].correo || !isPasswordValid){
    return res.status(403).json({ message: 'No autorizado para cambiar la contraseña' });
  }

  try {
    const contraseniaEncriptada = await byscrypt.hash(nueva_contrasenia, 10);
    const resultado = await usuarioModel.updateContraseniaUsuario(correo, contraseniaEncriptada);

    res.status(200).json({ message: 'Contraseña actualizada', informacion: resultado.rows });
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor', error });
  }
}

export const deleteUsuario = async (req, res) => {
  const { id_usuario, nombre_usuario, correo, contrasenia } = req.body;

  if((!id_usuario && !nombre_usuario && !correo) || !contrasenia){
    return res.status(400).json({ message: 'Faltan datos requeridos' });
  }

  try {
    let resultadoCorreo;
    let resultadoContrasenia;
    if(id_usuario){
      resultadoCorreo = await usuarioModel.selectCorreoUsuario(null, id_usuario, null);
      resultadoContrasenia = await usuarioModel.selectContraseniaUsuario(null, id_usuario, null);
    }
    else if(nombre_usuario){
      resultadoCorreo = await usuarioModel.selectCorreoUsuario(nombre_usuario, null, null);
      resultadoContrasenia = await usuarioModel.selectContraseniaUsuario(nombre_usuario, null, null);
    }
    else if (correo){
      resultadoCorreo = await usuarioModel.selectCorreoUsuario(null, null, correo);
      resultadoContrasenia = await usuarioModel.selectContraseniaUsuario(null, null, correo);
    }

    const isPasswordValid = await byscrypt.compare(contrasenia, resultadoContrasenia.rows[0].contrasenia);
    if(!resultadoCorreo || !resultadoContrasenia || !isPasswordValid){
      return res.status(401).json({ message: 'No autorizado para eliminar el usuario' });
    }
    
    const resultado = await usuarioModel.deleteUsuarioSQL(id_usuario, nombre_usuario, correo);
    res.status(200).json({ message: 'Usuario eliminado', informacion: resultado.rows });
  }
  catch(error){
    res.status(500).json({ message: 'Error interno del servidor', error });
  }
}