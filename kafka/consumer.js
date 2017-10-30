const debug = require('debug');
const { HighLevelConsumer, Client } = require('kafka-node');
const tweetSchema = require('./tweet.schema');

const dLog = debug('log');
const dError = debug('error');

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

consumer.on('message', message => {
  const buf = Buffer.from(message.value, 'binary');
  const decodedMessage = tweetSchema.fromBuffer(buf.slice(0));
  dLog(decodedMessage);
});

consumer.on('error', err => {
  dError('error', err);
});

process.on('SIGINT', () => {
  consumer.close(true, () => {
    process.exit();
  });
});
