import Router from 'express';
import { getPartida, postPartida, getPartidasUsuario } from '../controllers/partida.controller.js';
import verificarToken from '../middlewares/verificarToken.js';
import { deletePartidas } from '../controllers/partida.controller.js';

const partidaRouter = Router();

partidaRouter.get('/id_partida', getPartida);
partidaRouter.get('/id_usuario/partidas', getPartidasUsuario);
partidaRouter.post('/', postPartida);
partidaRouter.delete('/id_partida', verificarToken, deletePartidas);

export default partidaRouter;