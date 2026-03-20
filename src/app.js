// src/app.js

import express from 'express';
import usuarioRouter from './routes/usuario.routes.js';
import amigosRouter from './routes/amigo.routes.js';
import partidaRouter from './routes/partida.routes.js';
import estadisticaRouter from './routes/estadistica.routes.js';

const app = express();

app.use(express.json());
app.use('/api/usuario', usuarioRouter);
app.use('/api/amigo', amigosRouter);
app.use('/api/partida', partidaRouter);
app.use('/api/estadistica', estadisticaRouter);

app.get('/', (req, res) => {
    res.send("Servidor de ajedrez funcionando");
});

export default app;