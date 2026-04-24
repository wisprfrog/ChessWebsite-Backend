import { Router } from 'express';
import {  getSolicitudesEnviadas,
          getSolicitudesRecibidas,
          postSolicitudAmistad,
          deleteSolicitudAmistad
        } from '../controllers/solicitud_amistad.controller.js';

const solicitudAmistadRouter = Router();

solicitudAmistadRouter.get('/nombre_usuario', getSolicitudesEnviadas);
solicitudAmistadRouter.get('/nombre_usuario', getSolicitudesRecibidas);

solicitudAmistadRouter.post('/nombre_usuario', postSolicitudAmistad);

solicitudAmistadRouter.delete('/nombre_usuario', deleteSolicitudAmistad);

export default solicitudAmistadRouter;
