import test from 'ava';
import sinon from 'sinon';
import server from './index';

const requestDefaults = {
  method: 'POST',
  url: '/tweet/add',
  payload: {}
};

test('endpoint test | POST /tweet/add | empty payload -> 400 Bad Request', t => {
  const request = Object.assign({}, requestDefaults);

  return server.inject(request).then(response => {
    t.is(response.statusCode, 400, 'status code is 400');
  });
});

test('endpoint test | POST /tweet/add | invalid tweet param -> 400 Bad Request', t => {
  const request = Object.assign({}, requestDefaults, {
    payload: {
      latitude: 55.5,
      longitude: 77.7
    }
  });

  return server.inject(request).then(response => {
    t.is(response.statusCode, 400, 'status code is 400');
  });
});

test('endpoint test | POST /subscribe | valid tweet param -> 200 OK', t => {
  const request = Object.assign({}, requestDefaults, {
    payload: {
      tweet: 'some tweet',
      latitude: 55.5,
      longitude: 77.7
    }
  });

  const producer = {
    send: sinon.stub().callsArg(1)
  };

  const callback = sinon.spy();

  return server.inject(request).then(response => {
    producer.send({}, callback);
    t.true(callback.called, 'Send request to kafka called');
  });
});
