FROM node:alpine
RUN mkdir -p /opt/app
WORKDIR /opt/app
COPY node_modules ./node_modules
COPY package.json ./
COPY build ./build
EXPOSE 3000
CMD [ "npm", "start"]