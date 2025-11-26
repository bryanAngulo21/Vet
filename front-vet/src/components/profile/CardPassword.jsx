

//importar los hooks useform para formularios store profile y sture auth para limipiar el token cerrar la sesion
import { useForm } from "react-hook-form"
import storeProfile from "../../context/storeProfile"
import storeAuth from "../../context/storeAuth"

import { ToastContainer } from "react-toastify"

const CardPassword = () => {

    //Paso 1 crear los hooks
    //usar formularios
    const { register, handleSubmit, formState: { errors } } = useForm()
    //informacion del usuario
    const {user,updatePasswordProfile} = storeProfile()
    //par alimpiar los tokens
    const { clearToken } = storeAuth()

    //Paso 3 la logica para el cambio de contraseña 

    const updatePassword = async (dataForm) => {
        // url para saber donde voy a hacer la peticion 
        const url = `${import.meta.env.VITE_BACKEND_URL}/actualizarpassword/${user._id}`
        // lamo a update password
        const response = await updatePasswordProfile(url,dataForm)
        if(response){
            clearToken()
        }
    }

    // Paso 2 mostramos los mensajes de error en los inputs del formulario ...register y los errores
    // Pado 3 pongo el evento onsumit el vento update password
    return (
        <>
        <ToastContainer/>
            <div className='mt-5'>
                <h1 className='font-black text-2xl text-gray-500 mt-16'>Actualizar contraseña</h1>
                <hr className='my-4 border-t-2 border-gray-300' />
            </div>
           
            {/* Formulario */}
            <form onSubmit={handleSubmit(updatePassword)}>

                {/* Campo contraseña actual */}
                <div>
                    <label className="mb-2 block text-sm font-semibold">Contraseña actual</label>
                    <input type="password" placeholder="Ingresa tu contraseña actual" 
                    className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500 mb-5"
                    {...register("passwordactual", { required: "La contraseña actual es obligatoria" })}
                    />
                    {errors.passwordactual && <p className="text-red-800">{errors.passwordactual.message}</p>}
                </div>


                {/* Campo contraseña nueva */}
                <div>
                    <label className="mb-2 block text-sm font-semibold">Nueva contraseña</label>
                    <input type="password" placeholder="Ingresa la nueva contraseña" 
                    className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500 mb-5"
                    {...register("passwordnuevo", { required: "La nueva contraseña es obligatoria" })}
                    />
                    {errors.passwordnuevo && <p className="text-red-800">{errors.passwordnuevo.message}</p>}
                </div>


                {/* Botón para actualizar la contraseña */}
                <input
                    type="submit"
                    className='bg-gray-800 w-full p-2 text-slate-300 uppercase 
                    font-bold rounded-lg hover:bg-gray-600 cursor-pointer transition-all'
                    value='Cambiar'
                />

            </form>
        </>
    )
}

export default CardPassword