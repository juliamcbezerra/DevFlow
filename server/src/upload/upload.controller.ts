import { 
  Controller, 
  Post, 
  Put,
  Delete,
  Param,
  UploadedFile, 
  UseInterceptors, 
  BadRequestException 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { 
  ApiBody, 
  ApiConsumes, 
  ApiOperation, 
  ApiTags, 
  ApiQuery, 
  ApiParam,
  ApiResponse,
  ApiOkResponse,
  ApiBadRequestResponse
} from '@nestjs/swagger';
import multerConfig from '../../multer-config'; //
import type { FileS3 } from './file-s3.interface';
import { S3Service } from './s3.service';

@ApiTags('Upload de Arquivos')
@Controller('uploads')
export class UploadController {
  constructor(private readonly s3Service: S3Service) {}

  @Post(':folder')
  @ApiOperation({ 
    summary: 'Upload de arquivo para S3',
    description: 'Faz upload de um arquivo para o bucket S3 em uma pasta específica. Retorna a URL pública e a chave do arquivo.'
  })
  @ApiParam({ 
    name: 'folder', 
    enum: ['profile-pictures', 'user-banners', 'project-images', 'project-banners', 'posts', 'comments', 'message-images'],
    description: 'Pasta de destino no S3',
    example: 'posts'
  })
  @ApiQuery({ 
    name: 'objectId', 
    required: false, 
    description: 'ID do post ou projeto para organizar arquivos em subpastas',
    example: 'clh7x9j8z0000qhxt5z5z5z5z'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Arquivo a ser enviado',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo de imagem (PNG, JPG, GIF, WebP)'
        },
      },
      required: ['file']
    },
  })
  @ApiOkResponse({
    description: 'Upload realizado com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Upload realizado com sucesso'
        },
        url: {
          type: 'string',
          example: 'https://bucket-name.s3.us-east-1.amazonaws.com/posts/uuid-123.jpg',
          description: 'URL pública do arquivo no S3'
        },
        key: {
          type: 'string',
          example: 'posts/uuid-123.jpg',
          description: 'Chave/caminho do arquivo no S3'
        }
      }
    }
  })
  @ApiBadRequestResponse({
    description: 'Erro no upload',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Nenhum arquivo enviado.' },
        error: { type: 'string', example: 'Bad Request' }
      }
    }
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

  @Delete('file/:fileKey')
  @ApiOperation({ 
    summary: 'Remove arquivo do S3 por chave',
    description: 'Remove um arquivo do bucket S3 usando sua chave/caminho. A chave é o caminho completo do arquivo no S3.'
  })
  @ApiParam({ 
    name: 'fileKey', 
    description: 'Chave/caminho do arquivo no S3',
    example: 'posts/uuid-123.jpg'
  })
  @ApiOkResponse({
    description: 'Arquivo removido com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Arquivo removido com sucesso'
        },
        deletedKey: {
          type: 'string',
          example: 'posts/uuid-123.jpg',
          description: 'Chave do arquivo que foi removido'
        }
      }
    }
  })
  @ApiBadRequestResponse({
    description: 'Erro ao deletar arquivo',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Erro ao deletar arquivo: Access Denied' },
        error: { type: 'string', example: 'Bad Request' }
      }
    }
  })
  async deleteFile(@Param('fileKey') fileKey: string) {
    try {
      await this.s3Service.deleteFile(fileKey);
      
      return {
        message: 'Arquivo removido com sucesso',
        deletedKey: fileKey
      };
    } catch (error) {
      throw new BadRequestException(`Erro ao deletar arquivo: ${error.message}`);
    }
  }

  @Put('replace/:oldFileKey/:folder')
  @ApiOperation({ 
    summary: 'Substitui arquivo existente no S3',
    description: 'Remove o arquivo antigo e faz upload de um novo arquivo no seu lugar. Útil para atualizar avatares, banners, etc.'
  })
  @ApiParam({ 
    name: 'oldFileKey', 
    description: 'Chave/caminho do arquivo atual a ser substituído',
    example: 'posts/old-uuid-123.jpg'
  })
  @ApiParam({ 
    name: 'folder', 
    enum: ['profile-pictures', 'user-banners', 'project-images', 'project-banners', 'posts', 'comments', 'message-images'],
    description: 'Pasta de destino para o novo arquivo',
    example: 'posts'
  })
  @ApiQuery({ 
    name: 'objectId', 
    required: false, 
    description: 'ID do post ou projeto para organizar arquivos em subpastas',
    example: 'clh7x9j8z0000qhxt5z5z5z5z'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Novo arquivo a ser enviado',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Novo arquivo de imagem (PNG, JPG, GIF, WebP)'
        },
      },
      required: ['file']
    },
  })
  @ApiOkResponse({
    description: 'Arquivo substituído com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Arquivo substituído com sucesso'
        },
        oldKey: {
          type: 'string',
          example: 'posts/old-uuid-123.jpg',
          description: 'Chave do arquivo antigo que foi removido'
        },
        newUrl: {
          type: 'string',
          example: 'https://bucket-name.s3.us-east-1.amazonaws.com/posts/new-uuid-456.jpg',
          description: 'URL pública do novo arquivo'
        },
        newKey: {
          type: 'string',
          example: 'posts/new-uuid-456.jpg',
          description: 'Chave do novo arquivo'
        }
      }
    }
  })
  @ApiBadRequestResponse({
    description: 'Erro ao substituir arquivo',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Nenhum arquivo enviado.' },
        error: { type: 'string', example: 'Bad Request' }
      }
    }
  })
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async replaceFile(
    @Param('oldFileKey') oldFileKey: string,
    @Param('folder') folder: string,
    @UploadedFile() newFile: FileS3
  ) {
    if (!newFile) {
      throw new BadRequestException('Nenhum arquivo enviado.');
    }

    try {
      // 1. Primeiro faz upload do novo arquivo
      const newFileData = {
        message: 'Upload realizado com sucesso',
        url: newFile.location,
        key: newFile.key
      };

      // 2. Depois remove o arquivo antigo (se existir)
      try {
        await this.s3Service.deleteFile(oldFileKey);
      } catch (deleteError) {
        // Se não conseguir deletar o arquivo antigo, apenas avisa mas não falha
        console.warn(`Aviso: Não foi possível deletar arquivo antigo ${oldFileKey}:`, deleteError.message);
      }

      return {
        message: 'Arquivo substituído com sucesso',
        oldKey: oldFileKey,
        newUrl: newFileData.url,
        newKey: newFileData.key
      };
    } catch (error) {
      throw new BadRequestException(`Erro ao substituir arquivo: ${error.message}`);
    }
  }
}