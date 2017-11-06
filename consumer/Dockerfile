FROM node

RUN mkdir -p /application
WORKDIR /application
COPY . /application

RUN npm install --production

CMD ["npm", "run", "start"]

EXPOSE 15002
