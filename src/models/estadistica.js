import turso from '../config/db.js';

const estadisticaModel = {
    selectEstadisticaPorUsuario : async(id_usuario) => {
        const resultado = await turso.execute(
            `SELECT * FROM estadistica WHERE id_usuario = '${id_usuario}'`
        );

        return resultado;
    },

    insertEstadistica : async(id_usuario) => {
        try{
            const resultado = await turso.execute(
                `INSERT INTO estadistica (id_usuario) VALUES ('${id_usuario}')`
            );
            return resultado;
        }catch(error){
            throw new Error('Error al insertar partida: ' + error.message);  
        }
    },

    updateEstadisticaGanadas : async(id_usuario) => {
        try{
            const resultado = await turso.execute(
                `UPDATE estadistica SET ganadas = ganadas + 1, partidas_jug = partidas_jug + 1 WHERE id_usuario = '${id_usuario}'`
            );
            return resultado;
        }catch(error){
            throw new Error('Error al actualizar estadistica: ' + error.message);  
        }
    },

    updateEstadisticaPerdidas : async(id_usuario) => {
        try{
            const resultado = await turso.execute(
                `UPDATE estadistica SET perdidas = perdidas + 1, partidas_jug = partidas_jug + 1 WHERE id_usuario = '${id_usuario}'`
            );
            return resultado;
        }catch(error){
            throw new Error('Error al actualizar estadistica: ' + error.message);  
        }
    }, 

    updateEstadisticaTablas : async(id_usuario) => {
        try{
            const resultado = await turso.execute(
                `UPDATE estadistica SET tablas = tablas + 1, partidas_jug = partidas_jug + 1 WHERE id_usuario = '${id_usuario}'`
            );
            return resultado;
        }catch(error){
            throw new Error('Error al actualizar estadistica: ' + error.message);  
        }
    },

    deleteEstadisticaSQL : async(id_usuario) => {
        try{
            const resultado = await turso.execute(
                `DELETE FROM estadistica WHERE id_usuario = '${id_usuario}'`
            );
            return resultado;
        }catch(error){
            throw new Error('Error al eliminar estadistica: ' + error.message);  
        }
    }
};

export default estadisticaModel;