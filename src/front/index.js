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
import { timeSeries } from "pondjs";
import Grid from 'material-ui/Grid';
import Paper from 'material-ui/Paper';

let index = 0;
let attention = 0; // init attention value
const SET_BRAIN_DATA = 'SET_BRAIN_DATA'; // set action value
// init app state
const initialState = {
  attention: 0,
  lastAttention: 0,
  change: 0,
  eeg: {},

}

const store = createStore(attentionApp); // initialize store

// app
function attentionApp(state = initialState, action) {
    console.log(state);
    switch(action.type){
      case 'SET_BRAIN_DATA':
        return Object.assign({}, state, {
          attention: action.object.attention.attention,
          lastAttention: state.attention,
          change: -(state.attention-action.object.attention.attention),
          eeg: action.object.eeg.eeg
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
    console.dir(data);
    if( data._source._buffers[2] ){
      store.dispatch(updateBrainData(
        {
          attention: data._source._buffers[2]["0"],
          eeg: data._source._buffers[0]["0"]
        }
    ))
    } else {
      console.log('data not found')
    }
  return;
});



let fireAttentionRequest = function(){
  // console.log('firing brain data request')
  new Promise(function(resolve, reject) {
    resolve(store.getState());
  }).then(
    function(state){
      // wipe and redraw 3js Cubes
      drawCubes(geometry, state.attention, state.lastAttention, objects);
      // render React Components and Trigger request
      // for next data point
      renderAndRequest(state);
    }
  )
}



function renderAndRequest(state){
  const element = (
    <Grid item xs={6} sm={3}>
      <div id="data">
        <h2>Attention : {state.attention}</h2>
        <h2>delta : {state.eeg.delta}</h2>
        <h2>theta : {state.eeg.theta}</h2>
        <h2>loAlpha : {state.eeg.loAlpha}</h2>
        <h2>hiAlpha : {state.eeg.hiAlpha}</h2>
        <h2>loBeta : {state.eeg.loBeta}</h2>
        <h2>hiBeta : {state.eeg.hiBeta}</h2>
        <h2>loGamma : {state.eeg.loGamma}</h2>
        <h2>midGamma : {state.eeg.midGamma}</h2>
      </div>
    </Grid>
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

document.body.onload = init;

function init() {

    container = document.getElementById('container');
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
