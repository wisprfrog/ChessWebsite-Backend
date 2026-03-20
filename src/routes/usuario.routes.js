import { Router } from 'express';
import { login } from '../controllers/auth.controller.js';
import verificarToken from '../middlewares/verificarToken.js';
import { getUsuario } from '../controllers/usuario.controller.js';

const usuarioRouter = Router();

// Ruta PUBLICA para hacer login
usuarioRouter.post('/login', login);

// Ruta PRIVADA para obtener información del usuario, protegida por el middleware de verificación de token
usuarioRouter.get('/perfil', verificarToken, getUsuario);

export default usuarioRouter;