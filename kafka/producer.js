const debug = require('debug');
const { HighLevelProducer, Client } = require('kafka-node');
const tweetSchema = require('./tweet.schema');

const dLog = debug('log');
const dError = debug('error');

const client = new Client('localhost:2181', 'tweet24app', {
  sessionTimeout: 300,
  spinDelay: 100,
  retries: 2
});

client.on('error', error => {
  dError(error);
});

const producer = new HighLevelProducer(client);

producer.on('ready', () => {
  const messageBuffer = tweetSchema.toBuffer({
    id: '3e0c63c4-2222',
    body: 'text-2222',
    latitude: 'latitude-2222',
    longitude: 'longitude-2222',
    timestamp: Date.now()
  });

  const payload = [
    {
      topic: 'tweet24',
      messages: messageBuffer,
      attributes: 1
    }
  ];

  producer.send(payload, (error, result) => {
    dLog('Sent payload to Kafka: ', payload);
    if (error) {
      dError(error);
    } else {
      dLog('result: ', result);
      process.exit();
    }
  });
});

producer.on('error', error => {
  dError(error);
});
