import obtenerUsuarios from "../models/prueba_query.js";

const getPruebaQuery = async (req, res) => {
  try {
    const usuarios = await obtenerUsuarios();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default getPruebaQuery;