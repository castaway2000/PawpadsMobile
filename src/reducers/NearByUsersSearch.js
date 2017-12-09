var initialState = {
    nearbyusers: ''
};

function nearby_search(state = initialState, action) {
    switch(action.type){
        case 'Nearby_Result':
            return {
                ...state,
                nearbyusers: action.value
            };
        case 'Nearby_Search_Result':
            return {
                ...state,
                nearbySearchUsers: action.value
            };
        case 'Nearby_Search_ClearResult':
            return {
                ...state,
                nearbyusers: [],
            }
        default:
            return state
    }
}

module.exports = nearby_search;