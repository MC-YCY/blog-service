import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto, UpdateUserDto } from '../dto/user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return await this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find({ relations: ['role'] });
  }

  async findOne(id: number): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id },
      relations: ['role'],
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User | null> {
    await this.userRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }
}
