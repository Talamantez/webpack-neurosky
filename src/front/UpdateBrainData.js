/*
 * action types
 */
 
const SET_BRAIN_DATA = 'SET_BRAIN_DATA'
 
/*
 * action creators
 */
 // redux action creator: update attention
function UpdateBrainData(object){
     return{
       type: SET_BRAIN_DATA,
       object
     }
}

export default UpdateBrainData
