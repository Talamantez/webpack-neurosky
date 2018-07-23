import { bindActionCreators } from 'redux';
import { createStore } from 'redux';
import { combineReducers } from 'redux';
import { connect } from 'react-redux';
import { isFSA } from 'flux-standard-action';
import { isError } from 'flux-standard-action';
import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';

import UpdateBrainData from './UpdateBrainData.js'

import Readout from './Readout.js'

import 'babel-polyfill';

import DataListener from './DataListener.js';
import Graphics from './Graphics.js';

let graphics = new Graphics(
          document.getElementById('container'),
          document.getElementById('wrapper')
        );
console.log('\nUpdateBrainData:');
console.dir(UpdateBrainData);
console.log('\n');


let version = '8'
let index = 0;
let attention = 0; // init attention value

const SET_BRAIN_DATA = 'SET_BRAIN_DATA'; // set action value
// init redux app state
const initialState = {
  signal: 0,
  attention: 0,
  lastAttention: 0,
  change: 0,
  eeg: {},
  meditation: 0
}
const store = createStore(attentionApp); // initialize redux store
// init redux app
function attentionApp(state = initialState, action) {
    if(!action){
      throw new Error('action is not working, dear programmer')
    } else {
      switch(action.type){
        case 'SET_BRAIN_DATA':
          let attention = action.object.attention.attention;
          let eeg = action.object.eeg.eeg;
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

function mockDataDispatchToStore(){



  store.dispatch(
    UpdateBrainData(
      {
        signal: 0,
        attention: Math.floor( Math.random() * 90 ),
        eeg: {
          delta: Math.floor( Math.random() * 200000) + 100000,
          theta: Math.floor( Math.random() * 200000) + 100000,
          loBeta: Math.floor( Math.random() * 200000) + 100000,
          hiBeta: Math.floor( Math.random() * 200000) + 100000,
          loAlpha: Math.floor( Math.random() * 200000) + 100000,
          hiAlpha: Math.floor( Math.random() * 200000) + 100000,
          loGamma: Math.floor( Math.random() * 200000) + 100000,
          hiGamma: Math.floor( Math.random() * 200000) + 100000
        }
      }
    )
  )
}

function parseDataDispatchToStore(data){

  if(!data){
    console.log('no data')
  } else {

      attention = data._source._buffers[2][0] || null;
      store.dispatch(
        UpdateBrainData(
          {
            signal: data._source._buffers[1][0],
            attention: attention,
            eeg: data._source._buffers[0][0]
          }
        )
      )
  }
}

let brainDataListener = new DataListener('4000','data',  function(data){
  parseDataDispatchToStore(data);
});

let fireAttentionRequest = function(){
  console.log('V' + version)
  console.log('firing brain data request')

  new Promise(function(resolve, reject) {
    resolve(store.getState());
  }).then(
    function(state){
      // wipe and redraw 3js Cubes
      if(!graphics){
        console.log('waiting for graphics to load before drawing cubes');
      } else {
        graphics.drawCubes(
          graphics.geometry,
          state.attention,
          graphics.objects
        );
      }
      // draw React App using Redux's state
      const props = {
        attention:   state.attention,
        delta:       state.eeg.delta,
        theta:       state.eeg.theta,
        loAlpha:     state.eeg.loAlpha,
        hiAlpha:     state.eeg.hiAlpha,
        loBeta:      state.eeg.loBeta,
        hiBeta:      state.eeg.hiBeta,
        loGamma:     state.eeg.loGamma,
        hiGamma:     state.eeg.hiGamma,
      }
      const element = <Readout {...props}/>
      ReactDOM.render(
        element, document.getElementById('root')
      )
    }
  ).then( getData )
}

function getData() {
  brainDataListener.socket.emit('getData');
  // mockDataDispatchToStore();
}
// once per second, log the state,render a new element, and emit a call for the next reading
setInterval(fireAttentionRequest, 1000);
