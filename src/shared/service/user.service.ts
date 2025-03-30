import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto, PaginationDto, UpdateUserDto } from '../dto/user.dto';
import * as bcrypt from 'bcryptjs';
import { Role } from '../entities/role.entity';
import { UserVo } from '../vo/user.vo';
import { Article } from '../entities/article.entity';
import { Favorite } from '../entities/favorite.entity';

interface PostgreSQLError extends Error {
  code: string;
  detail?: string;
  table?: string;
  constraint?: string;
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Role)
    private roleRepository: Repository<Role>,

    @InjectRepository(Article)
    private articleRepository: Repository<Article>,

    @InjectRepository(Favorite)
    private favoriteRepository: Repository<Favorite>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // 前置校验层
    await this.validateUserUniqueness(createUserDto);

    // 新增角色校验
    const role = await this.roleRepository.findOneBy({
      id: createUserDto.roleId,
    });
    if (!role) {
      throw new NotFoundException(`角色ID ${createUserDto.roleId} 不存在`);
    }

    try {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      // 创建用户实体时关联角色
      const user = this.userRepository.create({
        ...createUserDto,
        password: hashedPassword,
        role: role, // 直接关联角色实体
      });

      return await this.userRepository.save(user);
    } catch (error) {
      // 数据库约束校验层
      this.handleDatabaseError(error);
    }
  }

  private async validateUserUniqueness(dto: CreateUserDto): Promise<void> {
    const [existingByAccount, existingByUsername] = await Promise.all([
      this.findByAccount(dto.account),
      this.findByUsername(dto.username),
    ]);

    const errors: string[] = [];
    if (existingByAccount) errors.push('账号已存在');
    if (existingByUsername) errors.push('用户名已存在');

    if (errors.length > 0) {
      throw new BadRequestException(errors.join('，'));
    }
  }

  private handleDatabaseError(error: unknown): never {
    if (error instanceof QueryFailedError) {
      const pgError = error.driverError as PostgreSQLError;

      // 新增外键约束错误处理（角色不存在）
      if (pgError.code === '23503' && pgError.constraint?.includes('role_id')) {
        throw new ConflictException('关联的角色不存在');
      }

      // 处理唯一约束冲突
      if (pgError.code === '23505') {
        return this.handleUniqueViolation(pgError);
      }

      // 处理外键约束冲突
      if (pgError.code === '23503') {
        throw new ConflictException('关联数据不存在');
      }
    }

    // 兜底错误处理
    throw new InternalServerErrorException('系统内部错误,数据库操作失败');
  }

  private handleUniqueViolation(error: PostgreSQLError): never {
    // 安全访问detail属性
    const errorDetail = error.detail?.toLowerCase() ?? '';

    // 使用正则精确匹配字段
    const uniqueFieldMap: Record<string, string> = {
      account: '登录账号',
      username: '用户名',
      email: '邮箱',
      phone: '手机号',
    };

    // 匹配第一个命中的唯一字段
    const matchedField = Object.keys(uniqueFieldMap).find((field) =>
      new RegExp(`\\(${field}\\)`).test(errorDetail),
    );

    if (matchedField) {
      throw new ConflictException(`${uniqueFieldMap[matchedField]}已存在`);
    }
    // 未知唯一约束错误
    throw new ConflictException('数据唯一性冲突,未处理的唯一约束错误');
  }

  // 新增用户名查询方法
  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { username },
      withDeleted: true, // 包含软删除记录
    });
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ records: User[]; total: number }> {
    const [records, total] = await this.userRepository.findAndCount({
      relations: ['role'],
      skip: (page - 1) * limit,
      take: limit,
    });

    return { records, total };
  }

  async findOne(id: number): Promise<UserVo | null> {
    const result = await this.userRepository.findOne({
      where: { id },
      relations: ['role'],
    });
    if (!result) {
      throw new BadRequestException('用户不存在');
    }
    const userVo = new UserVo();
    userVo.signature = result.signature;
    userVo.account = result.account;
    userVo.username = result.username;
    userVo.role = result.role;
    userVo.avatar = result.avatar;
    userVo.id = result.id;
    return userVo;
  }

  async findByAccount(account: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { account },
      relations: ['role'],
    });
  }

  // 更新UserService中的update方法
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    try {
      // 处理角色更新
      if (updateUserDto.roleId !== undefined) {
        const newRole = await this.roleRepository.findOneBy({
          id: updateUserDto.roleId,
        });

        if (!newRole) {
          throw new NotFoundException(`角色ID ${updateUserDto.roleId} 不存在`);
        }

        // 记录角色变更日志
        const oldRoleId = user.role?.id;
        user.changeLog += `\n[${new Date().toISOString()}] 角色变更: ${oldRoleId || '无'} → ${newRole.id}`;
        user.role = newRole;
      }

      // 更新其他字段
      if (updateUserDto.password) {
        user.password = await bcrypt.hash(updateUserDto.password, 10);
      }

      // 使用merge处理其他字段更新
      this.userRepository.merge(user, updateUserDto);

      return await this.userRepository.save(user);
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async remove(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  /**
   * 更新用户角色（带事务安全）
   * @param userId 用户ID
   * @param roleId 新角色ID
   * @returns 更新后的用户实体
   */
  async updateUserRole(userId: number, roleId: number): Promise<User> {
    // 验证用户存在性
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException(`用户 ID ${userId} 不存在`);
    }

    // 验证角色有效性
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      // 可添加更多过滤条件，例如：isActive: true
    });

    if (!role) {
      throw new NotFoundException(`角色 ID ${roleId} 无效`);
    }

    try {
      // 更新关联关系
      user.role = role;

      // 添加审计日志（可选）
      user.changeLog = `[${new Date().toISOString()}] 角色变更: ${user.role?.id} → ${roleId}`;

      return await this.userRepository.save(user);
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }
  async findOneById(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['role', 'images'], // 可选：加载关联数据
    });
  }

  // 获取用户关注的用户列表，支持分页查询
  async getFollowingUsers(userId: number, { page, limit }: PaginationDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['following'], // 加载 following 关联
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 手动分页（注意：此方法在大数据量时性能较低）
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedFollowing = user.following.slice(start, end);

    return {
      records: paginatedFollowing,
      total: user.following.length,
      page,
      limit,
      totalPages: Math.ceil(user.following.length / limit),
    };
  }

  // 分页获取用户 喜欢的文章
  async getLikedArticles(userId: number, { page, limit }: PaginationDto) {
    // 验证用户存在性
    const userExists = await this.userRepository.findOneBy({ id: userId });
    if (!userExists) throw new NotFoundException('用户不存在');

    // 构造分页查询
    const [articles, total] = await this.articleRepository
      .createQueryBuilder('article')
      .innerJoin(
        'user_liked_articles',
        'ula',
        'ula.article_id = article.id AND ula.user_id = :userId',
        { userId },
      )
      .orderBy('article.createdAt', 'DESC') // 按文章创建时间倒序
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      records: articles,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // 分页获取用户 收藏的文章
  async getFavoriteArticles(userId: number, { page, limit }: PaginationDto) {
    const userExists = await this.userRepository.findOneBy({ id: userId });
    if (!userExists) throw new NotFoundException('用户不存在');

    const [favorites, total] = await this.favoriteRepository
      .createQueryBuilder('favorite')
      .leftJoinAndSelect('favorite.article', 'article') // 关联文章实体
      .where('favorite.userId = :userId', { userId }) // ✅ 使用实体属性名 userId
      .orderBy('favorite.createdAt', 'DESC') // ✅ 使用实体属性名 createdAt
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    // 提取文章数据
    const articles = favorites.map((fav) => fav.article);

    return {
      records: articles,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
