import React from 'react'

const AttentionView = () => {
  if( attention ){
    return <div>{attention}</div>
  }

  return <div> attention not found </div>

}

export default AttentionView
