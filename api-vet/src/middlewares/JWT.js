import jwt from "jsonwebtoken" 
import Veterinario from "../models/Veterinario.js" 
import Paciente from "../models/Paciente.js" 
// CREA EL TOKEN DE ACCESO
//VERIFICA EL TOKEN DE ACCESO

/** 
 * Crear token JWT 
 * @param {string} id - ID del usuario 
 * @param {string} rol - Rol del usuario 
 * @returns {string} token - JWT 
 */ 


// funcion para crear token 
const crearTokenJWT = (id, rol) => { 
    // Genera un codigo  
    // Firma crea un jwt jasson web token recibe el id del usuario y el rol  
    // jw secret codigo que verifica el backend 
    // tiempo en el que xpira el codigo  
    return jwt.sign({ id, rol }, process.env.JWT_SECRET, { expiresIn: "1d" }) 
} 


// funcion para verificar token  
const verificarTokenJWT = async (req, res, next) => { 
    //Desde las cabeceras la variable authorization 
    const { authorization } = req.headers 
    // Validacion en le caso que no m envien el codigo  
    if (!authorization) return res.status(401).json({ msg: "Acceso denegado: token no proporcionado" }) 
    try { 
    //hacer la division entre el header token y el valor del token  
    //obtiene solo la parte del codigo  
        const token = authorization.split(" ")[1] 
    //desestructura el id y el rol y verifica taken con las claves  
        const { id, rol } = jwt.verify(token,process.env.JWT_SECRET) 

        //guarda el usuario que esta iniciando sesion 
        if (rol === "veterinario") { 
            //Metodo lean hace conversion de formato bson a json  
            //Metodo select. se usa para filtrar  y quitrar un dato sensible como password   
            const veterinarioBDD = await Veterinario.findById(id).lean().select("-password") 
            if (!veterinarioBDD) return res.status(401).json({ msg: "Usuario no encontrado" }) 

            // Con esto se sabe que usuario a ingresado  
            // en la peticon req se pone una nueva variable   

            req.veterinarioHeader = veterinarioBDD 
            // contienue  
            next() 
        } 
        //Aqui va la autenticacion basda en roles 
         else{ 
            const pacienteBDD = await Paciente.findById(id).lean().select("-password") 
            if (!pacienteBDD) return res.status(401).json({ msg: "Usuario no encontrado" }) 
            req.pacienteHeader = pacienteBDD 
            next() 
        } 

    } catch (error) { 
        console.log(error) 
        return res.status(401).json({ msg: `Token inválido o expirado - ${error}` }) 
    } 

} 


export {  
    crearTokenJWT, 
    verificarTokenJWT  
} 