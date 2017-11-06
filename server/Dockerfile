FROM node

RUN mkdir -p /application
WORKDIR /application
COPY server.js /application

RUN npm install --production

CMD ["npm", "run", "start"]

EXPOSE 15001
