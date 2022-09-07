FROM node:17-slim

WORKDIR /node

COPY package.json .

RUN npm install 

COPY . .

CMD ["npm", "run", "start"]

EXPOSE 5000