import { Router } from 'express';
import { generarToken } from '../controllers/token.controller.js';

import { getDatosUsuario, getNombreUsuarios, getIdUsuarios  } from '../controllers/usuario.controller.js';
import { getIdUsuario, getCorreoUsuario, postUsuario } from '../controllers/usuario.controller.js';
import { putNombreUsuario, putContraseniaUsuario } from '../controllers/usuario.controller.js';
import { deleteUsuario, aceptarLogin } from '../controllers/usuario.controller.js';

import verificarToken from '../middlewares/verificarToken.js';
import agregarInfoLogin from '../middlewares/agregarInfoLogin.js';

const usuarioRouter = Router();

// Ruta PRIVADA para obtener información del usuario, protegida por el middleware de verificación de token
usuarioRouter.get('/id_usuario/datos', verificarToken, getDatosUsuario);
usuarioRouter.get('/nombre_usuario', getNombreUsuarios);
usuarioRouter.get('/id_usuario/usuario', getIdUsuarios);
usuarioRouter.get('/id_usuario', getIdUsuario);
usuarioRouter.get('/id_usuario/correo', getCorreoUsuario);

// Ruta PUBLICA para hacer login
usuarioRouter.post('/login/token', agregarInfoLogin, generarToken); //genera token
usuarioRouter.post('/login', verificarToken, aceptarLogin); //verifica credenciales sin generar token
usuarioRouter.post('/', postUsuario);

// Ruta PRIVADA para cambiar información
usuarioRouter.put('/id_usuario/nombre_usuario', verificarToken, putNombreUsuario);
usuarioRouter.put('/id_usuario/contrasenia', verificarToken, putContraseniaUsuario);

// Ruta PRIVADA para eliminar usuario
usuarioRouter.delete('/id_usuario', verificarToken, deleteUsuario);

export default usuarioRouter;