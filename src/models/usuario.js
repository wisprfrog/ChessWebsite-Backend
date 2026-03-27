import turso from '../config/db.js';

const usuarioModel = {
  selectDatosUsuario : async (nombre_usuario, correo) => {
    if(nombre_usuario){
      const resultado = await turso.execute(
        `SELECT * FROM usuario WHERE nombre_usuario = '${nombre_usuario}'`
      );

      return resultado;
    }
    else if(correo){
      const resultado = await turso.execute(
        `SELECT * FROM usuario WHERE correo = '${correo}'`
      );

      return resultado;
    }
  },

  selectNombreUsuarios : async () => {
    const resultado = await turso.execute(
      `SELECT nombre_usuario FROM usuario`
    );

    return resultado;
  },

  selectNombreUsuario : async (id_usuario, correo) => {
    const resultado = await turso.execute(
      `SELECT nombre_usuario FROM usuario WHERE id_usuario = '${id_usuario}' OR correo = '${correo}'`
    );

    return resultado;
  },

  selectIdUsuarios : async () => {
    const resultado = await turso.execute(
      `SELECT id_usuario FROM usuario`
    );

    return resultado;
  },

  selectIdUsuario : async (nombre_usuario, correo) => {
    if(nombre_usuario){
      const resultado = await turso.execute(
        `SELECT id_usuario FROM usuario WHERE nombre_usuario = '${nombre_usuario}'`
      );
    
      return resultado;
    }
    else if(correo){
      const resultado = await turso.execute(
        `SELECT id_usuario FROM usuario WHERE correo = '${correo}'`
      );
      
      return resultado;
    }
    
  },

  selectCorreoUsuario : async (nombre_usuario, id_usuario, correo) => {
    if(nombre_usuario){
      const resultado = await turso.execute(
        `SELECT correo FROM usuario WHERE nombre_usuario = '${nombre_usuario}'`
      )

      return resultado;
    }
    else if(id_usuario){
      const resultado = await turso.execute(
        `SELECT correo FROM usuario WHERE id_usuario = '${id_usuario}'`
      )

      return resultado;
    }
    else if(correo){
      const resultado = await turso.execute(
        `SELECT correo FROM usuario WHERE correo = '${correo}'`
      )

      return resultado;
    }
  },

  selectContraseniaUsuario : async (nombre_usuario, id_usuario, correo) => {
    if(nombre_usuario){
      const resultado = await turso.execute(
        `SELECT contrasenia FROM usuario WHERE nombre_usuario = '${nombre_usuario}'`
      )

      return resultado;
    }
    else if(id_usuario){
      const resultado = await turso.execute(
        `SELECT contrasenia FROM usuario WHERE id_usuario = '${id_usuario}'`
      )

      return resultado;
    }
    else if(correo){
      const resultado = await turso.execute(
        `SELECT contrasenia FROM usuario WHERE correo = '${correo}'`
      )

      return resultado;
    }
  },

  insertUsuario : async (nombre_usuario, correo, contrasenia) => {
    const resultado = await turso.execute(
      `INSERT INTO usuario (nombre_usuario, correo, contrasenia) VALUES ('${nombre_usuario}', '${correo}', '${contrasenia}') RETURNING id_usuario`
    );

    return resultado;
  },

  updateNombreUsuario : async (nombre_usuario, nuevo_nombre_usuario) => {
    const resultado = await turso.execute(
      `UPDATE usuario SET nombre_usuario = '${nuevo_nombre_usuario}' WHERE nombre_usuario = '${nombre_usuario}'`
    );

    return resultado;
  },

  updateContraseniaUsuario : async (correo, nueva_contrasenia) => {
    const resultado = await turso.execute(
      `UPDATE usuario SET contrasenia = '${nueva_contrasenia}' WHERE correo = '${correo}'`
    );
    
    return resultado;
  },

  deleteUsuarioSQL : async (id_usuario, nombre_usuario, correo) => {
    if(id_usuario){
      const resultado = await turso.execute(
        `DELETE FROM usuario WHERE id_usuario = '${id_usuario}'`
      )

      return resultado;
    }
    else if(nombre_usuario){
      const resultado = await turso.execute(
        `DELETE FROM usuario WHERE nombre_usuario = '${nombre_usuario}'`
      )

      return resultado;
    }
    else if(correo){
      const resultado = await turso.execute(
        `DELETE FROM usuario WHERE correo = '${correo}'`
      )

      return resultado;
    }
  }
};

export default usuarioModel;