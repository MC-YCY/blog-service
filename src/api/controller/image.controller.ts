import {
  Controller,
  Post,
  Get,
  UseInterceptors,
  UploadedFiles,
  Query,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ImageService } from '../../shared/service/image.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Controller('images')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post('upload/:userId')
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      storage: diskStorage({
        destination: './uploads/images', // 本地存储目录
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
  async uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    console.log(files);
    return await this.imageService.uploadFiles(files, userId);
  }

  @Get(':userId')
  async findAll(
    @Param('userId') userId: number,
    @Query('pageNo') page = 1,
    @Query('pageSize') limit = 10,
    @Query('filename') filename?: string,
  ) {
    return await this.imageService.findAll({
      page: +page,
      limit: +limit,
      filename,
      userId: +userId,
    });
  }
}
