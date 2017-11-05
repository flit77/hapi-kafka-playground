const debug = require('debug');
const { Client, Consumer } = require('kafka-node');
const WebSocketServer = require('ws').Server;

require('dotenv').config();

const dLog = debug('log');
const dError = debug('error');

const POST_DELAY_MS = 1000 * 60 * 60 * 24;

const wss = new WebSocketServer({
  port: process.env.WEB_SOCKET_SERVER_PORT
});

wss.on('connection', ws => {
  dLog('ws connection opened');

  const client = new Client(process.env.KAFKA_CLIENT_URI);
  const kafkaConsumer = new Consumer(
    client,
    [{ topic: process.env.TOPIC_NAME, offset: 0 }],
    {
      autoCommit: false,
      fromOffset: 'latest'
    }
  );

  kafkaConsumer.on('message', message => {
    dLog('kafka message received');
    const decodedMessage = JSON.parse(message.value);
    decodedMessage.datetime = new Date(decodedMessage.timestamp);
    dLog(decodedMessage);

    const messageAge = Date.now() - decodedMessage.timestamp;
    const messageDelay =
      POST_DELAY_MS - messageAge > 0 ? POST_DELAY_MS - messageAge : 0;

    setTimeout(() => {
      dLog(`Posting a message to websocket`);
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify(decodedMessage));
      }
    }, messageDelay);
  });

  kafkaConsumer.on('error', consumerErr => dError(consumerErr));
  kafkaConsumer.on('offsetOutOfRange', consumerErr => dError(consumerErr));
});

process.on('SIGINT', () => {
  wss.close(() => {
    process.exit();
  });
});
