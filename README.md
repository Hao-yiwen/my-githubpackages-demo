# my-githubpackages-demo

[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D16.20.1-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB Driver](https://img.shields.io/badge/MongoDB%20driver-6.x-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/docs/drivers/node/current/)
[![License](https://img.shields.io/badge/license-ISC-blue)](./package.json)

一个用 Express 写的小型示例服务：把用户文档写入本机 MongoDB，并提供查询接口。仓库里还有一份 Dockerfile，镜像只启动这个 Node 进程。

`package.json` 的 `description` 为空。`license` 字段是 `ISC`，仓库中没有单独的 `LICENSE` 文件。

## 现有接口

进程监听 **3000** 端口。连接信息写在 `config.json`：

| 配置项 | 当前值 |
| --- | --- |
| `mongodb.url` | `mongodb://localhost:27017/` |
| `mongodb.dbName` | `mydb` |
| 集合 | `users`（在 `app.js` 中写死） |

| 方法 | 路径 | 行为 |
| --- | --- | --- |
| `GET` | `/` | 返回纯文本 `Hello, World!`。不访问数据库。 |
| `POST` | `/add` | 读取 JSON 体中的 `name`、`age`，插入 `users`，并把驱动的插入结果以 JSON 返回。 |
| `GET` | `/users` | 返回 `users` 集合中的全部文档。 |
| `GET` | `/users/age` | 返回 `age` 大于 25 的文档。函数会从查询字符串读出 `age`，过滤条件固定为 `{ age: { $gt: 25 } }`。 |

`POST /add` 的请求体：

```json
{ "name": "Ada", "age": 30 }
```

数据库相关的三个接口在 `catch` 中只执行 `console.log(err)`，没有把状态码或错误正文写回响应。MongoDB 未监听 27017 时，客户端会等到驱动选服务器失败；失败后终端出现 `MongoServerSelectionError`，HTTP 连接仍然没有响应体。

`app.js` 创建客户端时传入了 `useUnifiedTopology: true`。Node.js 驱动从 4.0.0 起忽略该选项，进程启动后访问数据库时会打印废弃警告。

`package.json` 的 `main` 指向 `index.js`，可执行入口是 `app.js`。`npm test` 仍是初始化项目时的默认脚本：打印 `Error: no test specified`，退出码为 1。

## 技术栈与依赖

| 项目 | 说明 |
| --- | --- |
| Node.js | 仓库未声明 `engines`。`Dockerfile` 使用 `node:16-alpine`。按 `mongodb@^6.3.0` 安装到的 6.22.0 要求 Node.js `>=16.20.1`。 |
| Express | 声明 `^4.18.2`。2026-11-17 在本环境执行 `npm install` 后解析为 **4.22.3**。 |
| MongoDB Node.js 驱动 | 声明 `^6.3.0`，同一次安装解析为 **6.22.0**。 |
| MongoDB 服务端 | 代码只写了连接串，没有限定服务端版本。 |
| npm | `.gitignore` 忽略 `node_modules` 和 `package-lock.json`，小版本会落在上述范围内，随安装时间变化。 |

## 目录

```text
.
├── app.js          # 路由、MongoClient 和四个接口
├── config.json     # MongoDB 地址与库名
├── Dockerfile      # 基于 node:16-alpine 安装依赖并运行 node app.js
├── package.json    # 名称、依赖、ISC 许可和默认 test 脚本
└── .gitignore      # node_modules、package-lock.json
```

仓库里没有前端、测试、CI 配置和截图。

## 环境

- Node.js 16.20.1 或更新版本。本机直接运行可以使用 Node.js 18、20 或 22；按 Dockerfile 构建时基础镜像是 Node 16 Alpine。
- 调用 `/add`、`/users`、`/users/age` 前，本机 27017 端口上要有 MongoDB。只请求 `GET /` 时可以不启动数据库。
- 构建镜像需要 Docker。镜像内没有 MongoDB。

## 安装与运行

```bash
npm install
node app.js
```

日志出现 `Server is running on http://localhost:3000` 后：

```bash
curl http://127.0.0.1:3000/
```

成功时正文是 `Hello, World!`。

MongoDB 已经接受 `mongodb://localhost:27017/` 时，可以继续调用：

```bash
curl -sS -H 'Content-Type: application/json' \
  -d '{"name":"Ada","age":30}' \
  http://127.0.0.1:3000/add

curl -sS http://127.0.0.1:3000/users

curl -sS 'http://127.0.0.1:3000/users/age'
```

更换数据库时，修改 `config.json` 里的 `mongodb.url`、`mongodb.dbName`，再重新执行 `node app.js`。

## Docker

Dockerfile 以 `node:16-alpine` 为基底，工作目录 `/usr/src/app`，复制 `package*.json` 后执行 `npm install`，再复制其余源文件，暴露 3000，启动命令为 `node app.js`。

```bash
docker build -t my-githubpackages-demo .
docker run --rm -p 3000:3000 my-githubpackages-demo
```

镜像里的 `config.json` 仍指向 `localhost:27017`。容器网络中的 `localhost` 是容器自己，到不了宿主机上的 MongoDB。在 Linux 上若要沿用这份配置、连宿主机的 27017，可以使用主机网络：

```bash
docker run --rm --network host my-githubpackages-demo
```

另一种做法是在构建前改好 `config.json`，或运行时把配置文件挂载到 `/usr/src/app/config.json`。

## 本环境已核对的步骤

核对时的运行时为 Node.js **v22.23.4**、npm **10.9.9**。

| 步骤 | 结果 |
| --- | --- |
| `npm install` | 成功，Express 4.22.3，MongoDB 驱动 6.22.0 |
| `node app.js` | 进程监听 3000；随后访问数据库接口时打印 `useUnifiedTopology` 废弃警告 |
| `GET /` | `200`，正文 `Hello, World!` |
| `POST /add`、`GET /users`、`GET /users/age` | 本机没有 `mongod`。请求在 8 秒内没有响应体；服务端随后记录 `MongoServerSelectionError: connect ECONNREFUSED`（`127.0.0.1:27017` 与 `::1:27017`） |
| `npm test` | 退出码 1，输出 `Error: no test specified` |
| `docker build` / `docker run` | 本环境没有 Docker，未执行 |
| 有数据库时的写入与查询 | 未验证 |

## 参考

- [Express 4 API](https://expressjs.com/en/4x/api.html)
- [MongoDB Node.js Driver](https://www.mongodb.com/docs/drivers/node/current/)
