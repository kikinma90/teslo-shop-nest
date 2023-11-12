

export const fileFilter = (req: Express.Request, file: Express.Multer.File, callback: Function) => {

    if (!file) return callback(new Error('File is empty'), false);

    // Solo aceptamos imagenes
    const fileExtension = file.mimetype.split('/')[1];
    const validExtensions = ['jpg', 'png', 'jpeg', 'gif'];

    if (!validExtensions.includes(fileExtension)) return callback(new Error('Invalid file extension'), false);

    callback(null, true);

} 