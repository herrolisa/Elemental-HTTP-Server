var http = require('http');
var querystring = require('querystring');
var fs = require('fs');
var path = require('path');

var server = http.createServer(function (request, response) {
  var method = request.method;

  var uriRequest = request.url;
  if (uriRequest == '/'){
    uriRequest = '/index.html';
  }

  //check file extension
  var fileType = path.extname(uriRequest);
  console.log(fileType);

  if (method === 'GET'){
    fs.readFile('./public' + uriRequest, 'utf8', function (err, responseBody) {
      if (err) {
        uriRequest = '/404.html';
        fs.readFile('./public' + uriRequest, 'utf8', function (err, responseBody) {
          response.writeHead(404, {"Content-Type": "text/html"});
          console.log(response._header);
          response.end(responseBody.toString());
        });
      }else{
        if (fileType === '.css'){
          response.writeHead(200, {"Content-Type": "text/css"});
          console.log(response._header);
          response.end(responseBody.toString());
        }else{
          response.writeHead(200, {"Content-Type": "text/html"});
          console.log(response._header);
          response.end(responseBody.toString());
        }
      }
    });
  }

  if (method ==='POST'){
    //concatenate incoming POST data into a string
    var completePost = '';
    request.on('data', function (data) {
      completePost += data;
    });

    //do this when data finishes coming in
    request.on('end', function () {
      //convert concatenated string into object
      var postObject = querystring.parse(completePost);

      //check if file exists
      fs.access('./public/' + postObject.elementName.toLowerCase() + '.html', fs.F_OK, function(err) {
          if (err) { //the file does not exist -- create new file
            //create new HTML file with POST data
            console.log('page does not exists. lets make a page');
            fs.writeFile('./public/' + postObject.elementName.toLowerCase() + '.html', createHTML(postObject), function (err) {
              if (err) {
                throw err;
              }
              console.log('It\'s saved!');
              response.writeHead(200, {"Content-Type": "application/json"});
              response.end('{ "success" : true }');
              //update index.html file
              fs.writeFile('./public/index.html', rewriteIndex(postObject.elementName), function(err){
                  if(err){
                    console.log(err);
                  }
              }); //end of fs.writeFile for index.html
            }); //end of fs.writeFile for new element html
          }else{ //the file does exist
            console.log('The page already exists.');
            response.writeHead(400, {"Content-Type": "application/json"});
            console.log(response._header);
            response.end('{ "success" : false }');
          }
      });
    }); //end of request.on
  }
}); //end of server

server.listen(8080);

function rewriteIndex(element) {
  return '<!DOCTYPE html>\n' +
  '<html lang="en">\n' +
  '\t<head>\n' +
  '\t\t<meta charset="UTF-8">\n' +
  '\t\t<title>The Elements</title>\n' +
  '\t<link rel="stylesheet" href="/css/styles.css">\n' +
  '\t</head>\n' +
  '\t<body>\n' +
    '\t\t<h1>The Elements</h1>\n' +
    '\t\t<h2>These are all the known elements.</h2>\n' +
    '\t\t<h3>These are 2</h3>\n' +
    '\t\t<ol>\n' +
      '\t\t\t<li>\n' +
        '\t\t\t\t<a href="/hydrogen.html">Hydrogen</a>\n' +
      '\t\t\t</li>\n' +
      '\t\t\t<li>\n' +
        '\t\t\t\t<a href="/helium.html">Helium</a>\n' +
      '\t\t\t</li>\n' +
      '\t\t\t<li>\n' +
        '\t\t\t\t<a href="/' + element.toLowerCase() +'.html">' + element + '</a>\n' +
      '\t\t\t</li>\n' +
    '\t\t</ol>\n' +
  '\t</body>\n' +
  '</html>';
}

//creates markup for new HTML file
function createHTML(hashTable){
  return '<!DOCTYPE html>\n' +
  '<html lang="en">\n' +
  '\t<head>\n' +
  '\t\t<meta charset="UTF-8">\n' +
  '\t\t<title>The Elements - ' + hashTable.elementName + '</title>\n'+
  '\t\t<link rel="stylesheet" href="css/styles.css">\n'+
  '\t</head>\n'+
  '\t<body>\n' +
  '\t\t<h1>' + hashTable.elementName + '</h1>\n' +
  '\t\t<h2>' + hashTable.elementSymbol + '</h2>\n' +
  '\t\t<h3>Atomic number ' + hashTable.elementAtomicNumber + '</h3>\n' +
  '\t\t<p>' + hashTable.elementDescription + '</p>\n' +
  '\t\t<p><a href="/">back</a></p>\n' +
  '\t</body>\n'+
  '</html>';
}