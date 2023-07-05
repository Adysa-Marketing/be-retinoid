FROM node:16
WORKDIR //app
ENV TZ=Asia/Jakarta
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
COPY package*.json ./
COPY . //app
RUN npm install
EXPOSE 4000
CMD ["npm", "start"]