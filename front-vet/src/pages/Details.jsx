/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react"
import TableTreatments from "../components/treatments/Table"
import ModalTreatments from "../components/treatments/Modal"

//ver detalle
import { useParams } from "react-router"
import {useFetch} from "../hooks/useFetch"
import storeAuth from "../context/storeAuth"


const Details = () => {
    
    const { id } = useParams()
    const  fetchDataBackend  = useFetch()
    const [treatments, setTreatments] = useState(["demo"])
    const [patient, setPatient] = useState({})//uso use state para guarsdar la informacion del baceknd 

    const{rol}=storeAuth()
    //metodo formatea la fecha en dia mes y año
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('es-EC', { dateStyle: 'long', timeZone: 'UTC' })
    }


    //funcion listar paceinte la llomo dentro del useEffect
    useEffect(() => {
        const listPatient = async () => {
            //url de la peticion  
            const url = `${import.meta.env.VITE_BACKEND_URL}/paciente/${id}`
            //Obtener el token del local storage
            const storedUser = JSON.parse(localStorage.getItem("auth-token"))
            //Defno la cabecera

            const headers= {
                "Content-Type": "application/json",
                Authorization: `Bearer ${storedUser.state.token}`
            }

            //Hago la peticon con el fetch data backend 
            const response = await fetchDataBackend(url, null, "GET", headers)
            //cargar la respuesta al paciente  
            setPatient(response)
        }
        listPatient()
    }, [])



    return (
        <>
            <div>
                <h1 className='font-black text-4xl text-gray-500'>Visualizar</h1>
                <hr className='my-4 border-t-2 border-gray-300' />
                <p className='mb-8'>Este módulo te permite visualizar todos los datos</p>
            </div>


            <div>
                <div className='m-5 flex justify-between'>

                    <div>


                        <ul className="list-disc pl-5">

                            <li className="text-md text-gray-00 mt-4 font-bold text-xl">
                                Datos del propietrio</li>


                            {/* Datos del propietario */}
                            <ul className="pl-5">

                                <li className="text-md mt-2">
                                    <span className="text-gray-600 font-bold">
                                        Cédula: {patient?.cedulaPropietario}</span>
                                </li>

                                <li className="text-md mt-2">
                                    <span className="text-gray-600 font-bold">
                                        Nombres completos: {patient?.nombrePropietario}</span>
                                </li>

                                <li className="text-md mt-2">
                                    <span className="text-gray-600 font-bold">
                                        Correo electrónico: {patient?.emailPropietario}</span>
                                </li>

                                <li className="text-md mt-2">
                                <span className="text-gray-600 font-bold">
                                    Celular: {patient?.celularPropietario}</span>
                                </li>

                            </ul>



                            <li className="text-md text-gray-00 mt-4 font-bold text-xl">
                                Datos de la mascota</li>


                            {/* Datos del paciente */}
                            <ul className="pl-5">

                                <li className="text-md mt-2">
                                    <span className="text-gray-600 font-bold">
                                        Nombre: {patient?.nombreMascota}</span>
                                </li>

                                <li className="text-md mt-2">
                                    <span className="text-gray-600 font-bold">
                                        Tipo: {patient?.tipoMascota}</span>
                                </li>

                                <li className="text-md mt-2">
                                    <span className="text-gray-600 font-bold">
                                        {/* llamo al metodo para formaterar fecha */}
                                        Fecha de nacimiento: {formatDate(patient?.fechaNacimientoMascota)}</span>
                                </li>

                                <li className="text-md mt-2">
                                    <span className="text-gray-600 font-bold">
                                        Estado: </span>
                                    <span className="bg-blue-100 text-green-500 text-xs font-medium 
                                        mr-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                                    {patient?.estadoMascota && "activo"}
                                    </span>
                                </li>

                                <li className="text-md text-gray-00 mt-4">
                                    <span className="text-gray-600 font-bold">
                                        Observación: {patient?.detalleMascota}</span>
                                </li>
                            </ul>

                        </ul>

                    </div>
                    
                    
                    {/* Imagen lateral */}
                    <div>
                        <img src={patient?.avatarMascota || patient?.avatarMascotaIA} alt="dogandcat" className='h-80 w-80 rounded-full'/>
                    </div>
                </div>


                <hr className='my-4 border-t-2 border-gray-300' />


                {/* Sección de tratamientos */}
                <div className='flex justify-between items-center'>


                    {/* Apertura del modal tratamientos */}
                    <p>Este módulo te permite gestionar tratamientos</p>
                    {
                         rol==="veterinario" &&
                        (

                            <button className="px-5 py-2 bg-green-800 text-white rounded-lg hover:bg-green-700">
                                Registrar
                            </button>
                        )
                    }

                    {false  && (<ModalTreatments/>)}

                </div>
                

                {/* Mostrar los tratamientos */}
                {
                    treatments.length == 0
                        ?
                        <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
                            <span className="font-medium">No existen registros</span>
                        </div>
                        :
                        <TableTreatments treatments={treatments} />
                }
                
            </div>
        </>

    )
}

export default Details