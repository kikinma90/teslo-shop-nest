import {v4 as uuid} from 'uuid'

export const fileNamer = (req: Express.Request, file: Express.Multer.File, callback: Function) => {

    if (!file) return callback(new Error('File is empty'), false);

    const fileExtension = file.mimetype.split('/')[1];

    const fileName = `${uuid()}.${fileExtension}`;

    // callback es la funcion que se ejecuta cuando ya tenemos el nombre del fichero
    // null es el error, si no hay error ponemos null
    // file.originalname es el nombre original del fichero
    // file.fieldname es el nombre del campo del fichero
    // file.mimetype es el tipo de fichero
    // Date.now() es la fecha de ahora
    callback(null, fileName);

} 