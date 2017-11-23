const Hapi = require('hapi');
const debug = require('debug');
const { HighLevelProducer, Client } = require('kafka-node');
const uuidv4 = require('uuid/v4');

require('dotenv').config();

const dLog = debug('log');
const dError = debug('error');

const server = new Hapi.Server();
server.connection({
  host: process.env.HAPI_SERVER_HOST,
  port: process.env.HAPI_SERVER_PORT
});

const client = new Client(process.env.KAFKA_CLIENT_URI, 'tweet24app', {
  sessionTimeout: 300,
  spinDelay: 100,
  retries: 2
});

client.on('error', error => {
  dError(error);
});

const producer = new HighLevelProducer(client);

producer.on('error', error => {
  dError('Kafka producer error: ', error);
});

server.route({
  method: ['GET'],
  path: '/',
  handler: (request, reply) => {
    reply(
      'This is basic demo of tweet24 app. To post a tweet please send POST reqeust to /tweet/add endpoint.'
    );
  }
});

server.route({
  method: ['PUT', 'POST'],
  path: '/tweet/add',
  handler: (request, reply) => {
    const { tweet, latitude, longitude } = request.payload;

    if (!tweet || !tweet.length) {
      const errorMessage = 'tweet param missed';
      dError(errorMessage);
      return reply({
        error: errorMessage
      }).code(400);
    }

    dLog('request.params: ', request.payload);

    const messageBuffer = JSON.stringify({
      id: uuidv4(),
      body: tweet,
      latitude,
      longitude,
      timestamp: Date.now()
    });

    const payload = [
      {
        topic: process.env.TOPIC_NAME,
        messages: messageBuffer,
        attributes: 1
      }
    ];

    return producer.send(payload, (error, result) => {
      dLog('Sent payload to Kafka: ', payload);
      if (error) {
        dError(error);

        return reply({
          error: 'Server Error, please contact administrator'
        }).code(400);
      }
      dLog('result: ', result);
      return reply({
        success: 'Tweet added'
      });
    });
  }
});

// Start the server
if (!module.parent) {
  server.start(err => {
    if (err) {
      throw err;
    }
    dLog('Server running at:', server.info.uri);
  });
}

module.exports = server;
