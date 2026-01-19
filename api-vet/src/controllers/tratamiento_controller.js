import Tratamiento from "../models/Tratamiento.js"
import mongoose from "mongoose"

import Paciente from "../models/Paciente.js"
import { Stripe } from "stripe"
const stripe = new Stripe(`${process.env.STRIPE_PRIVATE_KEY}`)

const registrarTratamiento = async (req,res)=>{

    try {
        //res.send("tratamiento")
        //Paso 1
       const {paciente} = req.body
       //Paso 2
        if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Debes llenar todos los campos"})
        if( !mongoose.Types.ObjectId.isValid(paciente)) return res.status(404).json({msg:`No existe el paciente ${paciente}`})

        await Tratamiento.create(req.body)
        res.status(201).json({msg:"Registro exitoso del tratamiento"})

    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}

const eliminarTratamiento = async(req,res)=>{
    try {
        const {id} = req.params
        if( !mongoose.Types.ObjectId.isValid(id) ) return res.status(404).json({msg:`No existe el tratamiento ${id}`})
        await Tratamiento.findByIdAndDelete(id)
        res.status(200).json({msg:"Tratamiento eliminado exitosamente"})

    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}







const pagarTratamiento = async (req, res) => {

    try {
        
        // PASO 1: Obtener los datos
        // payment method: tipo de pago
        // id del tratamientos
        // cantidad
        // motivo

        const { paymentMethodId, treatmentId, cantidad, motivo } = req.body

        //  PASO 2 logica validaciones
        // ve si el tratamiento consultado el pago ha sido pagado o no

        const tratamiento = await Tratamiento.findById(treatmentId)
        if (tratamiento.estadoPago === "Pagado") return res.status(400).json({ message: "Este tratamiento ya fue pagado" })
        // especificar el metod de pago
    if (!paymentMethodId) return res.status(400).json({ message: "paymentMethodId no proporcionado" })
        //aqi s epon mas validaciones numeros positivos no cero

        //PASO 3
        //traer el paciente 
        const paciente = await Paciente.findById(tratamiento.paciente)
        //para vetr quien realizao ese pago 
        const clienteStripe = await stripe.customers.create({name: paciente.nombrePropietario,email: paciente.emailPropietario})
        // conesto creo el apgo y mando los datos del pago 
        const payment = await stripe.paymentIntents.create({
            amount:Math.round(cantidad*100),//5.99=>599
            currency: "usd",
            description: motivo,
            payment_method: paymentMethodId,
            confirm: true,
            customer: clienteStripe.id,
            receipt_email: paciente.email,
            automatic_payment_methods: {
                enabled: true, /*usuario uingres alos datos de al tarjeta y hace elc opbro */
                allow_redirects: "never"
            }
        })

        if (payment.status === "succeeded") {
            await Tratamiento.findByIdAndUpdate(treatmentId, { estadoPago: "Pagado" })
            return res.status(200).json({ msg: "El pago se realizó exitosamente" })
        }else{
            return res.status(400).json({ msg: `El pago no se completó ${payment.status}` })
        }
            
    } catch (error) {
        res.status(500).json({ msg: `❌ Error al intentar pagar el tratamiento - ${error}` })
    }
}




export{
    registrarTratamiento,
    eliminarTratamiento,
    pagarTratamiento
}