// src/app.js

import express from 'express';

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send("Servidor de ajedrez funcionando");
});

export default app;