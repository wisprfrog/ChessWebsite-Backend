import partidaModel from '../models/partida.js';

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