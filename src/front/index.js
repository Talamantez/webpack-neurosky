import { bindActionCreators } from 'redux';
import { createStore } from 'redux';
import { combineReducers } from 'redux';
import { connect } from 'react-redux';
import { isFSA } from 'flux-standard-action';
import { isError } from 'flux-standard-action';
import _ from 'lodash';
import io from 'socket.io-client';
import 'babel-polyfill';
import Button from 'material-ui/Button';
import { timeSeries } from "pondjs";

import Paper from 'material-ui/Paper';
import reactAppRender from './ReactAppRender.js'

import Muppeteer from './Muppeteer.js';

let muppeteer = new Muppeteer();

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
// redux action creator: update attention
function updateBrainData(object){
    return{
      type: SET_BRAIN_DATA,
      object
    }
}


// const socket = io('http://127.0.0.1:4000'); // initialize websocket

// socket.on('data', function(data){
//     // console.dir(data);
//     attention = data._source._buffers[2][0] || null;
//       store.dispatch(
//         updateBrainData(
//           {
//             signal: data._source._buffers[1][0],
//             attention: attention,
//             eeg: data._source._buffers[0][0]
//           }
//         )
//       )
//   return;
// });

function parseDataDispatchToStore(data){

  if(!data){
    console.log('no data')
  }else{

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
  }
}
let dataListener = function(message, callback){
  var self = this;
  self.socket = io('http://127.0.0.1:4000');
  self.socket.on(message, function(data){
      if(callback && data){
        callback(data)
      }
  });
}

let brainDataListener = new dataListener('data',  function(data){
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
      if(!muppeteer){
        console.log('waiting for muppeteer to drawCubes');
      }else{
        muppeteer.drawCubes(muppeteer.geometry, state.attention, state.lastAttention, muppeteer.objects);
      }
      // draw React App using Redux's state
      reactAppRender(state)
    }
  ).then( getData )
}


function getData() {
  brainDataListener.socket.emit('getData');
}
// once per second, log the state,render a new element, and emit a call for the next reading
setInterval(fireAttentionRequest, 1000);
