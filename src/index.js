import _ from 'lodash';
import Kefir from 'kefir';
import io from 'socket.io-client';
import * as THREE from 'three';
import React from 'react';
import { render } from 'react-dom';
import { Router, Route, Switch } from 'react-router';
import App from 'App';

render((
  <BrowserRouter>
    <App />
  </BrowserRouter>
), document.getElementById('root'));
