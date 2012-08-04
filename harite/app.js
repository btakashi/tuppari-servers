var
  wss = require('./lib/wss'),
  Subscriber = require('./lib/subscriber'),
  env = require('../common/lib/env'),
  util = require('util'),
  url = require('url');

var debug = (env('NODE_ENV') !== 'production');

function eventLogger(eventType) {
  var args = Array.prototype.slice.call(arguments, 1);
  var d = new Date();
  var dateString = util.format('%s-%d-%sT%s:%s:%s.%s', d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds());
  console.log(dateString, eventType, args);
}

/*
 * WebSocket settings.
 */

var subscriber = new Subscriber();

var io = wss.listen(env('PORT'), function (server, hostName, port) {
  server.on('request', function (req, res) {
    var uri = url.parse(req.url);
    if (req.method === 'POST' && uri.pathname === '/receive') {
      subscriber.handleRequest(req, res);
    } else {
      res.writeHead(200, {
        'Content-Type': 'text/plain'
      });
      res.end('Welcome to tuppari push server.');
    }
  });

  eventLogger('serverStart', util.format('harite server (%s) listen on %d', hostName, port));
});

io.on('connection', function (socket) {
  socket.on('bind', function (applicationId, data) {
    socket.join(applicationId, data.channelName, data.eventName);
  });

  if (debug) {
    socket.on('log', eventLogger);
  }
});

/*
 * Redis settings.
 */

subscriber.on('error', function (err) {
  eventLogger('subscribe:error', err.stack);
});

subscriber.on('message', function (key, data) {
  io.broadcast(key, data);
});

if (debug) {
  io.on('log', eventLogger);
  subscriber.on('log', eventLogger);
}

process.on('uncaughtException', function (err) {
  eventLogger('uncaughtException', err.stack);
});