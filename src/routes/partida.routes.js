import Router from 'express';
import { getPartida, postPartida, getPartidasUsuario } from '../controllers/partida.controller.js';

const partidaRouter = Router();

partidaRouter.get('/id_partida', getPartida);
partidaRouter.get('/id_usuario/partidas', getPartidasUsuario);
partidaRouter.post('/', postPartida);

export default partidaRouter;