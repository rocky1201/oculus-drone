var app, client;
var express = require("express");

// Initialize Drone client
var drone  = require('./drone'),

app = express();

app.use('/components', express.static(__dirname+'/public/components'));
app.use('/js', express.static(__dirname+'/public/js'));
app.use('/css', express.static(__dirname+'/public/css'));
app.use(express.static(__dirname+ '/public'));

var server = app.listen(3000, function() {
  console.log('Listening on port %d', server.address().port);
});

// require("dronestream").listen(server, {
   // timeout: 500,
// });
