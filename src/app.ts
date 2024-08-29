import express from 'express';
import mongoose from 'mongoose';
import readingRoutes from './routes/readingRoutes';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
app.use('/leitura', readingRoutes);

interface MyConnectOptions extends mongoose.ConnectOptions {
    useNewRtlParser: boolean
}
mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/leitura-imagens', {
    useNewUrlParser: true,
    useUnifiedTopology: true
} as unknown as MyConnectOptions).then(() => {
    console.log('Conectado ao MongoDB');
}).catch((error) => {
    console.log('Erro ao conectar ao MongoDB', error);
});

export default app;