import turso from '../config/db.js';

const solicitud_amistadModel = {
  selectSolicitudesEnviadas: async (id_usuario) => {
    try{
      const resultado = await turso.execute(
        `SELECT nombre_usuario FROM usuario WHERE id_usuario IN (
          SELECT id_usuario_destino FROM solicitud_amistad WHERE id_usuario_origen = '${id_usuario}'
        )`
      );
      
      return resultado;
    }
    catch(error){
      return new Error('Error al obtener las solicitudes de amistad enviadas: ' + error.message);
    }
  },

  selectSolicitudesRecibidas: async (id_usuario) => {
    try{
      const resultado = await turso.execute(
        `SELECT nombre_usuario FROM usuario WHERE id_usuario IN (
          SELECT id_usuario_origen FROM solicitud_amistad WHERE id_usuario_destino = '${id_usuario}'
        )`
      );
      
      return resultado;
    }
    catch(error){
      return new Error('Error al obtener las solicitudes de amistad recibidas: ' + error.message);
    }
  },

  insertSolicitudAmistad: async (id_usuario_origen, id_usuario_destino) => {
    try{
      const resultado = await turso.execute(
        `INSERT INTO solicitud_amistad (id_usuario_origen, id_usuario_destino) VALUES ('${id_usuario_origen}', '${id_usuario_destino}')`
      );
      return resultado;
    }
    catch(error){
      return new Error('Error al insertar solicitud de amistad: ' + error.message);
    }
  },

  deleteSolicitudAmistad: async (id_usuario_origen, id_usuario_destino) => {
    try{
      const resultado = await turso.execute(
        `DELETE FROM solicitud_amistad WHERE id_usuario_origen = '${id_usuario_origen}' AND id_usuario_destino = '${id_usuario_destino}'`
      );
      return resultado;
    }
    catch(error){
      return new Error('Error al eliminar solicitud de amistad: ' + error.message);
    }
  }
}

export default solicitud_amistadModel;