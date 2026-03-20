import usuarioModel from "../models/usuario.js";

const agregarInfoLogin = async (req, res, next) => {
  const { nombre_usuario, correo } = req.body;

  if(!nombre_usuario && !correo) {
    return res.status(400).json({ message: 'Se requiere nombre_usuario o correo para agregar información de login' });
  }

  try {
    if(nombre_usuario){
      const resultado = await usuarioModel.selectIdUsuario(nombre_usuario, null);
      req.body.id_usuario = resultado.rows[0].id_usuario;
    }
    else if(correo){
      const resultado = await usuarioModel.selectIdUsuario(null, correo);
      req.body.id_usuario = resultado.rows[0].id_usuario;
    }
    
    return next();
  }
  catch (error) {
    console.error('Error al agregar información de login:', error);
    return res.status(500).json({ message: 'Error al agregar información de login' });
  }
};

export default agregarInfoLogin;