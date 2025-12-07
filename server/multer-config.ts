import multerS3 from 'multer-s3'; 
import { S3Client } from '@aws-sdk/client-s3';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const { BUCKET_REGION, AWS_ACCESS_KEY, AWS_SECRET_KEY, BUCKET_NAME } = process.env;

if (!BUCKET_REGION || !AWS_ACCESS_KEY || !AWS_SECRET_KEY || !BUCKET_NAME) {
  throw new Error('Faltam variáveis de ambiente para configuração do S3')
}

const s3Config = new S3Client({
  region: BUCKET_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_KEY,
  },
});

const ALLOWED_DIRECTORIES = {
  'profile-pictures': 'profile-pictures',
  'user-banners': 'user-banners',
  'project-images': 'project-images',
  'project-banners': 'project-banners',
  posts: 'posts',
  comments: 'comments',
  'message-images': 'message-images',
}

const multerConfig = {
    storage: multerS3({
    s3: s3Config,
    bucket: BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE, 
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req: any, file, cb) => {
      const folderType = req.params.folder;
      const objectId = req.query.objectId;

      if (!folderType || !ALLOWED_DIRECTORIES[folderType]) {
        return cb(new Error('Pasta de upload inválida')); 
      }

      const fileName = `${uuidv4()}${path.extname(file.originalname)}`;
      const baseFolder = ALLOWED_DIRECTORIES[folderType];
      let finalPath = `${baseFolder}/${fileName}`;

      if (folderType === 'posts' && objectId) {
        finalPath = `${baseFolder}/${objectId}/${fileName}`;
      }
      
      cb(null, finalPath);
    }
  })
}

export default multerConfig;