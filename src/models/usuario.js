import turso from '../config/db.js';

const usuarioModel = {
  selectInfoUsuario : async (nombre_usuario, correo) => {
    let resultado = null;
    if(nombre_usuario){
      resultado = await turso.execute(
        `SELECT * FROM usuario WHERE nombre_usuario = '${nombre_usuario}'`
      );
    }
    else if(correo){
      resultado = await turso.execute(
        `SELECT * FROM usuario WHERE correo = '${correo}'`
      );
    }

    return resultado;
  },

  selectIdUsuario : async (id_usuario) => {
    let resultado = await turso.execute(
      `SELECT id_usuario FROM usuario WHERE id_usuario = ${id_usuario}`
    );
    return resultado;
  }
};

export default usuarioModel;