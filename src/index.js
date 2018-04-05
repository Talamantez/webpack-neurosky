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
// import AttentionContainer from './components/AttentionContainer'
// import Button from './components/Button'

// material-ui
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';

let attention = 0; // init attention value
const SET_ATTENTION = 'SET_ATTENTION'; // set action value
// init app state
const initialState = {
  attention: 0,
  lastAttention: 0
}

const store = createStore(attentionApp); // initialize store

// app
function attentionApp(state = initialState, action) {
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
// action creator: update attention
function updateAttention(number){
    return{
      type: SET_ATTENTION,
      number
    }
}


const socket = io('http://127.0.0.1:4000'); // initialize websocket

socket.on('data', function(data){
  // let attention = data._source._buffers[3][0]['attention']
  // if(attention){
  attention = store.getState()['attention'] + 1
  console.log('\nattention:\n')
  console.log(attention)
    store.dispatch(updateAttention(attention))
  // }
  return;
});
function requestData(){
  console.log(store.getState())
  const element = (
    <div>
      <h1>Hello, world!</h1>
      <h2>It is {store.getState().attention}.</h2>
    </div>
  );
  ReactDOM.render(
    element,
    document.getElementById('root')
  );
  socket.emit('getData')
}
// once per second, log the state, and emit a call for the next reading
setInterval(requestData, 1000);
