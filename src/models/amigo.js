import turso from '../config/db.js';

const amigosModel = {
  
  selectAmigos : async(id_usuario) => {
    const resultado = await turso.execute(
      `SELECT id_amigo, nombre_usuario as nombre_amigo FROM amigo JOIN usuario ON amigo.id_amigo = usuario.id_usuario WHERE amigo.id_usuario = '${id_usuario}'`
    );

    return resultado;
  },

  insertAmigo : async(id_usuario, id_amigo) => {
      try{
          const resultado = await turso.execute(
              `INSERT INTO amigo (id_usuario, id_amigo) VALUES ('${id_usuario}', '${id_amigo}')`
          );
          return resultado;
      }catch(error){
        return new Error('Error al insertar amigo: ' + error.message);
      }
  },

  deleteAmigo : async(id_usuario, id_amigo) => {
      try{
          const resultado = await turso.execute(
              `DELETE FROM amigo WHERE (id_usuario = '${id_usuario}' AND id_amigo = '${id_amigo}') 
               OR (id_usuario = '${id_amigo}' AND id_amigo = '${id_usuario}')`
          );

          return resultado;
      }catch(error){
          return new Error('Error al eliminar amigo: ' + error.message);
      } 
  }
};

export default amigosModel;