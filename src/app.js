// src/app.js

import express from 'express';
import cors from 'cors';
import usuarioRouter from './routes/usuario.routes.js';
import amigosRouter from './routes/amigo.routes.js';
import partidaRouter from './routes/partida.routes.js';
import estadisticaRouter from './routes/estadistica.routes.js';
import solicitudAmistadRouter from './routes/solicitud_amistad.routes.js';

const app = express();

app.use(express.json());
app.use(cors({
    cors: {
        origin: [
        // 'http://192.168.0.2:3000',
        'http://localhost:3000',
        'https://monsterchessofclansfrontend.vercel.app'
        ],
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true // Permitir el envío de cookies para la autenticación si es necesario 
    }
}));


app.use('/api/usuario', usuarioRouter);
app.use('/api/amigo', amigosRouter);
app.use('/api/partida', partidaRouter);
app.use('/api/estadistica', estadisticaRouter);
app.use('/api/solicitud_amistad', solicitudAmistadRouter);

app.get('/', (req, res) => {
    res.send("Servidor de ajedrez funcionando");
});

export default app;