import _ from 'lodash';
import Kefir from 'kefir';
import io from 'socket.io-client';
import * as THREE from 'three';
import React from 'react';
import { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createStore } from 'redux';
import { isFSA } from 'flux-standard-action';
import { isError } from 'flux-standard-action';
import { combineReducers } from 'redux';
import 'babel-polyfill';
import ReactDom from 'react-dom';


const initialState = {
  attention: 0,
  lastAttention: 0
}

const store = createStore(attentionApp);

let attention = 0;
let testAttention;

const SET_ATTENTION = 'SET_ATTENTION';

// action creator: update attention
function updateAttention(number){
    return{
      type: SET_ATTENTION,
      number
    }
}

// app
function attentionApp(state = initialState, action) {
  // does not loop
    switch(action.type){
      case 'SET_ATTENTION':
        return Object.assign({}, state, {
          attention: action.number,
          lastAttention: state.attention,
          change: -(state.attention-action.number)
        })
      default:
        return state;
    }
}

// component
// class AttentionContainer extends Component{
//   constructor(props){
//     super(props);
//
//     const { dispatch } = props;
//
//     this.boundActionCreators = bindActionCreators([updateAttention], dispatch)
//     console.log(this.boundActionCreators);
//   }
//
//   componentDidMount(){
//     let { dispatch } = this.props;
//     let action = updateAttention(50);
//     dispatch(action)
//   }
//   render(){
//     let { attention } = this.props;
//     return <AttentionContainer attention={attention} {...this.boundActionCreators} />
//   }
// }
//
// connect(
//   state => ({ attention: state.attention })
// )(AttentionContainer)


/*
 * Socket IO stuff
 */

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

let stream = Kefir.withInterval(1000, emitter => {
    const time = new Date() - start;
    console.log(store.getState());

    if (time < 10000000) {
        socket.emit('getData');
    } else {
        emitter.end(); // end the stream
    }
});
stream.log();

let refreshAttention = function(data){
    // console.log('\nraw attention object:')
    // console.log(data._source._buffers[3][0]);
    if (data._source._buffers[3][0]) {
        if (data._source._buffers[3][0]["attention"]) {
            // console.log('attention found');
            attention = data._source._buffers[3][0]["attention"];
            if (attention < 10) {
                // console.log('attention < 10 reading dumped');
            } else {
                // console.log('attention reading:');
                // console.log(attention);
                refreshFrontEnd(attention);
            }
        } else{
          console.log('ERR: refreshAttention(data), data not found ');
        }
    } else {
      console.log('data._source._buffers[3][0] did not return a value' )
    }
}

function refreshFrontEnd(number){
  // console.log('\n');
  // console.log('store');
  // console.log(store.getState());

  // drawCubes(geometry, attention);
}


// DATA ENTRY POINT
socket.on('data', function(data){
  let index = data._source._buffers[3][0]['attention']
  if(index && typeof index === 'number'){
    // console.log('\n'+ 'index: ' + index + '\n');
    store.dispatch(updateAttention(index));
    // console.log('\n| state - |\n');
    // console.log(store.getState());
  }
  return;
  // refreshAttention(data);
});

/* action sequence:
      'data'
          refreshAttention(data)
              -> get attention from data <--
              refreshFrontEnd(attention)
                  store.dispatch(
                    updateAttention(attention)
                )
                  drawCubes(geometry attention)




*/

// THREE.js stuff
let container;
let camera, controls, scene, renderer, geometry, difference;
let objects = [];
let loopCount = 0;
let masterscope = {};

init();
animate();

function init() {

    container = document.createElement('div');
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 1000;

    // controls = new THREE.TrackballControls(camera);
    // controls.rotateSpeed = 1.0;
    // controls.zoomSpeed = 1.2;
    // controls.panSpeed = 0.8;
    // controls.noZoom = false;
    // controls.noPan = false;
    // controls.staticMoving = true;
    // controls.dynamicDampingFactor = 0.3;

    scene = new THREE.Scene();
    // console.log('scene:');
    // console.dir(scene);
    scene.background = new THREE.Color(0xf0f0f0);

    scene.add(new THREE.AmbientLight(0x505050));

    let light = new THREE.SpotLight(0xffffff, 1.5);
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

    // let dragControls = new THREE.DragControls(objects, camera, renderer.domElement);
    // dragControls.addEventListener('dragstart', function(event) { controls.enabled = false; });
    // dragControls.addEventListener('dragend', function(event) { controls.enabled = true; });

    let info = document.createElement('div');
    info.style.position = 'absolute';
    info.style.top = '10px';
    info.style.width = '100%';
    info.style.textAlign = 'center';
    info.innerHTML = '<a href="http://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - draggable cubes';
    container.appendChild(info);

    // stats = new Stats();
    // container.appendChild(stats.dom);

    window.addEventListener('resize', onWindowResize, false);

}

function drawCubes(geometry, attention) {
    // console.log('testAttention: ' + testAttention);
    // console.log('attention: ' + attention);
    if (loopCount === 0) {
        console.log('loopin')
        for (let i = 0; i < attention; i++) {
            console.log('in Draw Cubes');
            let object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff }));

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
        for (let i = objects.length; i > attention; i--) {
            scene.remove(objects[i]);
        }
    }
    if (testAttention > attention) {
        difference = testAttention - attention;
        // console.log("\n\n\n" + "You're COOOOLING -" + difference + "\n\n");
        for (let i = 0; i < objects.length; i++) {
            objects[i].material.transparent = true;
            objects[i].material.opacity = 0.5;
        }
    }
    if (testAttention < attention) {
        difference = attention - testAttention;
        // console.log('\n\n\n' + 'GAINERER!!! +' + difference + '\n\n\n');
        for (let i = 0; i < testAttention; i++) {
            let object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff }));
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

}

function render() {
    // controls.update();

    renderer.render(scene, camera);

}
