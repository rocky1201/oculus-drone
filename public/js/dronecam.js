var oculusBridge;
var renderer, camera, riftCam;
var scene, element, lights, fog;
var ambient, point;
var aspectRatio, windowHalf;

var gl, floorTexture;
var dronestream, videoBuffer, videoCtx;

function bridgeConnected(){
  document.getElementById("logo").className = "";
}

function bridgeDisconnected(){
  document.getElementById("logo").className = "offline";
}

function bridgeConfigUpdated(config){
  console.log("Oculus config updated.");
  riftCam.setHMD(config);      
}

function bridgeOrientationUpdated(quatValues) {
  var stats = document.getElementById("stats");
  
  stats.innerHTML = "Display Configuration<hr>";

  // Show all the parameters in the config object.
  for(var itm in config){
    var row = document.createElement("div");
    var label = document.createElement("label");
    var value = document.createElement("span");

    label.innerHTML = itm;
    value.innerHTML = config[itm];
    
    row.appendChild(label);
    row.appendChild(value);
    stats.appendChild(row);
  }
}

function onKeyDown(event){

}

function onKeyUp(event){

}

function onResize(event){
  riftCam.setSize(window.innerWidth, window.innerHeight);
}

function crashSecurity(e){
  oculusBridge.disconnect();
  document.getElementById("viewport").style.display = "none";
  document.getElementById("security_error").style.display = "block";
}

function crashOther(e){
  oculusBridge.disconnect();
  document.getElementById("viewport").style.display = "none";
  document.getElementById("generic_error").style.display = "block";
  document.getElementById("exception_message").innerHTML = e.message;
}

function renderScene(){
  try{
      // if( video.readyState === video.HAVE_ENOUGH_DATA ){
        if (floorTexture)
          floorTexture.needsUpdate = true;
      // }
      riftCam.render(scene, camera);
      //controls.update();
      // renderer.render(scene, camera);
      // console.log("rendering on canvas");
      
  } catch(e){
    console.log(e);
    if(e.name == "SecurityError"){
      crashSecurity(e);
    } else {
      crashOther(e);
    }
    return false;
  }
  return true;
}

function animate(){
  if (renderScene()){
    requestAnimationFrame(animate);
    videoCtx.drawImage(videoCanvas,0,0, videoCanvas.width, videoCanvas.height);
  }
}

// Init function
function init(){

  document.addEventListener('keydown', onKeyDown, false);
  document.addEventListener('keyup', onKeyUp, false);

  window.addEventListener('resize', onResize, false);

  oculusBridge = new OculusBridge({
    "debug" : true,
    "onOrientationUpdate" : bridgeOrientationUpdated,
    "onConfigUpdate"      : bridgeConfigUpdated,
    "onConnect"           : bridgeConnected,
    "onDisconnect"        : bridgeDisconnected
  });
  oculusBridge.connect();

  // Init window size and aspect ratio
  windowHalf = new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2);
  aspectRatio = window.innerWidth / window.innerHeight;

  // Initialize the renderer
  renderer = new THREE.WebGLRenderer({antialias:true});
  renderer.setClearColor(0xdbf7ff);
  renderer.setSize(window.innerWidth, window.innerHeight);

  // init openGL scene
  scene = new THREE.Scene();
  // scene.fog = new THREE.FogExp2(0xdbf7ff);

  // init camera
  // camera = new THREE.PerspectiveCamera(45, aspectRatio, 1, 10000);
  // camera.useQuaternion = true;
   camera = new THREE.OrthographicCamera( window.innerWidth/-2, window.innerWidth/2, window.innerHeight/2, window.innerHeight/-2, 1, 10000 );
  camera.position.set(0, window.innerWidth/5.2 ,1);
  camera.lookAt(scene.position);

  element = document.getElementById('viewport');
  element.appendChild(renderer.domElement);
  element.firstChild.id="viewport-canvas"

  // Drone cam initialization block
  new NodecopterStream(document.getElementById("dronestream"));
  videoCanvas = $('#dronestream canvas')[0];
  $('#clone').append(videoCanvas.cloneNode()).attr('id', 'canvas-clone');
  video = $('#canvas-clone canvas')[0];
  videoCtx = video.getContext('2d');

  // ========================================= FOR TEST ONLY! =====================================================
  // video      = document.createElement('video');
  // video.width    = 640;
  // video.height   = 480;
  // video.autoplay = true;
  // video.src = "/drone/camera";
  
  floorTexture = new THREE.Texture(video);
  floorTexture.wrapS=floorTexture.wrapT= THREE.RepeatWrapping
  
  var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture} );
  var floorGeometry = new THREE.PlaneGeometry(640, 800);

  floorTexture.needsUpdate = true;

  var floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;

  scene.add(floor);

  ambient = new THREE.AmbientLight(0x222222);
  scene.add(ambient);

  point = new THREE.DirectionalLight( 0xffffff, 1, 0, Math.PI, 1 );
  point.position.set( -250, 250, 150 );
  
  scene.add(point);

  // ================================================================================================================


  riftCam = new THREE.OculusRiftEffect(renderer);
}

window.onload = function() {
  init();
  animate();
  // renderScene();
}