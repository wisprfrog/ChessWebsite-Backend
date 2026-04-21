import solicitud_amistadModel from "../models/solicitud_amistad.js";

export const getSolicitudesEnviadas = async (req, res) => {
  const id_usuario = req.params.id_usuario;

  if (!id_usuario) return res.status(400).json({ error: 'Falta el id_usuario en los parámetros' });

  try {
    const resultado = await solicitud_amistadModel.selectSolicitudesEnviadas(id_usuario);
    console.log("Resultado de la consulta de enviadas:", resultado.rows);
    return res.status(200).json(resultado.rows);
  }
  catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Error al obtener las solicitudes de amistad enviadas' });
  }
}

export const getSolicitudesRecibidas = async (req, res) => {
  const id_usuario = req.params.id_usuario;

  if (!id_usuario) return res.status(400).json({ error: 'Falta el id_usuario en los parámetros' });

  try {
    const resultado = await solicitud_amistadModel.selectSolicitudesRecibidas(id_usuario);
    console.log("Resultado de la consulta de recibidas:", resultado.rows);
    return res.status(200).json(resultado.rows);
  }
  catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Error al obtener las solicitudes de amistad recibidas' });
  }
}

export const postSolicitudAmistad = async (req, res) => {
  const id_usuario_origen = req.params.id_usuario;
  const id_usuario_destino = req.body.id_usuario_destino;

  if (!id_usuario_origen || !id_usuario_destino) return res.status(400).json({ error: 'Faltan datos en la solicitud' });

  try {
    const resultado = await solicitud_amistadModel.insertSolicitudAmistad(id_usuario_origen, id_usuario_destino);
    console.log("Resultado de la inserción:", resultado);
    return res.status(201).json({ message: 'Solicitud de amistad enviada correctamente' });
  }
  catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Error al enviar la solicitud de amistad' });
  }
}

export const deleteSolicitudAmistad = async (req, res) => {
  const id_usuario_origen = req.params.id_usuario;
  const id_usuario_destino = req.body.id_usuario_destino;

  if (!id_usuario_origen || !id_usuario_destino) return res.status(400).json({ error: 'Faltan datos en la solicitud' });

  try {
    const resultado = await solicitud_amistadModel.deleteSolicitudAmistad(id_usuario_origen, id_usuario_destino);
    console.log("Resultado de la eliminación:", resultado);
    return res.status(200).json({ message: 'Solicitud de amistad eliminada correctamente' });
  }
  catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Error al eliminar la solicitud de amistad' });
  }
}