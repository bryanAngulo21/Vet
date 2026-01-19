import {Router} from 'express'
import { eliminarTratamiento, pagarTratamiento, registrarTratamiento } from '../controllers/tratamiento_controller.js'
import { verificarTokenJWT } from '../middlewares/JWT.js'
const router = Router()


router.post('/tratamiento/registro',verificarTokenJWT,registrarTratamiento)

router.delete('/tratamiento/eliminar/:id',verificarTokenJWT,eliminarTratamiento)

router.post('/tratamiento/pago',verificarTokenJWT,pagarTratamiento)


export default router