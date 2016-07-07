var http = require('http');
var fs = require('fs');

var server = http.createServer(function(request, response) {
  console.log(request.headers);

  var method = request.method;

  var uriRequest = request.url;
  if (uriRequest == '/'){
    uriRequest = '/index.html';
  }

  var dataBuffer = '';
  request.on('data', function (data) {
    console.log(data);
    dataBuffer += data;
  });

  request.on('end', function () {
    if (method ==='POST'){
      console.log(dataBuffer);
    }
  });

});

server.listen(8080);