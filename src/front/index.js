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

let muppeteer;
let index = 0;
let attention = 0; // init attention value


let Muppeteer = function(){
  var self = this;

  // THREE.js stuff
  self.container;
  self.camera;
  // self.controls;
  self.scene;
  self.renderer;
  self.geometry;
  self.difference;
  self.light;

  self.objects = [];
  self.init = function() {

      self.container = document.getElementById('container');
      document.body.appendChild(self.container);

      self.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);
      self.camera.position.z = 1000;

      self.scene = new THREE.Scene();
      self.scene.background = new THREE.Color(0xf0f0f0);
      self.scene.add(new THREE.AmbientLight(0x505050));

      self.light = new THREE.SpotLight(0xffffff, 1.5);
      self.light.position.set(0, 500, 2000);
      self.light.castShadow = true;
      self.light.shadow = new THREE.LightShadow(new THREE.PerspectiveCamera(50, 1, 200, 10000));
      self.light.shadow.bias = -0.00022;
      self.light.shadow.mapSize.width = 2048;
      self.light.shadow.mapSize.height = 2048;
      self.scene.add(self.light);

      self.geometry = new THREE.BoxGeometry(40, 40, 40);
      self.renderer = new THREE.WebGLRenderer({ antialias: true });
      self.renderer.setPixelRatio(window.devicePixelRatio);
      self.renderer.setSize(window.innerWidth, window.innerHeight);
      self.renderer.shadowMap.enabled = true;
      self.renderer.shadowMap.type = THREE.PCFShadowMap;

      self.container.appendChild(self.renderer.domElement);

      window.addEventListener('resize', self.onWindowResize, false);

      self.render = function() {
          // controls.update();
          console.log('rendering 3js scene')
          self.renderer.render(self.scene, self.camera);

      }
      self.onWindowResize = function() {

          self.camera.aspect = window.innerWidth / window.innerHeight;
          self.camera.updateProjectionMatrix();

          self.renderer.setSize(window.innerWidth, window.innerHeight);

      }

      self.animate();
  }

  self.drawCubes = function(geometry, attention, objects) {
          console.log('drawing cubes');
          if(self.scene){
            if(self.scene.children){
              while(self.scene.children.length > 0){
                self.scene.remove(self.scene.children[0]);
              }
            }
          }

          if(self.container){
            // console.dir(self.container);
          }else{
            console.log('self.container not found')
          }
          console.dir(self.scene);
          self.scene.add(new THREE.AmbientLight(0x505050));

          self.light = new THREE.SpotLight(0xffffff, 1.5);
          self.light.position.set(0, 500, 2000);
          self.light.castShadow = true;
          self.light.shadow = new THREE.LightShadow(new THREE.PerspectiveCamera(50, 1, 200, 10000));
          self.light.shadow.bias = -0.00022;
          self.light.shadow.mapSize.width = 2048;
          self.light.shadow.mapSize.height = 2048;
          self.scene.add(self.light);
          for (let i = 0; i < attention; i++) {
              let object = new THREE.Mesh(self.geometry, new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff }));

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

              self.scene.add(object);
              self.objects.push(object);
      }
  }


  self.animate = function() {
      // console.log('animating');
      requestAnimationFrame(self.animate);

      self.render();

  }


  self.init();
}


const SET_BRAIN_DATA = 'SET_BRAIN_DATA'; // set action value
// init app state
const initialState = {
  signal: 0,
  attention: 0,
  lastAttention: 0,
  change: 0,
  eeg: {},
  meditation: 0
}

const store = createStore(attentionApp); // initialize store

// app
function attentionApp(state = initialState, action) {
    if(!action){
      throw new Error('action is not working, dear programmer')
    }
    else{
      switch(action.type){
        case 'SET_BRAIN_DATA':
          let attention = action.object.attention.attention;
          let eeg = action.object.eeg.eeg;
          // if(action.object){
          //   console.log(action.object)
          // }
          return Object.assign({}, state, {
            attention: attention,
            lastAttention: state.attention,
            change: -(state.attention-attention),
            eeg: eeg
          })
        default:
          return state;
      }
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
    // console.dir(data);
    attention = data._source._buffers[2][0] || null;
      store.dispatch(
        updateBrainData(
          {
            signal: data._source._buffers[1][0],
            attention: attention,
            eeg: data._source._buffers[0][0]
          }
        )
      )
  return;
});

let fireAttentionRequest = function(){
  // console.log('firing brain data request')
  new Promise(function(resolve, reject) {
    resolve(store.getState());
  }).then(
    function(state){
      // wipe and redraw 3js Cubes
      if(!muppeteer){
        console.log('waiting for muppeteer to drawCubes');
      }else{
        muppeteer.drawCubes(muppeteer.geometry, state.attention, state.lastAttention, muppeteer.objects);
      }
      // console.log('Fired Attention Request. state:');
      // console.dir(state);
      // render React Components and Trigger request
      // for next data point
      render(state);
    }
  ).then( getData )
}

function render(state){
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
}

function getData() {
  socket.emit('getData');
}
// once per second, log the state,render a new element, and emit a call for the next reading
setInterval(fireAttentionRequest, 1000);
document.body.onload = function(){
  muppeteer = new Muppeteer();
  // console.log('muppeteer: ');
  // console.dir(muppeteer);
}
