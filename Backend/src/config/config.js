import dotenv from 'dotenv';
dotenv.config();

// Configuración de CORS
const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000'];

export const corsOptions = {
  origin: function (origin, callback) {
    // Permite peticiones sin origen (como Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Configuración general
export const config = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET,
  allowedOrigins, // Exportamos también los orígenes permitidos
};