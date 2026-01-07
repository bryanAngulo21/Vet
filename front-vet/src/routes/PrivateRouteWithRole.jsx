import storeAuth from '../context/storeAuth'
import { Forbidden } from '../pages/Forbidden'


const PrivateRouteWithRole=({ children })=> {

    const {rol} = storeAuth()
    
    return ("paciente" === rol) ? <Forbidden/> : children
    
}

export default PrivateRouteWithRole