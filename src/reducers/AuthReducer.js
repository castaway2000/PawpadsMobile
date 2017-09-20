
import {
	PASSWORD_CHANGED,
	LOGIN_USER_SUCCESS,
	LOGIN_USER_FAIL,
	LOGIN_USER
} from '../actions/types';

const INITIAL_STATE = {
	email: '',
	name: '',
	error: '',
	success: false,
	platform: '',
	loading: false,
	deviceDimensions: {},
	token: '',
};

export default (state = INITIAL_STATE, action) => {
	switch (action.type) {
		case PASSWORD_CHANGED:
			return {...state, password: action.payload};
		case LOGIN_USER:
			return {...state, loading: true, error: ''};
		case LOGIN_USER_SUCCESS:
			console.log(action)
			return {...state, error: '', loading: false, password: '', email: action.email, token: action.token};
		case LOGIN_USER_FAIL:
			return {...state, error: action.error, name: '', loading: false};
		default:
			return state;
	}
};
