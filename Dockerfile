# 使用轻量的 Node.js 16 Alpine 镜像
FROM node:16-alpine

# 设置工作目录
WORKDIR /usr/src/app

# 复制 package.json 和 package-lock.json 到容器的工作目录
COPY package*.json ./

# 安装项目依赖
RUN npm install

# 复制其他源文件到容器
COPY . .

# 暴露端口
EXPOSE 3000

# 运行命令
CMD [ "node", "app.js" ]
