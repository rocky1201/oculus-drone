var app, client;
var express = require("express");
var faye = require("faye");
var path = require("path");
var ardrone = require("ar-drone");

// client = ardrone.createClient();
// var pngStream = client.getPngStream();
// var lastPng;

// pngStream
//   .on('error', console.log)
//   .on('data', function(pngBuffer) {
//   lastPng = pngBuffer;
// });

// var video = ardrone.createClient().getVideoStream();

// video.on('data', console.log);
// video.on('error', console.log);

app = express();

app.use('/components', express.static(__dirname+'/public/components'));
app.use('/js', express.static(__dirname+'/public/js'));
app.use('/css', express.static(__dirname+'/public/css'));
app.use(express.static(__dirname+ '/public'));

// app.get("/drone/camera/", function(req, res) {
//   if (!lastPng) {
//     res.writeHead(503);
//     res.end('Did not receive any png data yet.');
//     return;
//   }
//   res.writeHead(200, {'Content-Type': 'image/png', "Cache-Control": "no-cache, no-store"});
//   res.end(lastPng);
//   return
// });


var server = app.listen(3000, function() {
console.log('Listening on port %d', server.address().port);
});

require("dronestream").listen(server, {
   timeout: 500,
});
