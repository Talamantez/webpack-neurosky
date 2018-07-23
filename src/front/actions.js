/*
 * action types
 */
 
// export const SET_BRAIN_DATA = 'SET_BRAIN_DATA'
 
/*
 * action creators
 */
 // redux action creator: update attention
function updateBrainData(object){
     return{
       type: SET_BRAIN_DATA,
       object
     }
}

export default updateBrainData
