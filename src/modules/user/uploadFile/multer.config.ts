import * as multer from 'multer';
import * as path from 'path';

// Hàm tạo cấu hình multer động
export function createMulterOptions(destinationFolder: string) {
  return {
    storage: multer.diskStorage({
      destination: `./uploads/${destinationFolder}`, // Thư mục lưu trữ dựa trên tham số
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        callback(
          null,
          file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname),
        );
      },
    }),
    fileFilter: (req, file, callback) => {
      const filetypes = /jpeg|jpg|png/;
      const mimetype = filetypes.test(file.mimetype);
      const extname = filetypes.test(
        path.extname(file.originalname).toLowerCase(),
      );
      if (mimetype && extname) {
        return callback(null, true);
      }
      callback(new Error('Only images are allowed!'));
    },
  };
}
