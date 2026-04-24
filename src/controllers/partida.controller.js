import partidaModel from '../models/partida.js';
import jwt from 'jsonwebtoken';
import turso from '../config/db.js';

export const getPartida = async (req, res) => {
    const { id_partida } = req.body;

    if (!id_partida) return res.status(400).json({ message: 'Faltan datos requeridos' });

    const resultado = await partidaModel.selectPartida(id_partida);

    res.status(200).json({
        message: 'Partida encontrada',
        partida: resultado.rows
    });
}

export const postPartida = async(req, res) => {
    const { id_usuario_blancas, id_usuario_negras, movimientos, id_ganador, fecha, causa_fin_partida } = req.body;

    if (!id_usuario_blancas || !id_usuario_negras || !movimientos || !fecha || !causa_fin_partida) return res.status(400).json({ message: 'Faltan datos requeridos' });

    try{
        const resultado = await partidaModel.insertPartida(id_usuario_blancas, id_usuario_negras, movimientos, id_ganador, fecha, causa_fin_partida);
        return res.status(200).json({ message: 'Partida registrada exitosamente', resultado: resultado});
    }catch(error){
        return res.status(400).json({ message: 'Error al registrar partida' });
    }
}

export const getPartidasUsuario = async (req, res) => {
    const { id_usuario } = req.body;

    if (!id_usuario) return res.status(400).json({ message: 'Faltan datos requeridos' });

    const resultado = await partidaModel.selectPartidasPorUsuario(id_usuario);

    res.status(200).json({
        message: 'Partidas encontradas',
        partidas: resultado.rows
    });
}

export const deletePartidas = async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const decodedToken = jwt.decode(token);
    const id_usuario_token = decodedToken.id_usuario;

    const { id_usuario } = req.body;

    if (!id_usuario){
        return res.status(400).json({ message: 'Faltan datos requeridos' });
    }

    if(id_usuario !== id_usuario_token){
        return res.status(403).json({ message: 'No tienes permiso para eliminar estas partidas' });
    }

    try{
        const resultado = await partidaModel.deletePartidasSQL(id_usuario);
        return res.status(200).json({ message: 'Partidas eliminadas exitosamente', resultado: resultado });
    }
    catch(error){
        return res.status(500).json({ message: 'Error al eliminar partidas' });
    }
}

export const getRepeticionPartida = async (req, res) => {
    const { id_partida } = req.body;
    
    try {
        const movimientos = await partidaModel.obtenerMovimientosPorId(id_partida);
        return res.status(200).json({ message: 'Movimientos encontrados', movimientos });
    } catch (error) {
        return res.status(404).json({ message: 'Partida no encontrada' });
    }
};

export const getHistorialPorNombre = async (req, res) => {
  const { nombre_usuario } = req.body;
  if (!nombre_usuario) return res.status(400).json({ message: 'Falta el nombre de usuario' });

  try {
    // Aquí está la magia: Cruzamos la tabla de partidas con la de usuarios 3 veces
    // (una para las blancas, una para las negras, y un LEFT JOIN para el ganador)
    const query = `
      SELECT 
        p.id_partida, 
        p.fecha, 
        ub.nombre_usuario AS blancas, 
        un.nombre_usuario AS negras, 
        ug.nombre_usuario AS ganador
      FROM partida p
      JOIN usuario ub ON p.id_usuario_blancas = ub.id_usuario
      JOIN usuario un ON p.id_usuario_negras = un.id_usuario
      LEFT JOIN usuario ug ON p.id_ganador = ug.id_usuario
      WHERE ub.nombre_usuario = '${nombre_usuario}' OR un.nombre_usuario = '${nombre_usuario}'
    `;

    const resultado = await turso.execute(query);
    res.status(200).json({ partidas: resultado.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error interno del servidor', error });
  }
}