export interface FileS3 extends Express.Multer.File {
  location: string;
  key: string;
  bucket: string;
}