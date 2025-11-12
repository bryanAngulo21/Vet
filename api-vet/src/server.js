// Requerir módulos
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

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


// Rutas para veterinarios
app.use('/api', routerVeterinarios);

// Manejo de una ruta que no sea encontrada (404)
app.use((req, res) => res.status(404).send("Endpoint no encontrado - 404"));

// Exportar la instancia de express
export default app;
