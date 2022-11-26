import main from './main';
import chatReducer from "./chatReducer"
import { combineReducers } from 'redux'

const rootReducer = combineReducers({
    main,
    chatReducer,
});
export default rootReducer;