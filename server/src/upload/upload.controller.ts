import { 
  Controller, 
  Post, 
  UploadedFile, 
  UseInterceptors, 
  BadRequestException 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags, ApiQuery, ApiParam } from '@nestjs/swagger';
import multerConfig from '../../multer-config'; //
import type { FileS3 } from './file-s3.interface';

@Controller('uploads')
export class UploadController {
  @Post(':folder')
  @ApiOperation({ summary: 'Faz upload de um arquivo e retorna a URL do S3' })
  @ApiParam({ name: 'folder', enum: ['pfp', 'banners', 'project', 'posts'] })
  @ApiQuery({ name: 'objectId', required: false, description: 'ID do post ou projeto (opcional)' })
  @ApiConsumes('multipart/form-data') // Importante para o Swagger funcionar com arquivos
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', multerConfig))
  uploadFile(@UploadedFile() file: FileS3) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado.');
    }

    return {
      message: 'Upload realizado com sucesso',
      url: file.location, // URL 
      key: file.key       // Nome do arquivo 
    };
  }
}