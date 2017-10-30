const avro = require('avsc');

const avroSchema = {
  name: 'tweet',
  type: 'record',
  fields: [
    {
      name: 'id',
      type: 'string'
    },
    {
      name: 'body',
      type: 'string'
    },
    {
      name: 'latitude',
      type: 'string'
    },
    {
      name: 'longitude',
      type: 'string'
    },
    {
      name: 'timestamp',
      type: 'double'
    }
  ]
};

module.exports = avro.parse(avroSchema);
