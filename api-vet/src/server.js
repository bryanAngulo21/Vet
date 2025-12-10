// Requerir módulos
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

// cloudinary
import cloudinary from 'cloudinary';
import fileUpload from "express-fileupload";

// Inicializaciones
const app = express();
dotenv.config();

// Configuraciones cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// MIDDLEWARES 
app.use(express.json());
app.use(cors());
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: './uploads'
}));

// Variables globales
app.set('port', process.env.PORT || 3000);

// Rutas
app.get('/', (req, res) => res.send("Server on"));

// Rutas importadas
import routerVeterinarios from './routers/veterinario_routes.js'
import routerPacientes from './routers/paciente_routes.js'

// Rutas (van después del middleware)
app.use('/api', routerVeterinarios);
app.use('/api', routerPacientes);

// 404
app.use((req, res) => res.status(404).send("Endpoint no encontrado - 404"));

// Exportar
export default app;
