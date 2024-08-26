import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import * as multer from 'multer';
import * as path from 'path';

// Configure multer to store files locally
export const multerConfig: MulterOptions = {
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './uploads/avatars'); // Folder where avatars will be stored
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now()}${ext}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.match(/image\/*/)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
};
