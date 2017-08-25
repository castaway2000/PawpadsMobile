var { combineReducers } = require('redux');

import user from './user'
import ChatReducer from './ChatReducer';
import Search from './Search'

module.exports = combineReducers({
    user,
    chat: ChatReducer,
    Search,
 });