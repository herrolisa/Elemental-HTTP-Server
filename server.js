var http = require('http');
var querystring = require('querystring');
var fs = require('fs');

var server = http.createServer(function (request, response) {
  var method = request.method;

  var uriRequest = request.url;
  if (uriRequest == '/'){
    uriRequest = '/index.html';
  }

  // fs.readFile('./public' + uriRequest, 'utf8', function (err, responseBody) {
  //   if (err) {
  //     uriRequest = '/404.html';
  //     fs.readFile('./public' + uriRequest, 'utf8', function (err, responseBody) {
  //       response.writeHead(404, {"Content-Type": "text/html"});
  //       response.end(responseBody.toString());
  //     });
  //   }else if (method === 'GET'){
  //     response.writeHead(200, {"Content-Type": "text/html"});
  //     response.end(responseBody.toString());
  //   }
  // });

  //concatenate incoming POST data into a string
  var completePost = '';
  request.on('data', function (data) {
    completePost += data;
  });

  //do this when data finishes coming in
  request.on('end', function () {
    if (method ==='POST'){
      //convert concatenated string into object
      var postObject = querystring.parse(completePost);
      var bodyHTML = '';
      var i = 1;
      //seperate keys and values in object, extract values and add header tags
      for (var key in postObject){
        bodyHTML += '<h' + i + '>' + postObject[key] + '</h' + i + '>';
        i++;
      }

      //write html boilerplate to string
      var fullHTML = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>The Elements - ' + postObject.elementName + '</title><link rel="stylesheet" href="css/styles.css"></head><body>' + bodyHTML + '</body></html>';

      //create new HTML file with POST data
      fs.writeFile('./public/' + postObject.elementName.toLowerCase() + '.html', fullHTML, function (err) {
        if (err) throw err;
        console.log('It\'s saved!');
      });
    }
  });

});

server.listen(8080);