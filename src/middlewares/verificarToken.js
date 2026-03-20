import jwt from 'jsonwebtoken';

const verficarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if(!token) return res.status(401).json({ message: 'Acceso denegado, token no proporcionado' });

  try{
    // Verificar que el token es válido
    const decodificar = jwt.verify(token, process.env.JWT_SECRET);

    // Guardamos la información del usuario en la solicitud para usarla en el controlador
    req.usuario = decodificar;

    // Continuamos con la siguiente función middleware o controlador
    next();
  }
  catch(error){
    res.status(401).json({ message: 'Token no válido o expirado', error });
  }
};

export default verficarToken;