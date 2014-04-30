var app, client;
var express = require("express");
var faye = require("faye");
var path = require("path");
var swarm = require("./swarm");
var _ = require('lodash');
var hid = require('node-hid');

// Initialize Drone client
var drone  = require('./drone'),

app = express();

app.use('/components', express.static(__dirname+'/public/components'));
app.use('/js', express.static(__dirname+'/public/js'));
app.use('/css', express.static(__dirname+'/public/css'));
app.use(express.static(__dirname+ '/public'));

app.get("/drones", function(req, res) {
  var drones;
  drones = [];
  swarm.forEach(function(drone) {
    return drones.push({
      id: drone.id,
      ip: drone.ip,
      camera: drone.camera,
      enabled: drone.enabled
    });
  });
  console.log("new client connection (sent %s drones)", drones.length);
  return res.end(JSON.stringify(drones));
});

swarm["do"](function(drone) {
    console.log('config drone:', drone.id);
    drone.config('general:navdata_demo', 'TRUE');
    return drone.on('navdata', function(data) {
      drone.navdata = data;
      return socket.publish("/drone/navdata/" + drone.id, data);
    });
  });

var server = app.listen(3000, function() {
  console.log('Listening on port %d', server.address().port);
});

bayeux = new faye.NodeAdapter({
    mount: '/faye',
    timeout: 45
});

bayeux.attach(server);

bayeux.bind("handshake", function(clientId) {
  return console.log("socket handshake!", clientId);
});

bayeux.bind("disconnect", function(clientId) {
  return console.log("socket disconnect!", clientId);
});

var socket = new faye.Client("http://localhost:" + server.address().port + "/faye");

socket.subscribe("/drone/enable", function(data) {
  swarm.drones[data.id].enabled = data.status;
  return console.log('set drone %s control to %s', data.id, data.status);
});

socket.subscribe("/drone/camera", function(data) {
  swarm.drones[data.id].changeCamera(data.camera);
  return console.log('set drone %s camera to %s', data.id, data.camera);
});

socket.subscribe("/swarm/move", function(control) {
  console.log('swarm move', control);
  return swarm.move(control);
});

socket.subscribe("/swarm/animate", function(animation) {
  console.log('swarm animate: ', animation);
  return swarm.animate(animation);
});

socket.subscribe("/swarm/action", function(command) {
  console.log('swarm action: ', command);
  return swarm.action(command);
});

require("dronestream").listen(server, {
   timeout: 500,
});
