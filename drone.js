'use strict';

var dualShock = require('dualshock-controller');
var _ = require('lodash');

// Initialize Drone client
var arDrone  = require('ar-drone'),
    control = arDrone.createUdpControl(),
    client   = arDrone.createClient(),
    angle    = 128,
    speed    = 0.40;

setInterval(function() {
  // The emergency: true option recovers your drone from emergency mode that can
  // be caused by flipping it upside down or the drone crashing into something.
  // In a real program you probably only want to send emergency: true for one
  // second in the beginning, otherwise your drone may attempt to takeoff again
  // after a crash.
  // control.ref({fly: true, emergency: true});
  // This command makes sure your drone hovers in place and does not drift.
  control.pcmd();
  // This causes the actual udp message to be send (multiple commands are
  // combined into one message)
  control.flush();
}, 30);

client.config('control:altitude_max', 500)
client.config('control:control_vz_max', 1000)
client.config('control:control_yaw', 3.0)
client.config('control:euler_angle_max', 0.30)

client.config('control:outdoor', false)
client.config('control:flight_without_shell', false)

var flying   = false,
hovering = false;

//pass options to init the controller.
var controller = dualShock(
    {
        //you can use a ds4 by uncommenting this line.
        config: "dualshock4-generic-driver",
        //if using ds4 comment this line.
        // config : "dualShock3",
        //smooths the output from the acelerometers (moving averages) defaults to true
        accelerometerSmoothing : true,
        //smooths the output from the analog sticks (moving averages) defaults to false
        analogStickSmoothing : true
    });


//make sure you add an error event handler
controller.on('error', function(data) {
  //...someStuffDidNotWork();
});

//add event handlers:
controller.on('left:move', function(data) {
  //...doStuff();
  moveDrone(data);
});
controller.on('right:move', function(data) {
  //...doStuff();
  liftDrone(data);
});
controller.on('connected', function(data) {
  //...doStuff();
  console.log("Connected to Dualshock")
});
controller.on('square:press', function (data) {
  //...doStuff();
  moveDrone(data);
});
controller.on('square:release', function (data) {
  //...doStuff();
  moveDrone(data);
});

controller.on('triangle:press', function (data) {
  //...doStuff();
  moveDrone(data);
});
controller.on('triangle:release', function (data) {
  //...doStuff();
  moveDrone(data);
});

controller.on('circle:press', function (data) {
  //...doStuff();
  moveDrone(data);
});
controller.on('circle:release', function (data) {
  //...doStuff();
  moveDrone(data);
});

controller.on('x:press', function (data) {
  //...doStuff();
});
controller.on('x:release', function (data) {
  //...doStuff();
    if (!flying) {
        console.log("takeoff, hovering now");
        flying = true;
        client.takeoff(function() {
            hovering = true;
        });
    }
    else{
        console.log("landing now");
        client.land(function() {
            flying = false;
            hovering = false;
            client.stop();
        });
        
    }
});

controller.on('r2:analog', function (data) {
  //...doStuff();
    console.log("clockwise:", (data / 255));
    client.clockwise(data/255);
});
controller.on('l2:analog', function (data) {
  //...doStuff();
  console.log("cclockwise:", (data / 255));
    client.counterClockwise(data/255);
  
});


//connect the controller
controller.connect();

function moveDrone(data){
    if(!hovering){
        console.log("Drone is landed, press X to takeoff")
        return -1;
    }

    // _.map(data, function(num){console.log(num);})

    if (data.x<=128){
        console.log("left:", (128 - data.x)/angle*speed);
        client.left((128 - data.x) / angle * speed);
    }
        
    else if (data.x>=128){
        console.log("right:", (data.x - 128) / angle * speed);
        client.right((data.x - 128) / angle * speed);
    }
        
    
    if (data.y<=128){
        console.log("front:", (128 - data.y)/angle*speed);
        client.front((128 - data.y) / angle * speed);
    }
        
    else if (data.y>=128){
        console.log("back:", (data.y - 128) / angle * speed);
        client.back((data.y - 128) / angle * speed);
    }
}

function liftDrone(data){
    if(!hovering){
        console.log("Drone is landed, press X to takeoff")
        return -1;
    }
    if (data.y<=128){
        console.log("front:", (128 - data.y)/angle*speed);
        client.up((128 - data.y) / angle * speed);
    }
        
    else if (data.y>=128){
        console.log("back:", (data.y - 128) / angle * speed);
        client.down((data.y - 128) / angle * speed);
    }
}
// setInterval(function() {
//     on("x", ((rdata[5] & 32) !== 0));
//     on("o", ((rdata[5] & 64) !== 0));
//     on("square", ((rdata[5] & 16) !== 0));
//     on("triangle", ((rdata[5] & 128) !== 0));
//     on("left", {x: rdata[1], y: rdata[2]});
//     on("right", {x: rdata[3], y: rdata[4]});
// }, 40);

// function on(type, value) {
//     if (type == "x" && value) {
//         if (!flying) {
//             console.log("takeoff");
//             flying = true;
//             client.takeoff(function() {
//                 hovering = true;
//                 console.log("flying");
//             });
//         }
//     }

//     if (type == "o" && value) {
//         if (flying) {
//             console.log("land");
//             flying   = false;
//             hovering = false;
//             client.land(function() {
//                 console.log("landed");
//                 client.stop();
//             });
//         }
//     }

//     if (type == "triangle" && value) {
//         if (flying) {
//             console.log("flipAhead");
//             client.animate('flipAhead', 500);
//         }
//     }

//     if (type == "square" && value) {
//         if (flying) {
//             console.log("flipBehind");
//             client.animate('flipAhead', 500);
//         }
//     }

//     if (hovering) {
//         if (type == "left" && value.y <= 128) {
//             console.log("front:", (128 - value.y) / angle * speed);
//             client.front((128 - value.y) / angle * speed);
//         } else if (type == "left" && value.y > 128) {
//             console.log("back:", (value.y - 128) / angle * speed);
//             client.back((value.y - 128) / angle * speed);
//         }

//         if (type == "left" && value.x <= 128) {
//             console.log("left:", (128 - value.x) / angle * speed);
//             client.left((128 - value.x) / angle * speed);
//         } else if (type == "left" && value.x > 128) {
//             console.log("right:", (value.x - 128) / angle * speed);
//             client.right((value.x - 128) / angle * speed);
//         }

//         if (type == "right" && value.x <= 128) {
//             console.log("counterclockwise:", (128 - value.x) / angle * speed);
//             client.counterClockwise((128 - value.x) / angle * speed);
//         } else if (type == "right" && value.x > 128) {
//             console.log("clockwise:", (value.x - 128) / angle * speed);
//             client.clockwise((value.x - 128) / angle * speed);
//         }

//         if (type == "right" && value.y <= 128) {
//             console.log("up:", (128 - value.y) / angle * speed * 0.2);
//             client.up((128 - value.y) / angle * speed);
//         } else if (type == "right" && value.y > 128) {
//             console.log("down:", (value.y - 128) / angle * speed * 0.2);
//             client.down((value.y - 128) / angle * speed);
//         }
//     }
// }