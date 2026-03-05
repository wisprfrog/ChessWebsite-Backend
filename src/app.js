// src/app.js

const express = require('express');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send("Servidor de ajedrez funcionando");
});

module.exports = app;