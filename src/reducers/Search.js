var initialState = {
    searchResult: ''
};

function search(state = initialState, action) {
    switch(action.type){
        case 'Search_Result':
            return {
                ...state,
                searchResult: action.value
            };
        case 'Search_ClearResult':
            return {
                ...state,
                searchResult: [],
            }
        default:
            return state
    }
}

module.exports = search;