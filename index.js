
var http = require('http');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;

var server = http.createServer(function (req, res) {

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

        var chosenHandler = router[trimmedPath] === undefined ? handlers.notFound : router[trimmedPath];

        var data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': buffer
        };

        chosenHandler(data, function (statusCode, payload) {

            statusCode = typeof (statusCode) == 'number' ? statusCode : 200;

            payload = typeof (payload) == 'object' ? payload : {};

            var payloadString = JSON.stringify(payload);

            res.writeHead(statusCode);
            res.end(payloadString);

            console.log('Returning this response', statusCode, payloadString)

        })
    })
});

server.listen(5000, function () {
    console.log("The server is listening on port 5000 now")
})

var handlers = {};

handlers.sample = function (data, callback) {
    callback(406, { 'name': 'sample handler' })
}

handlers.notFound = function (data, callback) {
    callback(404)
}

var router = {
    'sample': handlers.sample
}