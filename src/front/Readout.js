import React from 'react';

class Readout extends React.Component{
  constructor(props){
    super(props)
  }
  render(){
    return (
      <div id="data">
          {
            Object.keys(this.props).map(
              (r,i) => (
                <div className='reading' key={r}> {r}: {this.props[r]}!</div>
              )
            )
          }
      </div>
    )
  }
}

export default Readout
