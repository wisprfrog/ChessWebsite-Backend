import turso from '../config/db.js';

async function crearRegistroEstadistica(id_usuario) {
    try {
        const existeRegistro = await turso.execute(
            `SELECT 1 FROM estadistica WHERE id_usuario = '${id_usuario}' LIMIT 1`
        );

        if (existeRegistro.rows.length > 0) {
            console.log('Registro de estadistica ya existe para el usuario: ', id_usuario);
            return;
        }

        const resultado = await turso.execute(
            `INSERT INTO estadistica (id_usuario) VALUES ('${id_usuario}')`
        );
        console.log('Registro de estadistica creado para el usuario: ', id_usuario);
        console.log(resultado);
        return resultado;
    } catch (error) {
        throw new Error('Error al insertar estadistica: ' + error.message);
    }
}

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
            await crearRegistroEstadistica(id_usuario);

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
            await crearRegistroEstadistica(id_usuario);

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
            await crearRegistroEstadistica(id_usuario);

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