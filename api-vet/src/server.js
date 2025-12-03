// Requerir módulos
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

//Para cluidnari
import cloudinary from 'cloudinary'
import fileUpload from "express-fileupload"

// Inicializaciones
const app = express();
dotenv.config();

// Configuraciones 

// Middlewares
app.use(express.json());
app.use(cors());

// Variables globales
app.set('port', process.env.PORT || 3000);

// Rutas
app.get('/', (req, res) => res.send("Server on"));

// Agregar las rutas de veterinarios
import routerVeterinarios from './routers/veterinario_routes.js'; // Asegúrate de que esta ruta sea correcta

// Ruta principal
//app.get('/',(req,res)=>res.send("Server on"))


// Agregar las rutas de paciente
import routerPacientes from './routers/paciente_routes.js'




// Rutas para veterinarios
app.use('/api', routerVeterinarios);


// Rutas para pacientes
app.use('/api',routerPacientes)

// Manejo de una ruta que no sea encontrada (404)
app.use((req, res) => res.status(404).send("Endpoint no encontrado - 404"));

// Exportar la instancia de express
export default app;


//cloudinary

// Configuraciones
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})


// Middlewares
app.use(express.json())
app.use(cors())
 
app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : './uploads'
}))
