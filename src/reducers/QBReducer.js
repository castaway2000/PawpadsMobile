
import {
	QB_LOAD_SUCCESS
} from '../actions/types';

const INITIAL_STATE = {
	id: '',
    ownerid: '',
	email: '',
    login: '',

};
export default (state = INITIAL_STATE, action) => {
	switch (action.type) {
		case QB_LOAD_SUCCESS:
			return {...state, ownerid: action.ownerid,  email: action.email, login: action.login};
		default:
			return state;
	}
};