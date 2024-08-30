import express from 'express';
import mongoose from 'mongoose';
import readingRoutes from './routes/readingRoutes';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
app.use('/leitura', readingRoutes);


mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/leitura-imagens')
    .then(() => {
        console.log('Conectado ao MongoDB');
    }).catch((error) => {
        console.log('Erro ao conectar ao MongoDB', error);
    });

export default app;