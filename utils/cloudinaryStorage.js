import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './claudinary.js';

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'museum-images',
        allowed_formats: ['jpg', 'png', 'jpeg'],
        public_id: (req, file) => Date.now() + '-' + file.originalname,
    },
});

export default storage;