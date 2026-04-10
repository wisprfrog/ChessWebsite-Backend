import Router from 'express';
import { getEstadistica, postEstadistica, putEstadisticaGanadas, putEstadisticaPerdidas, putEstadisticaTablas, deleteEstadistica } from '../controllers/estadistica.controller.js';
import verificarToken from '../middlewares/verificarToken.js';

const estadisticaRouter = Router();

estadisticaRouter.post('/id_usuario', verificarToken, getEstadistica);
estadisticaRouter.post('/', postEstadistica);
estadisticaRouter.put('/id_usuario/ganadas', putEstadisticaGanadas);
estadisticaRouter.put('/id_usuario/perdidas', putEstadisticaPerdidas);
estadisticaRouter.put('/id_usuario/tablas', putEstadisticaTablas);
estadisticaRouter.delete('/id_usuario', verificarToken, deleteEstadistica);

export default estadisticaRouter;