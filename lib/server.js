
var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var fs = require('fs');
var handlers = require('./handlers');
var helpers = require('./helpers');
var path = require('path');


var server = {};

server.httpServer = http.createServer(function (req, res) {
    server.unifiedserver(req, res)
});

server.httpsServerOptions = {
    'key': fs.readFileSync(path.join(__dirname, '../https/key.pem')),
    'cert': fs.readFileSync(path.join(__dirname, '../https/cert.pem'))
}

server.httpsServer = https.createServer(server.httpsServerOptions, function (req, res) {
    server.unifiedserver(req, res)
});



server.unifiedserver = function (req, res) {
    var parsedUrl = url.parse(req.url, true);

    var path = parsedUrl.pathname;

    var trimmedPath = path.replace(/^\/*|\/*$/g, '');

    var queryStringObject = parsedUrl.query

    var method = req.method.toLowerCase();

    var headers = req.headers;

    var decoder = new StringDecoder('utf-8');
    var buffer = '';
    req.on('data', function (data) {
        //turn data to string
        buffer += decoder.write(data)
    })
    req.on('end', function () {
        buffer += decoder.end();
        console.log(server.router[trimmedPath], 'server router trimeed path session')
        var chosenHandler = typeof (server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;

        var data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': helpers.parseJsonToObject(buffer)
        };


        chosenHandler(data, function (statusCode, payload) {

            statusCode = typeof (statusCode) == 'number' ? statusCode : 200;

            payload = typeof (payload) == 'object' ? payload : {};

            var payloadString = JSON.stringify(payload);

            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);


        })
    })
}

server.router = {
    'ping': handlers.ping,
    'users': handlers.users,
    'tokens': handlers.tokens,
    'checks': handlers.checks
}

server.init = function () {
    server.httpServer.listen(config.httpPort, function () {
        console.log("The server is listening on port " + config.httpPort + " now " + config.envName + " mode")
    })

    server.httpsServer.listen(config.httpsPort, function () {
        console.log("The server is listening on port " + config.httpsPort + " now " + config.envName + " mode")
    })
}

module.exports = server;