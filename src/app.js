// src/app.js
import express from 'express';
import cors from 'cors'
import authRoutes from './routes/authRoutes.js'

const app = express();

app.use(cors())
app.use(express.json());

app.get('/', (req, res) => {
    res.send("Servidor de ajedrez funcionando");
});

app.use('/api',authRoutes)

export default app;