import { create } from "zustand"
import axios from "axios" //para hacer peticiones al backend
import { toast } from "react-toastify"


//metodo sirve para crear el token de tipo beader y coger el token almacenado en el local storage

const getAuthHeaders = () => {
    const storedUser = JSON.parse(localStorage.getItem("auth-token"))
    return {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${storedUser?.state?.token}`,
        },
    }
}

// creo el perfil 

const storeProfile = create((set) => ({
    // defino la variable user inicail en null
    user: null,
    //limpio la informacion 
    clearUser: () => set({ user: null }),
    //Metodo profile cargo la informacion del perfil cuando inicia sesion 
    profile: async () => {

        try {
            //url para hacer la peticion revsar vetirnario    
            const url = `${import.meta.env.VITE_BACKEND_URL}/veterinario/perfil`
            //Hago la peticion con libreira axios le paso url y autenticacion
            const respuesta = await axios.get(url, getAuthHeaders())
            //Setea a ese usuario y le carga con la informacion que vien desde el backend
            set({ user: respuesta.data })
        } catch (error) {
            console.error(error)
        }
    },



     updatePasswordProfile:async(url,data)=>{
        try {
            const respuesta = await axios.put(url, data, getAuthHeaders())
            return respuesta
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.msg)
        }
    },

    //actualizar perfil
     updateProfile:async(url, data)=>{
        try {
            const respuesta = await axios.put(url, data, getAuthHeaders())
            set({ user: respuesta.data })
            toast.success("Perfil actualizado correctamente")
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.msg)
        }
    }

    })
)

export default storeProfile
