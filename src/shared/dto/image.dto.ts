import { Image } from '../entities/image.entity';

export class CreateImageDto {
  id: number;
  originalname: string;
  mimetype: string;
  path: string;
  size: number;
  userId: number;
}

export class ResponseImageDto {
  id: number;
  originalname: string;
  mimetype: string;
  path: string;
  size: number;
  userId: number;
  uploadedAt: Date;

  constructor(image: Image) {
    this.id = image.id;
    this.originalname = image.originalname;
    this.mimetype = image.mimetype;
    this.path = image.path;
    this.size = image.size;
    this.uploadedAt = image.uploadedAt;
  }
}
