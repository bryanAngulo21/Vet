
import Veterinario from "../models/Veterinario.js"
import { sendMailToRecoveryPassword, sendMailToRegister } from "../helpers/sendMail.js"
import { crearTokenJWT } from "../middlewares/JWT.js"

import mongoose from "mongoose"


const registro = async (req,res)=>{

    try {
        const {email,password} = req.body
        
                
        if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})
        const verificarEmailBDD = await Veterinario.findOne({email})
        if(verificarEmailBDD) return res.status(400).json({msg:"Lo sentimos, el email ya se encuentra registrado"})
        
        const nuevoVeterinario = new Veterinario(req.body)
        nuevoVeterinario.password = await nuevoVeterinario.encryptPassword(password)
       
        const token = nuevoVeterinario.createToken()
       
        await sendMailToRegister(email,token) 
        await nuevoVeterinario.save()
        

        
        res.status(200).json({msg:"Revisa tu correo electrónico para confirmar tu cuenta"})

    } catch (error) {
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }

}

const confirmarMail = async (req, res) => {
    try {
        const { token } = req.params
        const veterinarioBDD = await Veterinario.findOne({ token })
        if (!veterinarioBDD) return res.status(404).json({ msg: "Token inválido o cuenta ya confirmada" })
        veterinarioBDD.token = null
        veterinarioBDD.confirmEmail = true
        await veterinarioBDD.save()
        res.status(200).json({ msg: "Cuenta confirmada, ya puedes iniciar sesión" })

    } catch (error) {
    console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}



const recuperarPassword = async (req, res) => {

    try {
        const { email } = req.body
        if (!email) return res.status(400).json({ msg: "Debes ingresar un correo electrónico" })
        const veterinarioBDD = await Veterinario.findOne({ email })
        if (!veterinarioBDD) return res.status(404).json({ msg: "El usuario no se encuentra registrado" })
        const token = veterinarioBDD.createToken()
        veterinarioBDD.token = token
        await sendMailToRecoveryPassword(email, token)
        await veterinarioBDD.save()
        res.status(200).json({ msg: "Revisa tu correo electrónico para reestablecer tu cuenta" })
        
    } catch (error) {
    console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}



const comprobarTokenPasword = async (req,res)=>{
    try {
        const {token} = req.params
        const veterinarioBDD = await Veterinario.findOne({token})
        if(veterinarioBDD?.token !== token) return res.status(404).json({msg:"Lo sentimos, no se puede validar la cuenta"})
        res.status(200).json({msg:"Token confirmado, ya puedes crear tu nuevo password"}) 
    
    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}



const crearNuevoPassword = async (req,res)=>{

    try {
        const{password,confirmpassword} = req.body
        const { token } = req.params
        if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Debes llenar todos los campos"})
        if(password !== confirmpassword) return res.status(404).json({msg:"Los passwords no coinciden"})
        const veterinarioBDD = await Veterinario.findOne({token})
        if(!veterinarioBDD) return res.status(404).json({msg:"No se puede validar la cuenta"})
        veterinarioBDD.token = null
        veterinarioBDD.password = await veterinarioBDD.encryptPassword(password)
        await veterinarioBDD.save()
        res.status(200).json({msg:"Felicitaciones, ya puedes iniciar sesión con tu nuevo password"}) 

    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}




const login = async(req,res)=>{

    try {

        //Paso 1 capturar los daros del req.body
        // los inputs en fron se deben llamar email y password

        const {email,password} = req.body

        //Pso 2 comprobacion de espacios vacios     
        if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Debes llenar todos los campos"})
        
            
        const veterinarioBDD = await Veterinario.findOne({email}).select("-status -__v -token -updatedAt -createdAt")
        if(!veterinarioBDD) return res.status(404).json({msg:"El usuario no se encuentra registrado"})
        if(!veterinarioBDD.confirmEmail) return res.status(403).json({msg:"Debes verificar tu cuenta antes de iniciar sesión"})
        const verificarPassword = await veterinarioBDD.matchPassword(password)
        if(!verificarPassword) return res.status(401).json({msg:"El password no es correcto"})

        //Paso 3
        //aplico desestructuracion 
        const {nombre,apellido,direccion,telefono,_id,rol} = veterinarioBDD
        //const {nombre,apellido,direccion,telefono,_id,rol,correo} = veterinarioBDD
       
        //token de acceso
        const token = crearTokenJWT(veterinarioBDD._id,veterinarioBDD.rol)


        //Paso 4 

        //solo mando la informacion que se requiere 
        res.status(200).json({
            token,
            rol,
            nombre,
            apellido,
            direccion,
            telefono,
            _id,
            email:veterinarioBDD.email
            //correo
        })


    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}


const perfil =(req,res)=>{
    //res.send("Perfil del usuario");
    try {
        //PaSO 1: req.veterinarioHeader
        //Paso 2. Middleware es la valdidacion
        //Paso 3 Logica
        //desestructuracion 
        //...uso parametros rest la informacion restante se almacena en una sola varible llamada datos perfil 
	const {token,confirmEmail,createdAt,updatedAt,__v,...datosPerfil} = req.veterinarioHeader
        //Paso 4: Respuesta
        // imprime
    res.status(200).json(datosPerfil)
    
     } catch (error) {
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }

}


const actualizarPassword = async (req,res)=>{
    //res.send("Actualizar password")
    try {
        //Paso 1 obtener datos que recibe el controlador del backend 
        const{passwordactual, passwordnuevo}=req.body
        const{_id}=req.veterinarioHeader
        //Paso2
        const veterinarioBDD = await Veterinario.findById(_id)
        if(!veterinarioBDD) return res.status(404).json({msg:`Lo sentimos, no existe el veterinario ${id}`})

        const verificarPassword = await veterinarioBDD.matchPassword(passwordactual)
        if(!verificarPassword) return res.status(404).json({msg:"Lo sentimos, el password actual no es el correcto"})
        
        
        //Paso 3 Logica cuando se ingrese la contrasena se guarda encriptda en la base de datos
        veterinarioBDD.password = await veterinarioBDD.encryptPassword(passwordnuevo)
        //metodo asincrono para guardar
        await veterinarioBDD.save()
        //Paso 4 mopswtrar respuesta con res.status
    res.status(200).json({msg:"Password actualizado correctamente"})
        /*const veterinarioBDD = await Veterinario.findById(req.veterinarioHeader._id)
        if(!veterinarioBDD) return res.status(404).json({msg:`Lo sentimos, no existe el veterinario ${id}`})
        const verificarPassword = await veterinarioBDD.matchPassword(req.body.passwordactual)
        if(!verificarPassword) return res.status(404).json({msg:"Lo sentimos, el password actual no es el correcto"})
        veterinarioBDD.password = await veterinarioBDD.encryptPassword(req.body.passwordnuevo)
        await veterinarioBDD.save()*/


    } catch (error) {
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}


const actualizarPerfil = async (req,res)=>{

    try {
        //Paso 1 obtener datos que recibe el controlador del backend 
        //const {id} = req.params
        const{_id}=req.veterinarioHeader
        const {nombre,apellido,direccion,celular,email} = req.body

        //if( !mongoose.Types.ObjectId.isValid(id) ) return res.status(400).json({msg:`ID inválido: ${id}`})
        //const veterinarioBDD = await Veterinario.findById(id)
        const veterinarioBDD = await Veterinario.findById(_id)
        if(!veterinarioBDD) return res.status(404).json({ msg: `No existe el veterinario con ID ${id}` })
        //if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Debes llenar todos los campos"})
        if (veterinarioBDD.email !== email)
        {
            const emailExistente  = await Veterinario.findOne({email})
            if (emailExistente )
            {
                return res.status(404).json({msg:`El email ya se encuentra registrado`})  
            }
        }
        veterinarioBDD.nombre = nombre ?? veterinarioBDD.nombre
        veterinarioBDD.apellido = apellido ?? veterinarioBDD.apellido
        veterinarioBDD.direccion = direccion ?? veterinarioBDD.direccion
        veterinarioBDD.celular = celular ?? veterinarioBDD.celular
        veterinarioBDD.email = email ?? veterinarioBDD.email
        await veterinarioBDD.save()
        res.status(200).json(veterinarioBDD)
        
    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}

export {
    registro,
    confirmarMail,
    recuperarPassword,
    comprobarTokenPasword,
    crearNuevoPassword,
    login,
    perfil,
    actualizarPassword,
    actualizarPerfil
}
