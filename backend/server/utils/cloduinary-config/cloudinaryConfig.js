import { CloudinaryStorage } from 'multer-storage-cloudinary'
import cloudinary from './config.js';


const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "chat-user-profiles",
        format: async (req, file) => 'jpg',
        public_id: (req, file) => {
            const name = file.originalname.split('.')[0]; 
            return `${name}-${Date.now()}`;
        }
    }
})

export default storage