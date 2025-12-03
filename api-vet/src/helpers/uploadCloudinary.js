import { v2 as cloudinary } from 'cloudinary'
import fs from "fs-extra" //para cargar los archivos


// Subir archivos a Cloudinary
//Funcion necesita el path de la imagen y  la carpeta pacientes

const subirImagenCloudinary = async (filePath, folder = "Pacientes") => {

    const { secure_url, public_id } = await cloudinary.uploader.upload(filePath, { folder })
    //elimina la imagen para que la imagen no permanesca en el back
    await fs.unlink(filePath)
    return { secure_url, public_id }

}

// Subir Base64 a Cloudinary
const subirBase64Cloudinary = async (base64, folder = "Pacientes") => {

    // data:image/png;base64,iVBORw0KGgjbjgfyvh
    // iVBORw0KGgjbjgfyvh
    //quita lo que no necesita 
    const buffer = Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ''), 'base64')
    // iVBORw0KGgjbjgfyvh  -  010101010101010101
    // convierte a 0 y 1
    //retorna la url 
    const { secure_url } = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder, resource_type: 'auto' }, (err, res) => {
        if (err) reject(err);
        else resolve(res);
    })

        stream.end(buffer)
    })
    return secure_url
}


export {
    subirImagenCloudinary,
    subirBase64Cloudinary
}