import React from 'react';

class Readout extends React.Component{
  constructor(props){
    super(props)
  }
  render(){
    let readings = [
      'attention',
      'delta',
      'theta',
      'loAlpha',
      'hiAlpha',
      'loBeta',
      'hiBeta',
      'loGamma',
      'hiGamma',
    ]

    return (
      <div id="data">
          {
            readings.map(
              (r,i) => (
                <p>{r}, {this.props[r]} at index {i}!</p>
          )
        )
        }
      </div>)
  }
}

export default Readout
