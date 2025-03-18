## Project setup

```bash
$ pnpm install
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

# 切换自己的
```shell
NODE_ENV=development
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DB=blog
MYSQL_USER=root
MYSQL_PASSWORD=mysql_password
# JWT
JWT_SECRET=45425dd717ea15bbd59f48072f06eb0de7cad0b9a0958e5c9e49181b32d15134
JWT_EXPIRES_IN=3600s
# session
SESSION_SECRET=nestjsSession2003322!@!
SESSION_COOKIE_MAXAGE=300000
# redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```
