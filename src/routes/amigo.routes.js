import Router from 'express';
import { getAmigos, postAmigo, deleteAmigo } from '../controllers/amigo.controller.js';
import verficarToken from '../middlewares/verificarToken.js';

const amigosRouter = Router();

amigosRouter.get('/id_usuario/amigo', getAmigos);
amigosRouter.post('/id_usuario/id_amigo', verficarToken, postAmigo); 
amigosRouter.delete('/id_usuario/id_amigo', verficarToken, deleteAmigo);

export default amigosRouter;