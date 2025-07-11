import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { Public } from '../../shared/decorators/public.decorator';

@Controller('upload')
export class UploadController {
  @Public()
  @Post('localhost')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/avatars/', // 本地存储目录
        filename: (req, file, callback) => {
          // 生成唯一文件名
          const fileExtension = extname(file.originalname);
          callback(null, `${uuidv4()}${fileExtension}`);
        },
      }),
      limits: {
        fileSize: 1024 * 1024, // 限制文件最大1MB,
      },
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return { message: '没有上传文件' };
    }

    // 返回文件的相对路径
    return { fileUrl: `/uploads/avatars/${file.filename}` };
  }
}
