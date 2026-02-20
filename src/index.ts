import express from 'express';

const app = express();
const PORT: number = 3000;

app.get('/', (req, res) => {
  res.send('Hola, este es un servidor Express básico');
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}/Tablero.html`);
});

app.use(express.static('public'));