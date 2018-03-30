import _ from 'lodash';
import Kefir from 'kefir';
import io from 'socket.io-client';
import THREE from 'three';

console.dir(io);
function component(){
  var element = document.createElement('div');

  element.innerHTML = _.join(['Hello', 'webpack'], ' ');

  return element;
}

document.body.appendChild(component());

/*
 * Socket IO stuff
 */

var attention = 0;
var testAttention;
// Get Data at 1Hz, DO NOT USE THIS TIMER IN PRODUCTION -
setInterval(function() {
    console.log('running socket.emit("getData")');
    socket.emit('getData');
    refreshFrontEnd();
}, 2000);
const socket = io('http://127.0.0.1:4000');

const sayData = function(data) {

    console.log('signal: (zero is good, 200 is bad)');
    data._source._buffers[1][0] ? console.log(data._source._buffers[1][0]["signal"]) : console.log('signal not found');

    console.log('eeg:');
    data._source._buffers[0][0] ? console.log(data._source._buffers[0][0]["eeg"]) : console.log('eeg not found');

    console.log('attention:');
    data._source._buffers[3][0] ? console.log(data._source._buffers[3][0]["attention"]) : console.log('attention not found');

    console.log('meditation:');
    data._source._buffers[2][0] ? console.log(data._source._buffers[2][0]["meditation"]) : console.log('meditation not found');
}

const start = new Date();

var stream = Kefir.withInterval(1000, emitter => {
    const time = new Date() - start;
    if (time < 100000) {
        socket.emit('getData');
    } else {
        emitter.end(); // end the stream
    }
});
stream.log();

var refreshAttention = function(data){
    if (data._source._buffers[3][0]) {
        if (data._source._buffers[3][0]["attention"]) {
            console.log('attention found');
            attention = data._source._buffers[3][0]["attention"];
            if (attention < 10) {
                console.log('attention 0 reading dumped');
            } else {
                console.log('attention reading:');
                console.log(attention);
            }
    // drawCubes(geometry, attention);
        } else{
          console.log('ERR: refreshAttention(data), data not found ');
        }
    }
    if (data._source._buffers[3][0]) {
        if (data._source._buffers[3][0]["meditation"]) {
            console.log('meditation found');
            attention = data._source._buffers[3][0]["meditation"];
            if (attention < 10) {
                console.log('meditation 0 reading dumped');
            } else {
                console.log('meditation reading:');
                console.log(meditation);
            }
    // drawCubes(geometry, attention);
        } else{
          console.log('ERR: refreshAttention(data), data not found ');
        }
    }
}

function refreshFrontEnd(){
  drawCubes(geometry, attention);
  console.log('refreshFrontEnd running');
}

socket.on('data', refreshAttention);

var container, stats;
var camera, controls, scene, renderer, geometry, difference;
var objects = [];
var loopCount = 0;
var masterscope = {};

init();
animate();

function init() {

    container = document.createElement('div');
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 1000;

    controls = new THREE.TrackballControls(camera);
    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;
    controls.noZoom = false;
    controls.noPan = false;
    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.3;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    scene.add(new THREE.AmbientLight(0x505050));

    var light = new THREE.SpotLight(0xffffff, 1.5);
    light.position.set(0, 500, 2000);
    light.castShadow = true;

    light.shadow = new THREE.LightShadow(new THREE.PerspectiveCamera(50, 1, 200, 10000));
    light.shadow.bias = -0.00022;

    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;

    scene.add(light);

    geometry = new THREE.BoxGeometry(40, 40, 40);

    // drawCubes(geometry);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    container.appendChild(renderer.domElement);

    var dragControls = new THREE.DragControls(objects, camera, renderer.domElement);
    dragControls.addEventListener('dragstart', function(event) { controls.enabled = false; });
    dragControls.addEventListener('dragend', function(event) { controls.enabled = true; });

    var info = document.createElement('div');
    info.style.position = 'absolute';
    info.style.top = '10px';
    info.style.width = '100%';
    info.style.textAlign = 'center';
    info.innerHTML = '<a href="http://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - draggable cubes';
    container.appendChild(info);

    stats = new Stats();
    container.appendChild(stats.dom);

    window.addEventListener('resize', onWindowResize, false);

}

function drawCubes(geometry, attention) {
    console.log('testAttention: ' + testAttention);
    console.log('attention: ' + attention);
    if (loopCount === 0) {
        for (var i = 0; i < attention; i++) {

            var object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff }));

            object.position.x = Math.random() * 1000 - 500;
            object.position.y = Math.random() * 600 - 300;
            object.position.z = Math.random() * 800 - 400;

            object.rotation.x = Math.random() * 2 * Math.PI;
            object.rotation.y = Math.random() * 2 * Math.PI;
            object.rotation.z = Math.random() * 2 * Math.PI;

            object.scale.x = Math.random() * 2 + 1;
            object.scale.y = Math.random() * 2 + 1;
            object.scale.z = Math.random() * 2 + 1;

            object.castShadow = true;
            object.receiveShadow = true;
            object.name = 'cube' + i;

            scene.add(object);
            objects.push(object);
        }
    }
    if (attention < 40) {
        for (var i = objects.length; i > attention; i--) {
            scene.remove(objects[i]);
        }
    }
    if (testAttention > attention) {
        difference = testAttention - attention;
        console.log("\n\n\n" + "You're COOOOLING -" + difference + "\n\n");
        for (var i = 0; i < objects.length; i++) {
            objects[i].material.transparent = true;
            objects[i].material.opacity = 0.5;
        }
    }
    if (testAttention < attention) {
        difference = attention - testAttention;
        console.log('\n\n\n' + 'GAINERER!!! +' + difference + '\n\n\n');
        for (var i = 0; i < testAttention; i++) {
            var object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff }));
            object.position.x = Math.random() * 1000 - 500;
            object.position.y = Math.random() * 600 - 300;
            object.position.z = Math.random() * 800 - 400;

            object.rotation.x = Math.random() * 2 * Math.PI;
            object.rotation.y = Math.random() * 2 * Math.PI;
            object.rotation.z = Math.random() * 2 * Math.PI;

            object.scale.x = Math.random() * 2 + 1;
            object.scale.y = Math.random() * 2 + 1;
            object.scale.z = Math.random() * 2 + 1;

            object.castShadow = true;
            object.receiveShadow = true;
            object.name = 'cube' + i;

            scene.add(object);

            objects.push(object);
        }
    }
    testAttention = attention;
    loopCount++;
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

//

function animate() {

    requestAnimationFrame(animate);

    render();
    stats.update();

}

function render() {
    controls.update();

    renderer.render(scene, camera);

}
