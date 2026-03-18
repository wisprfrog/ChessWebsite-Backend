// src/app.js

import express from 'express';
import pruebaQueryRouter from './routes/prueba_query.route.js';

const app = express();

app.use(express.json());
app.use('/api/prueba-query', pruebaQueryRouter);

app.get('/', (req, res) => {
    res.send("Servidor de ajedrez funcionando");
});

export default app;