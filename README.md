- nestjs
- typescript
- nest-cli
- mysql2
- socket.io
- typeorm

## 安装依赖

```bash
$ pnpm install
```

## 编译并运行项目

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## 目录介绍

```shell
/src
  |- /api             # 所有的controller
  |- /config          # 一些配置
  |- /notification    # 消息通知相关实体，网关
  |- /shared          # 非消息通知所有的entity，dto，service等
  |- /types           #
  │- app.module.ts    # app入口
  │- main.ts          # 启动文件
.env.development      # 开发环境变量
.env.production       # 生产环境变量
```

# 切换自己的

```shell
# nest app
PORT=3000
# mysql
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DB=blog
MYSQL_USER=root
MYSQL_PASSWORD=mysql_password
# JWT
JWT_SECRET=keykeykey
JWT_EXPIRES_IN=3600s
# session
SESSION_SECRET=keykeykey
SESSION_COOKIE_MAXAGE=300000
# redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
# 文件上传配置
UPLOAD_IP=localhost
UPLOAD_PORT=3000
```
