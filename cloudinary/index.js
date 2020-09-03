const cloudinary = require('cloudinary').v2; //from docs
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CL_KEY,
    api_secret: process.env.CL_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'CinciFood',
        allowedFormats: ['jpeg', 'png', 'jpg']
    }
});

module.exports = {
    cloudinary,
    storage
}