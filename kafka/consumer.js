const debug = require('debug');
const { Client, Consumer } = require('kafka-node');
const WebSocketServer = require('ws').Server;

const dLog = debug('log');
const dError = debug('error');
const TOPIC_NAME = 'tweet24_2';

const wss = new WebSocketServer({ port: 8081 });

const client = new Client('localhost:2181');

const kafkaConsumer = new Consumer(client, [{ topic: TOPIC_NAME, offset: 0 }], {
  autoCommit: false,
  fromOffset: 'latest' // makes me consume only the latest records in the offset
});

wss.on('connection', ws => {
  dLog('ws connection opened');
  kafkaConsumer.on('message', message => {
    dLog('kafka message received');
    const decodedMessage = JSON.parse(message.value);
    decodedMessage.datetime = new Date(decodedMessage.timestamp);
    dLog(decodedMessage);
    dLog('websocket connection open');
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(decodedMessage));
    }
  });
});

kafkaConsumer.on('error', consumerErr => dError(consumerErr));
kafkaConsumer.on('offsetOutOfRange', consumerErr => dError(consumerErr));

process.on('SIGINT', () => {
  kafkaConsumer.close(true, () => {
    process.exit();
  });
});
