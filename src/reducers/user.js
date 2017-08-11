

var initialState = {
  isLoggedIn: false,
  is_registeration_complete: false,
  id: '',
  username: '',
  token: '',
};

function user(state = initialState, action) {
    switch(action.type){
        case 'LOGGED_IN':
            return{
                ...state,
                pos: action.data
            };
        default:
            return state
    }
}

module.exports = user;