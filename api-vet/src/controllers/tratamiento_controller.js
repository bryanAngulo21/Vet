import Tratamiento from "../models/Tratamiento.js"
import mongoose from "mongoose"


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



export{
    registrarTratamiento,
    eliminarTratamiento
}