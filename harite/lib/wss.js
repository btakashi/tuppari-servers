var
  http = require('http'),
  util = require('util'),
  url = require('url'),
  env = require('../../common/lib/env');

exports.Manager = require('./manager');

/**
 * Attaches a manager.
 *
 * @param {HTTPServer/Number} a HTTP server or a port number to listen on.
 * @param {Object} options to be passed to Manager and/or HTTP server.
 * @param {Function} callback if a port is supplied.
 */

exports.listen = function (port, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  if (typeof port === 'string') {
    port = parseInt(port);
  }

  var server,
      hostName = env('HOST_NAME'),
      wsUrl;

  if (options && options.key) {
    server = require('https').createServer(options);
    wsUrl = util.format('wss://%s:%d', hostName, port);
  } else {
    server = require('http').createServer();
    wsUrl = util.format('ws://%s:%d', hostName, port);
  }

  server.on('request', function (req, res) {
    var uri = url.parse(req.url);
    if (uri.pathname === '/endpoint') {
      res.writeHead(200, {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(wsUrl);
    }
  });

  server.listen(port, function () {
    callback(server, hostName, port)
  });

  return new exports.Manager(server, options);
};