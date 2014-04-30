'use strict';

var _ = require('lodash');
var hid = require('node-hid');


// Initialize Drone client
var arDrone  = require('ar-drone'),
client   = arDrone.createClient(),
angle    = 128,
speed    = 0.20;

client.config('control:altitude_max', 500)
client.config('control:control_vz_max', 1000)
client.config('control:control_yaw', 3.0)
client.config('control:euler_angle_max', 0.30)

client.config('control:outdoor', false)
client.config('control:flight_without_shell', false)

// Init DS4 client
var rdata = [];
var devices = hid.devices();

var controller = _(devices)
.filter(isSonyController)
.filter(isDS4HID)
.map(createHID)
.first();

if (!controller)
throw new Error('Controller not found');

controller.on('data', function(buf) {
  rdata = buf;
});

console.log("Feel free to play with configuration.");
console.log("Controls:")
console.log("  Left stick: front/back, left/right");
console.log("  Right stick: up/down, counterclockwise/clockwise");
console.log("  O: Takeoff");
console.log("  X: Land");

var flying   = false,
hovering = false;

// hid.on('data',function(){
//     if ((rdata[5] & 32) !== 0){
//     console.log("x is pressed")
//     }

//     if ((rdata[5] & 64) !== 0){
//     console.log("o is pressed")
//     }

//     if ((rdata[5] & 16) !== 0){
//     console.log("square is pressed")
//     }

//     if ((rdata[5] & 128) !== 0){
//     console.log("triangle is pressed")
//     }

// });

setInterval(function() {
    on("x", ((rdata[5] & 32) !== 0));
    on("o", ((rdata[5] & 64) !== 0));
    on("square", ((rdata[5] & 16) !== 0));
    on("triangle", ((rdata[5] & 128) !== 0));
    on("left", {x: rdata[1], y: rdata[2]});
    on("right", {x: rdata[3], y: rdata[4]});
}, 40);

function on(type, value) {
if (type == "x" && value) {
    if (!flying) {
        console.log("takeoff");
        flying = true;
        client.takeoff(function() {
            hovering = true;
            console.log("flying");
        });
    }
}

if (type == "o" && value) {
    if (flying) {
        console.log("land");
        flying   = false;
        hovering = false;
        client.land(function() {
            console.log("landed");
            client.stop();
        });
    }
}

if (type == "triangle" && value) {
    if (flying) {
        console.log("flipAhead");
        client.animate('flipAhead', 500);
    }
}

if (type == "square" && value) {
    if (flying) {
        console.log("flipBehind");
        client.animate('flipAhead', 500);
    }
}

if (hovering) {
    if (type == "left" && value.y <= 128) {
        console.log("front:", (128 - value.y) / angle * speed);
        client.front((128 - value.y) / angle * speed);
    } else if (type == "left" && value.y > 128) {
        console.log("back:", (value.y - 128) / angle * speed);
        client.back((value.y - 128) / angle * speed);
    }

    if (type == "left" && value.x <= 128) {
        console.log("left:", (128 - value.x) / angle * speed);
        client.left((128 - value.x) / angle * speed);
    } else if (type == "left" && value.x > 128) {
        console.log("right:", (value.x - 128) / angle * speed);
        client.right((value.x - 128) / angle * speed);
    }

    if (type == "right" && value.x <= 128) {
        console.log("counterclockwise:", (128 - value.x) / angle * speed);
        client.counterClockwise((128 - value.x) / angle * speed);
    } else if (type == "right" && value.x > 128) {
        console.log("clockwise:", (value.x - 128) / angle * speed);
        client.clockwise((value.x - 128) / angle * speed);
    }

    if (type == "right" && value.y <= 128) {
        console.log("up:", (128 - value.y) / angle * speed * 0.2);
        client.up((128 - value.y) / angle * speed);
    } else if (type == "right" && value.y > 128) {
        console.log("down:", (value.y - 128) / angle * speed * 0.2);
        client.down((value.y - 128) / angle * speed);
    }
}
}

// HIDDesciptor -> Boolean
function isDS4HID(descriptor) {
  return descriptor.vendorId == 1356 && descriptor.productId == 1476;
}

// HIDDesciptor -> Boolean
function isSonyController(descriptor) {
  return descriptor.manufacturer.match(/^Sony Computer Entertainment/);
}

// HIDDescriptor -> HID
function createHID(descriptor) {
  return new hid.HID(descriptor.path);
}
