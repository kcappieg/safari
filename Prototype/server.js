"use strict";

var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var cache = {};
var log;

function send404(response){
  response.writeHead(404, {'Content-Type': "text/plain"});
  response.write('Error 404: resource not found');
  response.end();
};

function sendFile(response, filePath, fileContents){
  response.writeHead(200,
    {"Content-Type": mime.lookup(path.basename(filePath))}
  );
  response.end(fileContents);
};

function serveStatic(response, cache, absPath, request){
  var logOutput = "Incoming request from "+request.connection.remoteAddress+"\n The requested resource is "+absPath;
  console.log(logOutput);
  log.write(logOutput);

  /*if (cache[absPath]){
    sendFile(response, absPath, cache[absPath]);
  } else {*/
    fs.exists(absPath, function(exists){
      if (exists){
        fs.readFile(absPath, function(err, data){
          if (err){
            send404(response);
          } else {
            cache[absPath] = data;
            sendFile(response, absPath, data);
          }
        });
      } else {
        send404(response);
      }
    });
  //}
};

var server = http.createServer(function(request, response){
  var filePath = false;

  if (request.url === '/'){
    filePath = './index.html';
  } else {
    filePath = '.'+request.url;
  }

  serveStatic(response, cache, filePath, request);
});

server.listen(8080, function(){
  console.log("Server is listening on port 8080");
  log = fs.createWriteStream('server_log.txt', {"flags": "a"});
  log.write("Begin log:");
})