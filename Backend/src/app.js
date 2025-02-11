import express from 'express';
import router from './router/authRoutes.js';
import { corsOptions } from './config/config.js';
import cors from 'cors';
const PORT = process.env.PORT || 5000;

const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use('/', router)
app.use('/api/auth', router);

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
