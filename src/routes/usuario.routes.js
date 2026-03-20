import { Router } from 'express';
import { login } from '../controllers/auth.controller.js';
import verificarToken from '../middlewares/verificarToken.js';
import { getDatosUsuario, getNombreUsuarios, getIdUsuarios  } from '../controllers/usuario.controller.js';
import { getIdUsuario, getCorreoUsuario, postUsuario } from '../controllers/usuario.controller.js';
import { putNombreUsuario, putContraseniaUsuario } from '../controllers/usuario.controller.js';
import { deleteUsuario } from '../controllers/usuario.controller.js';

const usuarioRouter = Router();

// Ruta PRIVADA para obtener información del usuario, protegida por el middleware de verificación de token
usuarioRouter.get('/id_usuario/datos', verificarToken, getDatosUsuario);
usuarioRouter.get('/nombre_usuario', getNombreUsuarios);
usuarioRouter.get('/id_usuario/usuario', getIdUsuarios);
usuarioRouter.get('/id_usuario', getIdUsuario);
usuarioRouter.get('/id_usuario/correo', getCorreoUsuario);

// Ruta PUBLICA para hacer login
usuarioRouter.post('/login', login);
usuarioRouter.post('/', postUsuario);

// Ruta PRIVADA para cambiar información
usuarioRouter.put('/id_usuario/nombre_usuario', verificarToken, putNombreUsuario);
usuarioRouter.put('/id_usuario/contrasenia', verificarToken, putContraseniaUsuario);

// Ruta PRIVADA para eliminar usuario
usuarioRouter.delete('/id_usuario', verificarToken, deleteUsuario);

export default usuarioRouter;