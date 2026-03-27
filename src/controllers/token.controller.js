import jwt from 'jsonwebtoken';

export const generarToken = async (req, res) => {
  const { id_usuario, nombre_usuario, correo, contrasenia } = req.body;

  if(!contrasenia || (!nombre_usuario && !correo)) return res.status(401).json({ message: 'Faltan datos requeridos' });

  try{    
    // Generar un token JWT
    const token = jwt.sign({
      id_usuario: id_usuario,
      nombre_usuario: nombre_usuario,
      correo: correo},
      process.env.JWT_SECRET,
      { expiresIn: '1day' }
    );
    
    // Retornar el token al cliente
    res.status(200).json({
      mensaje: 'Inicio de sesión exitoso',
      token: token,
      datos_usuario: {
        id_usuario: id_usuario,
        nombre_usuario: nombre_usuario,
        correo: correo
      }
    }
  );
  }
  catch(error){
    res.status(500).json({ message: 'Error interno del servidor', error });
  }
};