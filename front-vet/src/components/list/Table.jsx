import { MdDeleteForever, MdInfo,MdPublishedWithChanges } from "react-icons/md"
import {useFetch} from "../../hooks/useFetch"
import { useEffect, useState } from "react"
//mostrar detalle
import { useNavigate } from 'react-router'
//mensaje informativo 
import { ToastContainer } from "react-toastify"
import storeAuth from "../../context/storeAuth"

const Table = () => {

    const fetchDataBackend = useFetch()
    const [patients, setPatients] = useState([])
//mostrar detalle
    const navigate = useNavigate()
    //traer el rol de storeAuth
    const {rol}=storeAuth()
    
    const listPatients = async () => {
        //url a hacer la peticion
        const url = `${import.meta.env.VITE_BACKEND_URL}/pacientes`
        //token del local storage
        const storedUser = JSON.parse(localStorage.getItem("auth-token"))
        //establesco en las cabecera el token para hacer la peticion 
        const headers= {
            "Content-Type": "application/json",
            Authorization: `Bearer ${storedUser.state.token}`,
        }
        //peticion con fetch data backend 
        const response = await fetchDataBackend(url, null, "GET", headers)
        setPatients(response)
    }

//PASO 3
// cargo en el use efect 
    useEffect(() => {
        listPatients()
    }, [])

//Lleno los registros en una tabla 
    if (patients.length === 0) {

        return (
            <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50
            dark:bg-gray-800 dark:text-red-400" role="alert">
            <span className="font-medium">No existen registros</span>
            </div>
        )
    }

   //Eliminar paciente 
    const deletePatient = async(id) => {
        // debe mandar una confimacion 
        const confirmDelete = confirm("Vas registrar la salida del paciente, ¿Estás seguro?")
        
        //si usuariop confrima 
        if(confirmDelete){
            const url = `${import.meta.env.VITE_BACKEND_URL}/paciente/eliminar/${id}`
            const storedUser = JSON.parse(localStorage.getItem("auth-token"))
            const options = {
                //cabeceras
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${storedUser.state.token}`,
                }
            }

            const data ={
                salidaMascota:new Date().toString()
            }
            //Hago lapetciion con fech data backend 
            await fetchDataBackend(url, data, "DELETE", options.headers)

            // Lista los registrso de cambio de estado 
            setPatients((prevPatients) => prevPatients.filter(patient => patient._id !== id))
        }
    }

    return (
    
        <table className="w-full mt-5 table-auto shadow-lg bg-white">
            <ToastContainer/>
            {/* Encabezado */}
            <thead className="bg-gray-800 text-slate-400">
                <tr>
                    {["N°", "Nombre mascota", "Nombre propietario", "Email", "Celular", "Estado", "Acciones"].map((header) => (
                        <th key={header} className="p-2">{header}</th>
                    ))}
                </tr>
            </thead>
            

            {/* Cuerpo de la tabla */}
            <tbody>
{/* Uso la funcion map ára establecer el registro que quiero iterar patienets.map(patient))=>()*/}
                {
                    patients.map((patient, index) => (

                        <tr className="hover:bg-gray-300 text-center" key={patient._id}>


                            <td>{index + 1}</td>
                            <td>{patient.nombreMascota}</td>
                            <td>{patient.nombrePropietario}</td>
                            <td>{patient.emailPropietario}</td>
                            <td>{patient.celularPropietario}</td>

                            <td>
                                <span className="bg-blue-100 text-green-500 text-xs 
                                font-medium mr-2 px-2.5 py-0.5 rounded
                                dark:bg-blue-900 dark:text-blue-300">
                                {patient.estadoMascota && "activo"}</span>
                            </td>



                            <td className='py-2 text-center'>
                                
                                {rol==="veterinario"&&(
                                    <MdPublishedWithChanges
                                    title="Actualizar"
                                    className="h-7 w-7 text-slate-800 cursor-pointer inline-block mr-2
                                    hover:text-blue-600"
                                    onClick={() => navigate(`/dashboard/update/${patient._id}`)}
                                />
                                )
                            }

                                <MdInfo
                                    title="Más información"
                                    className="h-7 w-7 text-slate-800 cursor-pointer inline-block mr-2
                                    hover:text-green-600"
                                    onClick={() => navigate(`/dashboard/details/${patient._id}`)}
                                />

                                {rol==="veterinario"&&(
                                    <MdDeleteForever
                                    title="Eliminar"
                                    className="h-7 w-7 text-red-900 cursor-pointer inline-block
                                    hover:text-red-600"
                                    onClick={()=>{deletePatient(patient._id)}}
                                />
                                )

                                }
                            </td>
                        </tr>
                    ))
                }
            
            </tbody>
        
        </table>
    )
}

export default Table
