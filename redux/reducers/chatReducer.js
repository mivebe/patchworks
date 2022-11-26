import * as t from '../actionTypes';

const chatReducer = (state = {
  messages: ["initial message"],
}, action) => {

switch(action.type){

  case t.SET_CHAT:
    // console.log("state", state, "action.payload", action.payload);
      return { 
        ...state,
        messages: [...state.messages, action.payload]
      };
  default:
    // console.log("default");
    return { ...state };
  }
};
export default chatReducer;