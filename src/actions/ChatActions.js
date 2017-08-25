/**
 * Created by mponomarets on 7/5/17.
 */
import {
	START_LOAD_CHAT_MESSAGE,
	LOAD_CHAT_MESSAGE_SUCCESS,
	LOAD_CHAT_MESSAGE_FAIL,
	CHANGE_MESSAGE_LIST
} from './types';
import {HOST, timeoutMessage, getKeyFromStorage} from './const';
import {sendRequest, createOptions} from './http';
import {Actions} from 'react-native-router-flux';

const loadingChatMessageSuccess = (dispatch, messages, user, doctor, profile) => {
	dispatch({
		type: LOAD_CHAT_MESSAGE_SUCCESS,
		payload: messages,
		userId: user,
		doctorId: doctor,
		profile: profile
	});
};

const loadingChatMessageFail = (dispatch, error) => {
	dispatch({
		type: LOAD_CHAT_MESSAGE_FAIL,
		error: error
	});
};

export const getChatMessage = () => {
	return dispatch => {
		dispatch({type: START_LOAD_CHAT_MESSAGE});
		getKeyFromStorage('chat').then((store) => {
			const {token, email, userId, doctorId, profile} = store;
			let url = HOST + 'api/v2/mobile/chat';
			let body = 'userName=' + encodeURIComponent(email) + '&token=' + token;
			let chatOptions = createOptions('POST', body);
			sendRequest(url, chatOptions).then(result => {
				if (result === 'timeout') {
					loadingChatMessageFail(dispatch, timeoutMessage);
				}
				if (result.message && result.message.toLowerCase() === 'access denied' && result.status === 'fail') {
					Actions.auth({type: 'replace'});
				} else if (result.status === 'fail') {
					loadingChatMessageFail(dispatch, result.message);
				}
				if (result.status === 'success') {
					loadingChatMessageSuccess(dispatch, result.messages, Number(userId), Number(doctorId), profile);
				}
			});
		});
	};
};

const changeMessageArray = (dispatch, messages) => {
	dispatch({
		type: CHANGE_MESSAGE_LIST,
		payload: messages
	});
};

export const sendMessage = (text, allMessage) => {
	return dispatch => {
		getKeyFromStorage('chat').then((store) => {
			const {token, email} = store;
			let url = HOST + 'api/v2/mobile/chat';
			let body = 'userName=' + encodeURIComponent(email) + '&token=' + token + '&messageType=text&messageBody=' + encodeURIComponent(text);
			let chatOptions = createOptions('PATCH', body);
			sendRequest(url, chatOptions).then(result => {
				if (result === 'timeout') {
					loadingChatMessageFail(dispatch, timeoutMessage);
				}
				if (result.message && result.message.toLowerCase() === 'access denied' && result.status === 'fail') {
					Actions.auth({type: 'replace'});
				} else if (result.status === 'fail') {
					loadingChatMessageFail(dispatch, result.message);
				}
				if (result.status === 'success') {
					console.log('chatting success')
					changeMessageArray(dispatch, allMessage);
				}
			});
		});
	};
};



