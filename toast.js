import React from 'react';
import { Component } from 'react';
import ReactDOM from 'react-dom';
import { bindActionCreators } from 'redux';
import { createStore } from 'redux';
import { combineReducers } from 'redux';
import { connect } from 'react-redux';
import { isFSA } from 'flux-standard-action';
import { isError } from 'flux-standard-action';
import _ from 'lodash';
import io from 'socket.io-client';
import 'babel-polyfill';
import * as THREE from 'three';
import Button from 'material-ui/Button';

let attention = 0; // init attention value
const SET_BRAIN_DATA = 'SET_BRAIN_DATA'; // set action value
// init app state
const initialState = {
  attention: 0,
  lastAttention: 0,
  meditation: 0
}

const store = createStore(attentionApp); // initialize store

// app
function attentionApp(state = initialState, action) {
    switch(action.type){
      case 'SET_BRAIN_DATA':
        return Object.assign({}, state, {
          attention: action.number,
          lastAttention: state.attention,
          change: -(state.attention-action.number),
          meditation: action.meditation
        })
      default:
        return state;
    }
}
// action creator: update attention
function updateBrainData(object){
    return{
      type: SET_BRAIN_DATA,
      object
    }
}

const socket = io('http://127.0.0.1:4000'); // initialize websocket

socket.on('data', function(data){
    // console.dir(data._source._buffers);

    // store.dispatch(updateBrainData(data._source._buffers[3][0]))
  return;
});



let fireAttentionRequest = function(){
  // console.log('firing brain data request')
  new Promise(function(resolve, reject) {
    resolve(store.getState());
  }).then(
    function(val){
      // wipe and redraw 3js Cubes
      drawCubes(geometry, val.attention, val.lastAttention, objects);
      // render React Components and Trigger request
      // for next data point
      renderAndRequest(val);
    }
  )
}

function renderAndRequest(object){
  const element = (
    <div>
      <Button variant="raised" color="primary">
        Brain to Boxes
      </Button>
      <h2>Attention is {object.attention}.</h2>
      <h2>Meditation is {object.meditation}.</h2>
    </div>

  );
  ReactDOM.render(
    element,
    document.querySelector('#root')
  );
  socket.emit('getData')
}
// once per second, log the state,render a new element, and emit a call for the next reading
setInterval(fireAttentionRequest, 1000);


// THREE.js stuff
let container;
let camera, controls, scene, renderer, geometry, difference;
let objects = [];

init();

function init() {

    container = document.createElement('div');
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 1000;

    scene = new THREE.Scene();
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
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    container.appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize, false);
    animate();
}

function drawCubes(geometry, attention, testAttention, objects) {
        // console.log('drawCubes');

        // wipe objects
        while(scene.children.length > 0){
            scene.remove(scene.children[0]);
        }

        scene.add(new THREE.AmbientLight(0x505050));

        let light = new THREE.SpotLight(0xffffff, 1.5);
        light.position.set(0, 500, 2000);
        light.castShadow = true;
        light.shadow = new THREE.LightShadow(new THREE.PerspectiveCamera(50, 1, 200, 10000));
        light.shadow.bias = -0.00022;
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        scene.add(light);
        for (let i = 0; i < attention; i++) {
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

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {

    requestAnimationFrame(animate);

    render();

}

function render() {
    // controls.update();

    renderer.render(scene, camera);

}
