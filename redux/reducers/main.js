import * as t from '../actionTypes';

const main = (state = {
  name: "guest",
  loading: false,
  error: null,
}, action) => {
switch(action.type){
  case t.SET_NAME:   console.log("state", state, "action.payload", action.payload); return {...state, name: action.payload }
  case t.LOADING: return { ...state, loading: action.payload }
  case t.SIGN_OUT: return { name: "guest", loading: false }
  case t.ERROR: return {...state, error: action.payload }
  default: return { ...state };
  }
};
export default main;