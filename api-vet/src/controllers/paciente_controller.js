import { sendMailToOwner } from "../helpers/sendMail.js"
import { subirBase64Cloudinary, subirImagenCloudinary } from "../helpers/uploadCloudinary.js"
import Paciente from "../models/Paciente.js"
import mongoose from "mongoose"
import { v2 as cloudinary } from 'cloudinary'
import fs from "fs-extra"
import { crearTokenJWT } from "../middlewares/JWT.js"


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

const loginPropietario = async(req,res)=>{

    try {
        //Paso1
        const {email:emailPropietario,password:passwordPropietario} = req.body

        //Paso2
        //Validaciones
        if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Debes llenar todos los campos"})
        const propietarioBDD = await Paciente.findOne({emailPropietario})
        if(!propietarioBDD) return res.status(404).json({msg:"El propietario no se encuentra registrado"})
        const verificarPassword = await propietarioBDD.matchPassword(passwordPropietario)
        if(!verificarPassword) return res.status(404).json({msg:"El password no es el correcto"})
        const token = crearTokenJWT(propietarioBDD._id,propietarioBDD.rol)
        const {_id,rol} = propietarioBDD
        res.status(200).json({
            token,
            rol,
            _id
        })
        //Paso3
    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}

const perfilPropietario = (req, res) => {
   // res.send("desde el perfil propietario")
    // 1. se pude hacer una consulta a base de datos
    // 2. se puede obtener de las cabeceras headers 

    try {
        //Paso 1 
        //Paso 2
        //Paso 3
        //obtengo la inofrmacion dela scabeceras de paciente header hgo desetructuracion ppara obtener la informacion que necesito 
        const{_id, rol,nombrePropietario,cedulaPropietario,emailPropietario,celularPropietario,nombreMascota} = req.pacienteHeader

        //Paso 4
        res.status(200).json({
            _id,
            rol,
            nombrePropietario,
            cedulaPropietario,
            emailPropietario,
            celularPropietario,
            nombreMascota,
        })
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
    actualizarPaciente,
    loginPropietario,
    perfilPropietario
}