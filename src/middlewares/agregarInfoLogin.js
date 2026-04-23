import usuarioModel from "../models/usuario.js";

const agregarInfoLogin = async (req, res, next) => {
  const { nombre_usuario, correo } = req.body;

  if(!nombre_usuario && !correo) {
    return res.status(400).json({ message: 'Se requiere nombre_usuario o correo para agregar información de login' });
  }

  try {
    if(nombre_usuario){
      const id_resultado = await usuarioModel.selectIdUsuario(nombre_usuario, null);
      if (!id_resultado?.rows?.length) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      req.body.id_usuario = id_resultado.rows[0].id_usuario;

      const correo_resultado = await usuarioModel.selectCorreoUsuario(null, id_resultado.rows[0].id_usuario, null);
      req.body.correo = correo_resultado.rows[0].correo;
    }
    else if(correo){
      const id_resultado = await usuarioModel.selectIdUsuario(null, correo);
      if (!id_resultado?.rows?.length) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      req.body.id_usuario = id_resultado.rows[0].id_usuario;

      const nombre_resultado = await usuarioModel.selectNombreUsuario(id_resultado.rows[0].id_usuario, null);
      req.body.nombre_usuario = nombre_resultado.rows[0].nombre_usuario;
    }
    
    return next();
  }
  catch (error) {
    console.error('Error al agregar información de login:', error);
    return res.status(500).json({ message: 'Error al agregar información de login' });
  }
};

export default agregarInfoLogin;