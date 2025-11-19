import { Navigate } from "react-router"
import storeAuth from "../context/storeAuth"

//children rutas hijas 
const ProtectedRoute = ({ children }) => {

    const token = storeAuth(state => state.token)
    // si exite token carga las rutas hijas sino carga login 
    return token ?  children  : <Navigate to="/login" replace />
}

export default ProtectedRoute