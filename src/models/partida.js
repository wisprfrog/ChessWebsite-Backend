import turso from '../config/db.js';

const partidaModel = {
    selectPartida : async(id_partida) => {
        const resultado = await turso.execute(
            `SELECT * FROM partida WHERE id_partida = '${id_partida}'`
        );

        return resultado;
    },

    insertPartida : async(id_usuario_blancas, id_usuario_negras, 
                        movimientos, id_ganador, fecha, causa_fin_partida) => {
        try{
            const resultado = await turso.execute(
                `INSERT INTO partida ( id_usuario_blancas, id_usuario_negras, movimientos, id_ganador, fecha, causa_fin_partida) VALUES ('${id_usuario_blancas}', '${id_usuario_negras}', '${movimientos}', '${id_ganador}', '${fecha}', '${causa_fin_partida}')`
            );
            return resultado;
        }catch(error){
            throw new Error('Error al insertar partida: ' + error.message);
        }
    },

    selectPartidasPorUsuario : async(id_usuario) => {
        const resultado = await turso.execute(
            `SELECT * FROM partida WHERE id_usuario_blancas = '${id_usuario}' OR id_usuario_negras = '${id_usuario}'`
        );

        return resultado;
    },

    deletePartidasSQL : async(id_usuario) => {
        try{
            const resultado = await turso.execute(
                `DELETE FROM partida WHERE id_usuario_blancas = '${id_usuario}' OR id_usuario_negras = '${id_usuario}'`
            );
            return resultado;
        }catch(error){
            throw new Error('Error al eliminar partidas: ' + error.message);
        }
    }

};

export default partidaModel;