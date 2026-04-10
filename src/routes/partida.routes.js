import Router from 'express';
import { getPartida, postPartida, getPartidasUsuario } from '../controllers/partida.controller.js';
import verificarToken from '../middlewares/verificarToken.js';
import { deletePartidas } from '../controllers/partida.controller.js';

const partidaRouter = Router();

partidaRouter.post('/id_partida', verificarToken, getPartida);
partidaRouter.post('/id_usuario/partidas', verificarToken, getPartidasUsuario);
partidaRouter.post('/', postPartida);
partidaRouter.delete('/id_partida', verificarToken, deletePartidas);

export default partidaRouter;