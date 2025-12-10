import { sendMailToOwner } from "../helpers/sendMail.js"
import { subirBase64Cloudinary, subirImagenCloudinary } from "../helpers/uploadCloudinary.js"
import Paciente from "../models/Paciente.js"
import mongoose from "mongoose"
import { v2 as cloudinary } from 'cloudinary'
import fs from "fs-extra"

const registrarPaciente = async(req,res)=>{

    try {
         //res.status(200).json({msg:"Registro exitoso de la mascota"}) 
        //Paso 1 Obtener datos 
        const {emailPropietario}=req.body

         //Paso 2 Validar 
            //campos vacio
        if (Object.values(req.body).includes("")) 
            return res.status(400).json({msg:"Debes llenar todos los campos"})

        //consulta base de datos paa ver usuario registrado
        const emailExistente = await Paciente.findOne({emailPropietario})
        
        if(emailExistente) return res.status(400).json({msg:"El email ya se encuentra registrado"})

        //Paso 3 Logica 
        //crear contraseña temporal para el usuario 
        const password = Math.random().toString(36).toUpperCase().slice(2, 5)
        
        //guardar datos del usuario  
        //registro de un nuevo propietario
        const nuevoPaciente = new Paciente({
            //parametrso rest 
            ...req.body,
            //encripta el password 
            //relaciona el veterinario que esta registrando al paciente
            passwordPropietario: await Paciente.prototype.encryptPassword("VET"+password),
            veterinario: req.veterinarioHeader._id
        })

        //Imagenes 
        //desde el propietario
        if (req.files?.imagen) {
            const { secure_url, public_id } = await subirImagenCloudinary(req.files.imagen.tempFilePath)
            nuevoPaciente.avatarMascota = secure_url
            nuevoPaciente.avatarMascotaID = public_id
        }
        //imagenes con ia
        if (req.body?.avatarMascotaIA) {
            const secure_url = await subirBase64Cloudinary(req.body.avatarMascotaIA)
            nuevoPaciente.avatarMascotaIA = secure_url
        }

         //guarda   
        await nuevoPaciente.save()
        await sendMailToOwner(emailPropietario,"VET"+password)

         //Paso 4 Respuesta
        res.status(201).json({ msg: "Registro exitoso de la mascota y correo enviado al propietario" })

    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}

const listarPacientes = async (req,res)=>{
    try {
        const pacientes = await Paciente.find({ estadoMascota: true, veterinario: req.veterinarioHeader._id }).select
        ("-passwordPropietario -createdAt -updatedAt -__v").populate('veterinario','_id nombre apellido')
        res.status(200).json(pacientes)

    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}

const detallePaciente = async(req,res)=>{

    try {
        //paso 1
        const {id} = req.params

        //paso 2
        if( !mongoose.Types.ObjectId.isValid(id) ) return res.status(404).json({msg:`No existe el veterinario ${id}`});
       //paso 3
        const paciente = await Paciente.findById(id).select("-createdAt -updatedAt -__v").populate('veterinario','_id nombre apellido')
        //paso 4
        res.status(200).json(paciente)
        
    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}


const eliminarPaciente = async (req,res)=>{

    try {
        //paso 1
        const {id} = req.params
        const {salidaMascota} = req.body

        //paso 2
        if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Debes llenar todos los campos"})
        if( !mongoose.Types.ObjectId.isValid(id) ) return res.status(404).json({msg:`No existe el paciente ${id}`})
        // paso3
        await Paciente.findByIdAndUpdate(id,{salidaMascota:Date.parse(salidaMascota),estadoMascota:false})
       //paso 4
        res.status(200).json({msg:"Fecha de salida registrado exitosamente"})

    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}



const actualizarPaciente = async(req,res)=>{
    try{

        //paso 1
        const {id} = req.params
        //paso 2
        if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})
            
        if( !mongoose.Types.ObjectId.isValid(id) ) return res.status(404).json({msg:`Lo sentimos, no existe el veterinario ${id}`})
        
        //paso 3
        //actulizar imagen 
        if (req.files?.imagen) {
            const paciente = await Paciente.findById(id)
            if (paciente.avatarMascotaID) {
                await cloudinary.uploader.destroy(paciente.avatarMascotaID);
            }

            //carga la imagen de cloudinary
            const cloudiResponse = await cloudinary.uploader.upload(req.files.imagen.tempFilePath, { folder: 'Pacientes' });
            req.body.avatarMascota = cloudiResponse.secure_url;
            req.body.avatarMascotaID = cloudiResponse.public_id;
            await fs.unlink(req.files.imagen.tempFilePath);
        }
        await Paciente.findByIdAndUpdate(id, req.body, { new: true })

        //paso 4
        res.status(200).json({msg:"Actualización exitosa del paciente"})

        
    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}






export{
    registrarPaciente,
    listarPacientes,
    detallePaciente,
    eliminarPaciente,
    actualizarPaciente
}