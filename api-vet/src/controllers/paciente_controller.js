import Paciente from "../models/Paciente.js"

const registrarPaciente = async(req,res)=>{
    try {
        //res.status(200).json({msg:"Registro exitoso de la mascota"})

        //Paso 1 Obtener datos
        const {emailPropietario} = req.body


        //Paso 2 Validar
            //campos vacios
        if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Debes llenar todos los campos"})

            //consulta base de datos paa ver usuario registrado
        const emailExistente = await Paciente.findOne({emailPropietario})
        if(emailExistente) return res.status(400).json({msg:"El email ya se encuentra registrado"})
  

        //Paso 3 Logica
            //crear contraseña temporal para el usuario
              const password = Math.random().toString(36).toUpperCase().slice(2, 5)

            //guardar datos del usuario 
            //registro de un nuevo propietario 
        const nuevoPaciente = new Paciente({
            ...req.body,//parametrso rest 
            //encripta el password
            passwordPropietario: await Paciente.prototype.encryptPassword("VET"+password),
            //relaciona el veterinario que esta registrando al paciente 
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


export{
    registrarPaciente
}