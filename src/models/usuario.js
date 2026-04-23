import turso from '../config/db.js';
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const usuarioModel = {
  selectDatosUsuario: async (nombre_usuario, correo) => {
    if (nombre_usuario) {
      const resultado = await turso.execute(
        `SELECT * FROM usuario WHERE nombre_usuario = '${nombre_usuario}'`
      );

      return resultado;
    }
    else if (correo) {
      const resultado = await turso.execute(
        `SELECT * FROM usuario WHERE correo = '${correo}'`
      );

      return resultado;
    }
  },

  selectNombreUsuarioById: async (id_usuario) => {
    const resultado = await turso.execute(
      `SELECT nombre_usuario FROM usuario WHERE id_usuario = '${id_usuario}'`
    );

    return resultado;
  },

  selectNombreUsuarios: async () => {
    const resultado = await turso.execute(
      `SELECT nombre_usuario FROM usuario`
    );

    return resultado;
  },

  selectNombreUsuario: async (id_usuario, correo) => {
    const resultado = await turso.execute(
      `SELECT nombre_usuario FROM usuario WHERE id_usuario = '${id_usuario}' OR correo = '${correo}'`
    );

    return resultado;
  },

  selectIdUsuarios: async () => {
    const resultado = await turso.execute(
      `SELECT id_usuario FROM usuario`
    );

    return resultado;
  },

  selectIdUsuario: async (nombre_usuario, correo) => {
    if (nombre_usuario) {
      const resultado = await turso.execute(
        `SELECT id_usuario FROM usuario WHERE nombre_usuario = '${nombre_usuario}'`
      );

      return resultado;
    }
    else if (correo) {
      const resultado = await turso.execute(
        `SELECT id_usuario FROM usuario WHERE correo = '${correo}'`
      );

      return resultado;
    }

  },

  selectCorreoUsuario: async (nombre_usuario, id_usuario, correo) => {
    try {
      if (nombre_usuario) {
        const resultado = await turso.execute(
          `SELECT correo FROM usuario WHERE nombre_usuario = '${nombre_usuario}'`
        )

        return resultado;
      }
      else if (id_usuario) {
        const resultado = await turso.execute(
          `SELECT correo FROM usuario WHERE id_usuario = '${id_usuario}'`
        )

        return resultado;
      }
      else if (correo) {
        const resultado = await turso.execute(
          `SELECT correo FROM usuario WHERE correo = '${correo}'`
        )

        return resultado;
      }
    }
    catch (error) {
      console.log('Error en selectCorreoUsuario:', error);
    }
  },

  selectContraseniaUsuario: async (nombre_usuario, id_usuario, correo) => {
    if (nombre_usuario) {
      const resultado = await turso.execute(
        `SELECT contrasenia FROM usuario WHERE nombre_usuario = '${nombre_usuario}'`
      )

      return resultado;
    }
    else if (id_usuario) {
      const resultado = await turso.execute(
        `SELECT contrasenia FROM usuario WHERE id_usuario = '${id_usuario}'`
      )

      return resultado;
    }
    else if (correo) {
      const resultado = await turso.execute(
        `SELECT contrasenia FROM usuario WHERE correo = '${correo}'`
      )

      return resultado;
    }
  },

  insertUsuario: async (nombre_usuario, correo, contrasenia, url_foto, public_id) => {
    const resultado = await turso.execute({
      sql: `INSERT INTO usuario (nombre_usuario, correo, contrasenia, url_foto, public_id_foto) 
            VALUES (?, ?, ?, ?, ?) 
            RETURNING id_usuario`,
      args: [
        nombre_usuario,
        correo,
        contrasenia,
        url_foto,
        public_id
      ],
    });

    return resultado;
  },

  updateNombreUsuario: async (nombre_usuario, nuevo_nombre_usuario) => {
    const resultado = await turso.execute(
      `UPDATE usuario SET nombre_usuario = '${nuevo_nombre_usuario}' WHERE nombre_usuario = '${nombre_usuario}'`
    );

    return resultado;
  },

  updateContraseniaUsuario: async (correo, nueva_contrasenia) => {
    const resultado = await turso.execute(
      `UPDATE usuario SET contrasenia = '${nueva_contrasenia}' WHERE correo = '${correo}'`
    );

    return resultado;
  },

  deleteUsuarioSQL: async (id_usuario, nombre_usuario, correo) => {
    if (id_usuario) {
      const resultado = await turso.execute(
        `DELETE FROM usuario WHERE id_usuario = '${id_usuario}'`
      )

      return resultado;
    }
    else if (nombre_usuario) {
      const resultado = await turso.execute(
        `DELETE FROM usuario WHERE nombre_usuario = '${nombre_usuario}'`
      )

      return resultado;
    }
    else if (correo) {
      const resultado = await turso.execute(
        `DELETE FROM usuario WHERE correo = '${correo}'`
      )

      return resultado;
    }
  },

  selectFotoPerfil: async (nombre_usuario) => {
    try{
      const resultado = await turso.execute(
        `SELECT url_foto FROM usuario WHERE nombre_usuario = '${nombre_usuario}'`
      );
      return resultado;
    }
    catch(error){
      return new Error('Error al obtener la foto de perfil: ' + error.message);
    }
  },

  updateFotoPerfil: async (id_usuario, url_foto_nueva, public_id_foto_nueva) => {
    try{
      const resultado1 = await turso.execute(
        `SELECT public_id_foto FROM usuario WHERE id_usuario = '${id_usuario}'`
      );

      const public_id_foto_actual = resultado1.rows[0].public_id_foto;

      const resultado = await turso.execute({
        sql: `UPDATE usuario SET url_foto = ?, public_id_foto = ? WHERE id_usuario = ?`,
        args: [
          url_foto_nueva,
          public_id_foto_nueva,
          id_usuario
        ]
      });

      if(resultado && public_id_foto_actual){
        const resultadoCloud = await cloudinary.uploader.destroy(public_id_foto_actual);
      }

      return resultado;
    } 
    catch(error){
      return new Error('Error al actualizar la foto de perfil: ' + error.message);
    }
  }
};

export default usuarioModel;