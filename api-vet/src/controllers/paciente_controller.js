import Paciente from "../models/Paciente.js"

const registrarPaciente = async(req,res)=>{
    try {
        res.status(200).json({msg:"Registro exitoso de la mascota"})

    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}


export{
    registrarPaciente
}