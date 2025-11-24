import { create } from "zustand"
import { persist } from "zustand/middleware"


const storeAuth = create(
    //debo crear un metodo persist 
    // metodo para persistir en el navegador  para cuando se recargsa se mantieen los datos del usuario 
    persist(
        // dentro del persiste se pone el metodo set para poner la infromacion que va a persistir 
        set => ({
            token: null,
            rol:null,
            //funcion que me permita setear el token 
            setToken: (token) => set({ token }),
            setRol: (rol) => set({ rol }),
            //limpia el token cuando el usuario cierra sesion 
            clearToken: () => set({ token: null})
        }),

        { name: "auth-token" }
    
    )
)


export default storeAuth