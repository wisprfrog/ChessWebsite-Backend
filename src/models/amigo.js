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

    sonAmigos : async(id_usuario1, id_usuario2) => {
      const resultado = await turso.execute(
        `SELECT 1 FROM amigo
         WHERE (id_usuario = '${id_usuario1}' AND id_amigo = '${id_usuario2}')
          OR (id_usuario = '${id_usuario2}' AND id_amigo = '${id_usuario1}')
         LIMIT 1`
      );

      return resultado.rows.length > 0;
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