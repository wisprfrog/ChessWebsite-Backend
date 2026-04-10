import jwt, { decode } from 'jsonwebtoken';

const verficarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if(!token) return res.status(401).json({ message: 'Acceso denegado, token no proporcionado' });

  try{
    // Verificar que el token es válido
    if(jwt.verify(token, process.env.JWT_SECRET)){
      const decoded = jwt.decode(token);
      req.body.id_usuario = decoded.id_usuario;
      req.body.nombre_usuario = decoded.nombre_usuario;
      req.body.correo = decoded.correo;

      next();
    }
    else throw new Error('Token no válido');
  }
  catch(error){
    res.status(401).json({ message: 'Token no válido o expirado', error });
  }
};

export default verficarToken;