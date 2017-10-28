const Hapi = require('hapi');
const debug = require('debug');

const dLog = debug('log');
const dError = debug('error');

// Create a server with a host and port
const server = new Hapi.Server();
server.connection({
  host: 'localhost',
  port: 8000
});

// Add the route
server.route({
  method: ['PUT', 'POST'],
  path: '/tweet/add',
  handler: (request, reply) => {
    const { tweet, latitude, longitude } = request.payload;
    if (!tweet) {
      const errorMessage = 'tweet param missed';
      dError(errorMessage);
      return reply({
        error: errorMessage
      }).code(400);
    }
    dLog('request.params: ', request.payload);
    return reply(
      `tweet add action: post action. tweet: ${tweet}, latitude: ${latitude}, longitude: ${longitude}`
    );
  }
});

// Start the server
server.start(err => {
  if (err) {
    throw err;
  }
  dLog('Server running at:', server.info.uri);
});
