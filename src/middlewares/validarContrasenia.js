import bcrypt from 'bcrypt';
import usuarioModel from '../models/usuario.js';

const validarContrasenia = async (req, res, next) => {
    const { id_usuario, contrasenia} = req.body;

    if(!id_usuario || !contrasenia) return res.status(400).json({ message: 'Faltan datos requeridos' });

    try{
        const resultado = await usuarioModel.selectContraseniaUsuario(null, id_usuario, null);
        if(resultado.rows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });

        const contraseniaEncriptada = resultado.rows[0].contrasenia;
        const contraseniaValida = await bcrypt.compare(contrasenia, contraseniaEncriptada);

        if(!contraseniaValida) return res.status(401).json({ message: 'Contraseña incorrecta' });

        next();
    }
    catch(error){
        res.status(500).json({ message: 'Error interno del servidor', error });
    }
}

export default validarContrasenia;