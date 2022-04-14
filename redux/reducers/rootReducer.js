import main from './main';
import chatReducers from "./chatReducers"
import { combineReducers } from 'redux'

const rootReducer = combineReducers({
    main,
    chatReducers,
});
export default rootReducer;