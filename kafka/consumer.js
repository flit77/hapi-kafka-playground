const debug = require('debug');
const { HighLevelConsumer, Client, Offset, Consumer } = require('kafka-node');
const WebSocketServer = require('ws').Server;

const dLog = debug('log');
const dError = debug('error');
const TOPIC_NAME = 'tweet24_2';

const wss = new WebSocketServer({ port: 8081 });

const client = new Client('localhost:2181');
const topics = [
  {
    topic: TOPIC_NAME
  }
];

const options = {
  autoCommit: true,
  fetchMaxWaitMs: 1000,
  fetchMaxBytes: 1024 * 1024,
  encoding: 'buffer'
};
const consumer = new HighLevelConsumer(client, topics, options);

const kafkaOffset = new Offset(client);
kafkaOffset.fetch(
  [
    {
      topic: TOPIC_NAME,
      // time: Date.now() - 1000 * 60 * 60 * 24,
      // time: -1,
      // time: Date.now() - 1000 * 10, // 10 secs
      time: Date.now() - 1000 * 60 * 5, // 5 mins
      // time: Date.now(),
      partition: 0,
      maxNum: 1
    }
  ],
  (err, data) => {
    dLog('Fetched offset data: ', data);

    const kafkaConsumer = new Consumer(
      client,
      [{ topic: TOPIC_NAME, offset: data[TOPIC_NAME]['0'][0] }],
      {
        autoCommit: false,
        fromOffset: 'latest' // makes me consume only the latest records in the offset
      }
    );

    // consumer.setOffset(TOPIC_NAME, 0, 223179);

    kafkaConsumer.on('message', message => {
      if (message && message.topic === TOPIC_NAME) {
        try {
          const decodedMessage = JSON.parse(message.value);
          decodedMessage.datetime = new Date(decodedMessage.timestamp);
          dLog('Message received: ');
          // dLog(decodedMessage);
          dLog(message);
          dLog(decodedMessage.datetime);
        } catch (error) {
          // dError(message);
          dError('Error', error);
        }
      }
    });

    kafkaConsumer.on('error', consumerErr => dError(consumerErr));

    kafkaConsumer.on('offsetOutOfRange', consumerErr => dError(consumerErr));
  }
);

// wss.on('connection', ws => {
//   dLog('ws connection opened');
//   consumer.on('message', message => {
//     dLog('kafka message received');
//     const buf = Buffer.from(message.value, 'binary');
//     const decodedMessage = tweetSchema.fromBuffer(buf.slice(0));
//     dLog(decodedMessage);
//     dLog('websocket connection open');
//     if (ws.readyState === ws.OPEN) {
//       ws.send(JSON.stringify(decodedMessage));
//     }
//   });
// });

// consumer.on('error', err => {
//   dError('error', err);
// });

process.on('SIGINT', () => {
  consumer.close(true, () => {
    process.exit();
  });
});
