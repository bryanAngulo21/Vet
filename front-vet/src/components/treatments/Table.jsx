import { MdDeleteForever, MdAttachMoney  } from "react-icons/md"
import storeTreatments from "../../context/storeTreatments"
import storeAuth from "../../context/storeAuth"

//Para pasarelas de pago
//importar  las aperturas del mopdal propiasd de stripe
// amtes em el package jason debe estar cargadas ya se cargaron desde el inicio
// se debe ver la documentacion de stripe

import ModalPayment from "./ModalPayment"//cargar elmodal
import { Elements } from "@stripe/react-stripe-js"//elemnto de stripe
import { loadStripe } from "@stripe/stripe-js" //captur alos datos y manda un login para que se preocese 
import { useState } from "react"//selecionar el tratamiento
const stripePromise = loadStripe(import.meta.env.VITE_STRAPI_KEY)//variables de entorno
import { ToastContainer } from 'react-toastify'
//fin pasarela


const TableTreatments = ({treatments,listPatient}) => {

    const { rol } = storeAuth()

    const { deleteTreatments } = storeTreatments()

    //Pasareal de pago
    //traer el modal de store trataments y selectedTreatment 
    const { modal,toggleModal } = storeTreatments()
    const [selectedTreatment,setSelectedTreatment] = useState(null)

    //fin pasarela

    const handleDelete = async (id) => {
        const url = `${import.meta.env.VITE_BACKEND_URL}/tratamiento/eliminar/${id}`
        deleteTreatments(url)
        listPatient()
    }

    return (
         <>
            <ToastContainer/>

        <table className='w-full mt-5 table-auto shadow-lg  bg-white'>
        
            <thead className='bg-gray-800 text-slate-400'>
                <tr>
                    <th className='p-2'>N°</th>
                    <th className='p-2'>Nombre</th>
                    <th className='p-2'>Detalle</th>
                    <th className='p-2'>Prioridad</th>
                    <th className='p-2'>Precio</th>
                    <th className='p-2'>Estado pago</th>
                    <th className='p-2'>Acciones</th>
                </tr>
            </thead>
        
            <tbody>
                {
                    treatments.map((treatment, index) => (
                        <tr className="hover:bg-gray-300 text-center" key={treatment.id || index}>
                            <td>{index + 1}</td>
                            <td>{treatment.nombre}</td>
                            <td>{treatment.detalle}</td>
                            <td>{treatment.prioridad}</td>
                            <td>$ {treatment.precio}</td>
                            <td className={treatment.estadoPago === 'Pagado' ? 'text-green-500 text-sm' : 'text-red-500 text-sm'}>{treatment.estadoPago}</td>
                            
                            <td className='py-2 text-center'>
                        
                                {rol === "paciente" && (

                                    //boton de pago que unicamente le aparezca al usaurio dueno de la mascota 
                                    <MdAttachMoney
                                        className={
                                            treatment.estadoPago === "Pagado"
                                            ? "h-7 w-7 text-gray-500 pointer-events-none inline-block mr-2"
                                            : "h-7 w-7 text-slate-800 cursor-pointer inline-block mr-2 hover:text-green-600"
                                        }
                                        title="Pagar"
                                        onClick={() => {
                                            setSelectedTreatment(treatment)
                                            toggleModal("payment")
                                        }}
                                    />
                                )}
                                {
                                rol==="veterinario" && 
                                (
                                    <MdDeleteForever
                                        className={treatment.estadoPago==="Pagado" ? "h-8 w-8 text-gray-500 pointer-events-none inline-block" :"h-8 w-8 text-red-900 cursor-pointer inline-block hover:text-red-600"}
                                        title="Eliminar" onClick={() => { handleDelete(treatment._id) }} />
                                )
                            }
                            </td>
                        </tr>
                    ))
                }

            </tbody>
        </table>

        {/*cargar el modal de pagos guardado en elements, se debe teenr cargado antes el modal y el select tratament*/}
                    {/*con esto se hace la apertura del modal se cvarga el elements para cargar la interfaz*/}
           {modal === "payment" && selectedTreatment && (
                <Elements stripe={stripePromise}>
                    <ModalPayment treatment={selectedTreatment} />
                </Elements>
            )}
        
        </> //se envuelve todo en un frajment <></> para que react lo habilite y no de error (como tengo 2 elementos) caundo se habilita tabla y modal

    )
}


export default TableTreatments