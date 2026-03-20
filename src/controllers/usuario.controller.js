import byscrypt from 'bcrypt';
import selectUsuario from '../models/usuario.js';

export const getUsuario = async (req, res) => {
  const { nombre_usuario, correo, contrasenia } = req.body;
  
 try{
    const resultado = await selectUsuario(nombre_usuario, correo);
    res.status(200).json({ message: 'Informacion usuario', informacion: resultado.rows });
  }
  catch(error){
    res.status(500).json({ message: 'Error interno del servidor', error });
  }
}