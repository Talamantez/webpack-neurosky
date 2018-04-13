import React from 'react';
import { Component } from 'react';
import ReactDOM from 'react-dom';
import Grid from 'material-ui/Grid';

function ReactAppRender(state){
  const element = (
    <Grid item xs={6} sm={3}>
      <div id="data">
        <h2>Attention :   {state.attention}     </h2>
        <h2>delta :       {state.eeg.delta}     </h2>
        <h2>theta :       {state.eeg.theta}     </h2>
        <h2>loAlpha :     {state.eeg.loAlpha}   </h2>
        <h2>hiAlpha :     {state.eeg.hiAlpha}   </h2>
        <h2>loBeta :      {state.eeg.loBeta}    </h2>
        <h2>hiBeta :      {state.eeg.hiBeta}    </h2>
        <h2>loGamma :     {state.eeg.loGamma}   </h2>
        <h2>midGamma :    {state.eeg.midGamma}  </h2>
      </div>
    </Grid>
  );
  ReactDOM.render(
    element,
    document.querySelector('#root')
  );
}

export default ReactAppRender;
