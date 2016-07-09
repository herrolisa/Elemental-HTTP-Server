var http = require('http');
var querystring = require('querystring');
var fs = require('fs');
var path = require('path');

var map = {
  '.ico': 'image/x-icon',
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.png': 'image/png'
};

var server = http.createServer(function (request, response) {
  var method = request.method; //check method request
  var uriRequest = request.url; //check page requested
  if (uriRequest == '/'){
    uriRequest = '/index.html';
  }
  var fileType = path.extname(uriRequest); //check file extension
  var completePost = ''; //create variable for incoming data (for POST or PUT)

  if (method === 'GET'){
    getHandler(request, response, uriRequest, fileType);
  }

  if (method ==='POST'){
    postHandler(request, response, uriRequest, completePost);
  }

  if (method === 'PUT'){
    putHandler(request, response, uriRequest, completePost);
  }

  if (method === 'DELETE'){
    deleteHandler(request, response, uriRequest);
  }
});

server.listen(8080);

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

function getHandler(request, response, uriRequest, fileType){
  fs.readFile('./public' + uriRequest, 'utf8', function (err, responseBody) {
    if (err) {
      uriRequest = '/404.html';
      fs.readFile('./public' + uriRequest, 'utf8', function (err, responseBody) {
        response.writeHead(404, {"Content-Type": "text/html"});
        console.log(response._header);
        response.end(responseBody.toString());
      });
    }else{
      response.writeHead(200, {"Content-Type": map[fileType]});
      console.log(response._header);
      response.end(responseBody.toString());
    }
  });
}

function postHandler(request, response, uriRequest, completePost) {
  //concatenate incoming POST data into a string
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
        console.log('The page does not exist yet. Let\'s make a new page!');
        fs.writeFile('./public/' + postObject.elementName.toLowerCase() + '.html', createHTML(postObject), function (err) {
          if (err) {
            throw err;
          }
          console.log(postObject.elementName.toLowerCase() + '.html has been created!');
          response.writeHead(200, {"Content-Type": "application/json"});
          console.log(response._header);
          response.end('{ "success" : true }');
          //read index.html
          fs.readFile('./public/index.html', 'utf8', function (err, htmlData) {
            var currentIndex = htmlData.toString();
            var firstSplit = currentIndex.slice(0, currentIndex.indexOf('</ol>'));
            var secondSplit = currentIndex.slice(currentIndex.indexOf('</ol>'));
            var insertLink = '<li><a href="/' + postObject.elementName.toLowerCase() + '.html">'+ postObject.elementName + '</a></li>';
            //insert new markup for index.html
            fs.writeFile('./public/index.html', firstSplit + insertLink + secondSplit, function(err){
              if(err){
                console.log(err);
              }
            }); //end of fs.writeFile for index.html
          }); //end of fs.readFile for index.html
        }); //end of fs.writeFile for new element html
      }else{ //the file already exist -- send error
        console.log('The page already exists.');
        response.writeHead(400, {"Content-Type": "application/json"});
        console.log(response._header);
        response.end('{ "success" : false }');
      }
    }); //end of fs.access (checking if the element file exists)
  }); //end of request.on('end')
}

function putHandler(request, response, uriRequest, completePost) {
  //concatenate incoming POST data into a string
  request.on('data', function (data) {
    completePost += data;
  });

  //do this when data finishes coming in
  request.on('end', function () {
    //convert concatenated string into object
    var postObject = querystring.parse(completePost);

    //check if file exists
    fs.access('./public/' + postObject.elementName.toLowerCase() + '.html', fs.F_OK, function(err) {
      if (err) { //the file doesn't exist -- send error
        console.log('The page does not exists.');
        response.writeHead(500, {"Content-Type": "application/json"});
        console.log(response._header);
        response.end('{ "error" : "resource ' + postObject.elementName.toLowerCase() + '.html does not exist" }');
      }else{ //the file already exist -- proceed to edit
        console.log('The page exist! Let\'s edit it!');
        //edit file with PUT data
        fs.writeFile('./public/' + postObject.elementName.toLowerCase() + '.html', createHTML(postObject), function (err) {
            if (err) {
              throw err;
          }
          console.log(postObject.elementName.toLowerCase() + '.html has been updated!');
          response.writeHead(200, {"Content-Type": "application/json"});
          console.log(response._header);
          response.end('{ "success" : true }');
        }); //end of fs.writeFile for new element html
      }
    }); //end of fs.access (checking if the element file exists)
  }); //end of request.on
}

function deleteHandler(request, response, uriRequest) {
  //check if file exists
  fs.access('./public/' + uriRequest, fs.F_OK, function(err) {
    if (err) { //the file doesn't exist -- send error
      console.log('The page does not exists, so it cannot be deleted.');
      response.writeHead(500, {"Content-Type": "application/json"});
      console.log(response._header);
      response.end('{ "error" : "resource ' + uriRequest + ' does not exist" }');
    }else{ //the file does exist -- proceed to delete page/update index.html file
      console.log('The page exist! Let\'s delete it!');
      fs.unlink('./public/' + uriRequest, function (err) {
        if (err) {
          throw err;
        }
        console.log('Successfully deleted ' + uriRequest);
        response.writeHead(200, {"Content-Type": "application/json"});
        console.log(response._header);
        response.end('{ "success" : true }');
      });
      //read index.html
      fs.readFile('./public/index.html', 'utf8', function (err, htmlData) {
        var currentIndex = htmlData.toString();
        var anchorText = uriRequest.replace(".html", "");
        anchorText = anchorText.charAt(1).toUpperCase() + anchorText.slice(2);
        console.log(anchorText);
        var removeLink = '<li><a href="' + uriRequest + '">' + anchorText +'</a></li>';
        var newIndex = currentIndex.replace(removeLink, '');
        //insert new markup for html file
        fs.writeFile('./public/index.html', newIndex, function(err){
          if(err){
            throw err;
          }
          return;
        }); //end of fs.writeFile for index.html
      }); //end of fs.readFile for index.html
    }
  }); //end of fs.access (checking if the element file exists)
}