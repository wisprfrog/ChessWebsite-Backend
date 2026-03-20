import turso from '../config/db.js';

const amigosModel = {
  selectAmigos : async(id_usuario) => {
    const resultado = await turso.execute(
      `SELECT id_amigo FROM amigo WHERE id_usuario = '${id_usuario}'`
    );

    return resultado;
  },

  insertAmigo : async(id_usuario, id_amigo) => {
      try{
        console.log("entra mi bro")
          const resultado = await turso.execute(
              `INSERT INTO amigo (id_usuario, id_amigo) VALUES ('${id_usuario}', '${id_amigo}')`
          );
          return resultado;
      }catch(error){
        throw new Error('Error al insertar amigo: ' + error.message);
      }
  },

  deleteAmigo : async(id_usuario, id_amigo) => {
      try{
          const resultado = await turso.execute(
              `DELETE FROM amigo WHERE id_usuario = '${id_usuario}' AND id_amigo = '${id_amigo}'`
          );

          return resultado;
      }catch(error){
          throw new Error('Error al eliminar amigo: ' + error.message);
      } 
  }
};

export default amigosModel;