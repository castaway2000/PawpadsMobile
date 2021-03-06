var { combineReducers } = require('redux');

import AuthReducer from './AuthReducer'
import ChatReducer from './ChatReducer';
import Search from './Search'
import QBReducer from './QBReducer'
import NearByUsersSearch from './NearByUsersSearch'

module.exports = combineReducers({
    auth: AuthReducer,
    chat: ChatReducer,
    qb: QBReducer,
    Search,
    NearByUsersSearch,
 });