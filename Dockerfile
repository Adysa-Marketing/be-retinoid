FROM node:16
WORKDIR /usr/src/app
ENV TZ=Asia/Jakarta
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
COPY package*.json ./
COPY . .
RUN npm install
EXPOSE 4000
CMD ["node", "index.js"]