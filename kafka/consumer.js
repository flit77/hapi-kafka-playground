const debug = require('debug');
const { HighLevelConsumer, Client } = require('kafka-node');
const WebSocketServer = require('ws').Server;
const tweetSchema = require('./tweet.schema');

const dLog = debug('log');
const dError = debug('error');

const wss = new WebSocketServer({ port: 8081 });

const client = new Client('localhost:2181');
const topics = [
  {
    topic: 'tweet24'
  }
];

const options = {
  autoCommit: true,
  fetchMaxWaitMs: 1000,
  fetchMaxBytes: 1024 * 1024,
  encoding: 'buffer'
};
const consumer = new HighLevelConsumer(client, topics, options);

wss.on('connection', ws => {
  dLog('ws connection opened');
  consumer.on('message', message => {
    dLog('kafka message received');
    const buf = Buffer.from(message.value, 'binary');
    const decodedMessage = tweetSchema.fromBuffer(buf.slice(0));
    dLog(decodedMessage);
    dLog('websocket connection open');
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(decodedMessage));
    }
  });
});

consumer.on('error', err => {
  dError('error', err);
});

process.on('SIGINT', () => {
  consumer.close(true, () => {
    process.exit();
  });
});
