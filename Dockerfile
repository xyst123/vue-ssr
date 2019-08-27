FROM node:8.11
COPY . /opt/web/vue-ssr
WORKDIR /opt/web/vue-ssr
RUN yarn config set registry http://10.10.74.103:4873
RUN yarn
RUN yarn global add pm2
RUN npm run build:prod
EXPOSE 3338
CMD npm run start:prod