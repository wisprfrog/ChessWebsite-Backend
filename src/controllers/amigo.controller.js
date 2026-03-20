import amigosModel from '../models/amigo.js';
import usuarioModel from '../models/usuario.js';

export const getAmigos = async (req, res) => {
  const { id_usuario } = req.body;

  if (!id_usuario) return res.status(401).json({ message: 'Faltan datos requeridos' });

  const resultado = await amigosModel.selectAmigos(id_usuario);

  res.status(200).json({
    message: 'Amigos del usuario',
    amigos: resultado.rows
  });
}

export const postAmigo = async(req, res) => {
    const { id_usuario, id_amigo} = req.body;

    if (!id_usuario || !id_amigo) return res.status(401).json({ message: 'Faltan datos requeridos' });

    const resultado_usuario = await usuarioModel.selectIdUsuario(id_usuario);
    const resultado_amigo = await usuarioModel.selectIdUsuario(id_amigo);

    if(!resultado_usuario || !resultado_amigo) return res.status(401).json({ message: 'Usuario o amigo no encontrado' });

    try{
        const resultado = await amigosModel.insertAmigo(id_usuario, id_amigo);
        return res.status(200).json({ message: 'Amigo agregado exitosamente', resultado: resultado});
    }catch(error){
        return res.status(401).json({ message: 'Error al agregar amigo' });
    }
}

export const deleteAmigo = async(req, res) => {
  const {id_usuario, id_amigo} = req.body;

  if(!id_usuario || !id_amigo) return res.status(401).json({message: "Faltan datos requeridos"});

  const resultado_usuario = await usuarioModel.selectIdUsuario(id_usuario);
  const resultado_amigo = await usuarioModel.selectIdUsuario(id_amigo);

  if(!resultado_usuario || !resultado_amigo) return res.status(401).json({ message: 'Usuario o amigo no encontrado' });
  
  try{
    const resultado = await amigosModel.deleteAmigo(id_usuario, id_amigo);

    return res.status(200).json({ message: 'Amigo eliminado exitosamente', resultado: resultado});
  }catch(error){
    return res.status(401).json({ message: 'Error al eliminar amigo' });
  }
}