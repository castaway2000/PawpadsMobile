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
            };
        case 'Chats_Result':
            return {
                ...state,
                chatsUsers: action.value
            };
        case 'Chats_Search_Result':
            return {
                ...state,
                chatsSearchUsers: action.value
            };
        case 'Channels_Result':
            return {
                ...state,
                channelsUsers: action.value
            };
        case 'Channels_Search_Result':
            return {
                ...state,
                channelsSearchUsers: action.value
            };


        default:
            return state
    }
}

module.exports = search;