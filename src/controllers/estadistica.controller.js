import estadisticaModel from "../models/estadistica.js";
import usuarioModel from "../models/usuario.js";
import jwt from 'jsonwebtoken';

export const getEstadistica = async (req, res) => {
    const { id_usuario } = req.body;

    if (!id_usuario) return res.status(400).json({ message: 'Faltan datos requeridos' });

    const resultado = await estadisticaModel.selectEstadisticaPorUsuario(id_usuario);
    
    res.status(200).json({
        message: 'Estadistica encontrada',
        estadistica: resultado.rows
    });
}

export const postEstadistica = async (req, res) => {
    const { id_usuario } = req.body;

    if (!id_usuario) return res.status(400).json({ message: 'Faltan datos requeridos' });

    const usuario = await usuarioModel.selectIdUsuario(id_usuario);

    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });
    
    try {
        const resultado = await estadisticaModel.insertEstadistica(id_usuario);
        return res.status(200).json({ message: 'Estadistica creada exitosamente', resultado: resultado });
    } catch (error) {
        return res.status(500).json({ message: 'Error al crear estadistica' });
    }
}

export const putEstadisticaGanadas = async (req, res) => {
    const { id_usuario } = req.body;

    if (!id_usuario) return res.status(400).json({ message: 'Faltan datos requeridos' });
    
    try {
        const resultado = await estadisticaModel.updateEstadisticaGanadas(id_usuario);
        return res.status(200).json({ message: 'Estadistica actualizada exitosamente', resultado: resultado });
    } catch (error) {
        return res.status(500).json({ message: 'Error al actualizar estadistica' });
    }
}

export const putEstadisticaPerdidas = async (req, res) => {
    const { id_usuario } = req.body;

    if (!id_usuario) return res.status(400).json({ message: 'Faltan datos requeridos' });
    
    try {
        const resultado = await estadisticaModel.updateEstadisticaPerdidas(id_usuario);
        return res.status(200).json({ message: 'Estadistica actualizada exitosamente', resultado: resultado });
    } catch (error) {
        return res.status(500).json({ message: 'Error al actualizar estadistica' });
    }
}

export const putEstadisticaTablas = async (req, res) => {
    const { id_usuario } = req.body;

    if (!id_usuario) return res.status(400).json({ message: 'Faltan datos requeridos' });
    
    try {
        const resultado = await estadisticaModel.updateEstadisticaTablas(id_usuario);
        return res.status(200).json({ message: 'Estadistica actualizada exitosamente', resultado: resultado });
    } catch (error) {
        return res.status(500).json({ message: 'Error al actualizar estadistica' });
    }
}

export const deleteEstadistica = async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const decodedToken = jwt.decode(token);
    const id_usuario_token = decodedToken.id_usuario;

    const { id_usuario } = req.body;

    if (!id_usuario){
        return res.status(400).json({ message: 'Faltan datos requeridos' });
    }

    if(id_usuario !== id_usuario_token){
        return res.status(403).json({ message: 'No tienes permiso para eliminar esta estadistica' });
    }

    try {
        const resultado = await estadisticaModel.deleteEstadisticaSQL(id_usuario);
        return res.status(200).json({ message: 'Estadistica eliminada exitosamente', resultado: resultado });
    } catch (error) {
        return res.status(500).json({ message: 'Error al eliminar estadistica' });
    }
}



