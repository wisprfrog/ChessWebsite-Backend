import express from 'express';
// Asegúrate de que las funciones estén bien importadas con llaves
import { registrarUsuario, iniciarSesion } from '../controller/authController.js';

const router = express.Router();

router.post('/registro', registrarUsuario);
router.post('/login', iniciarSesion);

// ¡ESTA ES LA LÍNEA QUE TE FALTA!
// Exporta el router por defecto para que app.js lo pueda recibir
export default router;