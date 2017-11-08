
import {Actions} from 'react-native-router-flux';
import {
	DETECT_PLATFORM,
	DEVICE_DIMENSIONS,
	EMAIL_CHANGED,
	PASSWORD_CHANGED,
	LOGIN_USER,
	LOGIN_USER_FAIL,
	LOGIN_USER_SUCCESS
} from './types';
import {AsyncStorage, Alert} from 'react-native';
import {HOST, timeoutMessage, getKeyFromStorage} from './const';
import {sendRequest, createOptions} from './http';

export const detectPlatform = (platform) => {
	return dispatch => {
		dispatch({
			type: DETECT_PLATFORM,
			payload: platform
		});
	};
};

export const getDeviceDimensions = (dimentions) => {

	return dispatch => {
		dispatch({
			type: DEVICE_DIMENSIONS,
			payload: dimentions
		});
	};
};

export const emailChanged = (text) => {
	return {
		type: EMAIL_CHANGED,
		payload: text
	};
};

export const passwordChanged = (text) => {
	return {
		type: PASSWORD_CHANGED,
		payload: text
	};
};

export const loginUser = ({email, password}) => {
	return (dispatch) => {
		dispatch({type: LOGIN_USER});
		let url = HOST + 'api/v2/mobile/login';
		let body = 'userName=' + encodeURIComponent(email) + '&password=' + password;
		let loginOptions = createOptions('POST', body);
		sendRequest(url, loginOptions)
			.then(result => {
				if (result === 'timeout') {
					loginUserFail(dispatch, timeoutMessage);
				}
				if (result.message && result.message.toLowerCase() === 'access denied' && result.status === 'fail') {
					loginUserFail(dispatch, 'Incorrect credentials');
				} else if (result.status === 'fail') {
					loginUserFail(dispatch, 'Incorrect credentials');
				}
				if (result.status === 'success') {
					let token = result.token;
					let doctorId = result.client.doctor_id;
					let userId = result.client.user_id;
					let profile = result.client.profile || '';
					setDataToStorage(dispatch, email, token, userId, doctorId, profile);
				}
			});
	};

};

const loginUserSuccess = (dispatch, email, token) => {
	dispatch({
		type: LOGIN_USER_SUCCESS,
		email: email,
		token: token
	});
	Actions.main({type: 'replace'});
};

const loginUserFail = (dispatch, message) => {
	dispatch({
		type: LOGIN_USER_FAIL,
		error: message || ''
	});
};

export const checkAuth = () => {
	return dispatch => {
		dispatch({type: LOGIN_USER});
		getKeyFromStorage().then((stores) => {
			const {token, email} = stores;
			let url = HOST + 'api/v2/mobile/login/confirm';
			let body = 'userName=' + encodeURIComponent(email) + '&token=' + token;
			if (email && token) {
				return sendRequest(url, createOptions('POST', body))
					.then(result => {
						if (result === 'timeout') {
							loginUserFail(dispatch, timeoutMessage);
						}
						if (result.message && result.message.toLowerCase() === 'access denied' && result.status === 'fail') {
							loginUserFail(dispatch);
						} else if (result.status === 'fail') {
							loginUserFail(dispatch, result.message);
						}
						if (result.status === 'success') {
							loginUserSuccess(dispatch, email, token);
						}
					});
			} else {
				loginUserFail(dispatch);
			}
		});
	};
};

const setDataToStorage = (dispatch, email, token, user_id, doctor_id, profile) => {
	let store = [['kitchry', token], ['userKitchry', email]];
	if (user_id) {
		store = [['kitchry', token], ['userKitchry', email], ['profile', profile], ['userId', user_id.toString()], ['doctorId', doctor_id.toString()]];
	}
	return AsyncStorage.multiSet(store, (err) => {
		if (err) {
			return loginUserFail(dispatch);
		} else {
			return loginUserSuccess(dispatch, email, token, profile);
		}
	});
};

const sendLogout = () => {
	getKeyFromStorage().then((stores) => {
		const {token, email} = stores;
		let url = HOST + 'api/v2/mobile/logout';
		let body = 'userName=' + encodeURIComponent(email) + '&token=' + token;
		sendRequest(url, createOptions('POST', body)).then(result => {
			if (result.status === 'success') {
				AsyncStorage.clear(() => Actions.auth({type: 'replace'}));
			}
		});
	});
};

export const logOutUser = () => {
	return dispatch => Alert.alert(
		'Confirmation:',
		'Are you sure you want to logout?',
		[
			{text: 'Yes', onPress: () => sendLogout(dispatch)},
			{text: 'No', onPress: () => console.log('Cancel Pressed'), style: 'cancel'}
		]
	);

};

