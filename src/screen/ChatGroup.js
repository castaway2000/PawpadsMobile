
import React, {Component} from 'react';
import {
	View,
	Animated,
	Easing,
	ActivityIndicator,
	Platform,
	KeyboardAvoidingView,
	Keyboard,
	ScrollView,
    TouchableOpacity,
    Image,
    Text,
	StatusBar,
	ListView,
    AsyncStorage,
	RefreshControl
} from 'react-native';
import {
	START_LOAD_CHAT_MESSAGE,
	LOAD_CHAT_MESSAGE_SUCCESS,
	LOAD_CHAT_MESSAGE_FAIL,
	CHANGE_MESSAGE_LIST
} from '../actions/types';
import {connect} from 'react-redux';
import Constant from '../common/Constant'
import {Actions} from 'react-native-router-flux';
import {getChatMessage, sendMessage} from '../actions';
import {colors} from '../actions/const';
import {ChatMessageBox, ChatBoxUser, ChatBoxDoctor} from './common';
import PopupDialog, { SlideAnimation, DialogTitle } from 'react-native-popup-dialog';
var ImagePicker = require("react-native-image-picker");

var messages = []
var currentUserid = ''
var isCamera = false;
var isGallery = false;

class ChatGroup extends Component {
	constructor(props) {
		super(props);
		this.state = {
			messages: this.props.chatMessages,
			loading: true,
			protected: this.props.profile,
			token: '',
			blob_id: '',
		};
	}

	componentWillMount() {
        this.getChatMessage()
		AsyncStorage.getItem(Constant.QB_USERID).then((value) => {
			currentUserid = value
		})
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps !== this.props || nextProps.chatMessages.length !== this.props.chatMessages.length) {
			this.setState({
				messages: nextProps.chatMessages,
				loading: false
			});
		}
	}
    getChatMessage(){
		var {params} = this.props.navigation.state
        messages = []
        AsyncStorage.getItem(Constant.QB_TOKEN).then((value) => {
            var REQUEST_URL = Constant.GROUPCHAT_MESSAGE_URL + '?chat_dialog_id=' + params.Dialog._id + '&sort_desc=date_sent'+'&limit=15'
            fetch(REQUEST_URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'QB-Token': value
                },
            })
            .then((response) => response.json())
            .then((responseData) => {
                if(responseData.limit > 0){
                    responseData.items.map((item, index) => {
                        messages.push(item)
                    })
                    this.setState({
						messages: messages,
                        loading: false,
						token: value
                    })
                }else{
                    this.setState({ loading: false })
                }
            }).catch((e) => {
                console.log(e)
            })
        })
    }


	animateChatBoxUser() {
		this.animatedValue.setValue(0);
		Animated.timing(
			this.animatedValue,
			{
				toValue: 1,
				duration: 400,
				easing: Easing.linear
			}
		).start();
	}

	sendMessage(text) {
		var newArray = []
		var {params} = this.props.navigation.state
		Keyboard.dismiss();

		//Send message only with Text
		let formdata = {	'chat_dialog_id':params.Dialog._id,'message': text}
		var REQUEST_URL = Constant.GROUPCHAT_MESSAGE_URL
		fetch(REQUEST_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'QB-Token': this.state.token
			},
			body: formdata
		})
		.then((response) => response.json())
		.then((responseData) => {

			newArray.push({
				_id: responseData._id,
				attachments: responseData.attachments,
				chat_dialog_id: responseData.chat_dialog_id,
				created_at: responseData.created_at,
				date_sent: responseData.date_sent,
				delivered_ids: responseData.delivered_ids,
				message: responseData.message,
				read_ids: responseData.read_ids,
				recipient_id: responseData.recipient_id,
				sender_id: responseData.sender_id,
				updated_at: responseData.updated_at,
				read: responseData.read,
			});

			for(var i = 0; i<this.state.messages.length; i++) {
				newArray.push(this.state.messages[i])
			}

			this.setState({
				messages:newArray
			});

			var {dispatch} = this.props
			dispatch({
				type: CHANGE_MESSAGE_LIST,
				payload: newArray,
			})

		}).catch((e) => {
			console.log(e)
		})
	}

	componentWillUnmount() {
		Keyboard.dismiss();
	}

	renderListMessages(item, index) {
		var {params} = this.props.navigation.state
		if (item.sender_id != currentUserid) {
			if(item.STICKER){
				return (
					<ChatBoxDoctor
						key={index}
						messageBody={item.message}
						messageImage={item.attachments}
						messageSticker = {item.STICKER}
						latitude = {item.latitude}
						longitude = {item.longitude}
						navigation = {this.props.navigation}
						messageSenderPhoto={item.sender_id}
						messageLocalTimestamp={(new Date(item.created_at)).toLocaleString([], {
							hour: '2-digit',
							minute: '2-digit',
							month: 'short',
							day: 'numeric',
						})}/>
				);
			}else{
				return (
					<ChatBoxDoctor
						key={index}
						messageBody={item.message}
						messageImage={item.attachments}
						latitude = {item.latitude}
						longitude = {item.longitude}
						navigation = {this.props.navigation}
						messageSenderPhoto={item.sender_id}
						messageLocalTimestamp={(new Date(item.created_at)).toLocaleString([], {
							hour: '2-digit',
							minute: '2-digit',
							month: 'short',
							day: 'numeric',
						})}/>
				);
			}

		}
		else {
			if(item.STICKER){
				return (
					<ChatBoxUser
						key={index}
						messageBody={item.message}
						messageSticker = {item.STICKER}
						messageImage={item.attachments}
						token = {this.state.token}
						messageLocalTimestamp={(new Date(item.created_at)).toLocaleString([], {
							hour: '2-digit',
							minute: '2-digit'
						})}/>
				);
			}else{
				return (
					<ChatBoxUser
						key={index}
						messageBody={item.message}
						messageImage={item.attachments}
						token = {this.state.token}
						messageLocalTimestamp={(new Date(item.created_at)).toLocaleString([], {
							hour: '2-digit',
							minute: '2-digit'
						})}/>
				);
			}

		}
	}

	renderChatMessage() {
		if (this.state.loading) {
			return <ActivityIndicator style={{margin: 200}} color={'black'} size={'large'}/>;
		}
		else {
			var newArray = []
			for(var i = this.state.messages.length-1; i > -1 ;i--){
				newArray.push(this.state.messages[i])
			}
			return newArray.map((item, index) => {
				return this.renderListMessages(item, index);
			});
		}
	}

	renderScrollView() {
		return (
			<ScrollView
				onLayout={() => {
					this.scrollView.scrollToEnd({animated: true});
				}}
				onContentSizeChange={() => {
					this.scrollView.scrollToEnd({animated: false});
				}}
				ref={scrollView => this.scrollView = scrollView}>

				{this.renderChatMessage()}

			</ScrollView>
		);
	}

	renderChat() {
		if (Platform.OS === 'ios') {
			return (
				<KeyboardAvoidingView behavior='padding' style={{flex: 1}} keyboardVerticalOffset={80}>
					{this.renderScrollView()}
					<ChatMessageBox sendMessage={(text) => this.sendMessage(text)} onPressFile = {this._onClickedFile}/>
				</KeyboardAvoidingView>
			);
		} else {
			return (
				<KeyboardAvoidingView behavior='padding' style={{flex: 1}} keyboardVerticalOffset={80}>
					{this.renderScrollView()}
					<ChatMessageBox sendMessage={(text) => this.sendMessage(text)} onPressFile = {this._onClickedFile}/>
				</KeyboardAvoidingView>
			);
		}
	}

	_onClickedFile = () => {
		this.popupDialog.show()
	}

	chatEdit(){
		var {params} = this.props.navigation.state
		if(params.GroupChatting){
			return(
				<TouchableOpacity style = {styles.backButton} onPress = {() => this.props.navigation.navigate('ChatGroupEdit', {Dialog: params.Dialog})}>
					<Image source = {require('../assets/img/edit_white.png')} style = {{width: 18, height: 18, resizeMode:'contain'}}/>
				</TouchableOpacity>
			);
		}else{
			return null
		}
	}
	createGroup(){
		var {params} = this.props.navigation.state
		if(params.GroupChatting){
			return(
				<TouchableOpacity style = {[styles.backButton, {position:'absolute', right: 10}]} onPress = {() => this.props.navigation.navigate('CreateGroupChat')}>
					<Image source = {require('../assets/img/add_participant.png')} style = {{width: 26, height: 26, resizeMode:'contain'}}/>
				</TouchableOpacity>
			)
		}
		else{
			return null
		}
	}

	onCamera = () => {
		isCamera = true
		isGallery = false
        this.popupDialog.dismiss()
		this.getAttachmentID()
    }
    onGallery = () => {
		isCamera = false
		isGallery = true
        this.popupDialog.dismiss()
		this.getAttachmentID()
    }
    onCancel = () => {
        this.popupDialog.dismiss()
    }
	getAttachmentID(){
		var today = new Date()
		var yyyy = today.getFullYear().toString()
		var MM = (today.getMonth()+1).toString()
		var dd = today.getDate().toString()
		var hh = today.getHours()
		var mm = today.getMinutes()
		var ss = today.getSeconds()
		var timestamp = yyyy + MM + dd + '_' + hh + mm + ss

		var REQUEST_URL = Constant.CREATE_FILE_URL + '?blob[content_type]=image/jpeg&blob[name]=' + timestamp + '.png'
		fetch(REQUEST_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'QB-Token': this.state.token
			},
		})
		.then((response) => response.json())
		.then((responseData) => {
			this.setState({ blob_id:responseData.blob.id })
			this.showPicker()
		}).catch((e) => {
			console.log(e)
		})
	}
	showPicker() {
		const options = {
			quality: 1.0,
			maxWidth: 200,
			maxHeight: 200,
			storageOptions: {
			skipBackup: true,
			cameraRoll: true,
			waitUntilSaved: true
			}
		}
		if(isCamera){
			ImagePicker.launchCamera(options, (response)  => {
				console.log('Response = ', response);

				if (response.didCancel) {
					console.log('User cancelled image picker');
				}
				else if (response.error) {
					console.log('ImagePicker Error: ', response.error);
				}
				else if (response.customButton) {
					console.log('User tapped custom button: ', response.customButton);
				}
				else {
					var source = ''
					console.log("ProfileScreen.js Platform: ", Platform);
					if (Platform.OS === 'ios') {
						source = {uri: response.uri.replace('file://', ''), isStatic: true};
					} else {
						source = {uri: response.uri, isStatic: true};
					}
					console.log(source)
				}
			});
		}else{
			ImagePicker.launchImageLibrary(options, (response)  => {
				console.log('Response = ', response);

				// console.log('Response Data = ', response.data);

				if (response.didCancel) {
					console.log('User cancelled image picker');
				}
				else if (response.error) {
					console.log('ImagePicker Error: ', response.error);
				}
				else if (response.customButton) {
					console.log('User tapped custom button: ', response.customButton);
				}
				else {
					var source = ''
					// console.log("ProfileScreen.js Platform: ", Platform);
					// if (Platform.OS === 'ios') {
						 source = response.uri.replace('file://', '');
						// source = response.uri
					// } else {
					// 	source = {uri: response.uri, isStatic: true};
					// }
					console.log(source)
					this.sendPhotoMessage(source)
				}
			});
		}
  	}

	sendPhotoMessage(source){
		var {params} = this.props.navigation.state

		var REQUEST_URL = Constant.GROUPCHAT_MESSAGE_URL + "?chat_dialog_id=" + params.Dialog._id + "&attachments[0][id]=" + this.state.blob_id + "&attachments[0][type]=image&attachments[0][url]=" + source;
		console.log(REQUEST_URL)
		fetch(REQUEST_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'QB-Token': this.state.token
			},
		})
		.then((response) => response.json())
		.then((responseData) => {
			console.log(responseData)

			var {dispatch} = this.props
			dispatch({
				type: CHANGE_MESSAGE_LIST,
				payload: newArray,
			})

		}).catch((e) => {
			console.log(e)
		})
	}

	render() {
		var {params} = this.props.navigation.state
		return (
			<View style={styles.container}>
				<View style = {styles.tabView}>
                    <TouchableOpacity style = {styles.backButton} onPress = {() => this.props.navigation.goBack()}>
                        <Image source = {require('../assets/img/back.png')} style = {{width: 18, height: 18}}/>
                    </TouchableOpacity>
                    <Text style = {styles.title} numberOfLines = {1} ellipsizeMode = 'tail'>{params.GroupName}</Text>

					{this.chatEdit()}

					{this.createGroup()}
                </View>
                <View style = {styles.bodyView}>
                    {this.renderChat()}
                </View>

				<PopupDialog
                    ref={(popupDialog) => { this.popupDialog = popupDialog; }}
                    //dialogStyle = {styles.dialogView}
                    overlayBackgroundColor = {'black'}
                    overlayOpacity = {0.9}
                    height = {200}
                    width = {280}
                >
                    <View style = {{backgroundColor:'white', padding: 15, borderRadius: 10}}>
                        <Text style = {{textAlign:'left', margin: 10, fontSize: 20, fontWeight: 'bold'}}>Select file</Text>
                        <TouchableOpacity onPress = {this.onCamera}>
                            <Text style = {{textAlign:'left', fontSize: 17, marginTop: 10, marginLeft: 10}}>Take from camera</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress = {this.onGallery}>
                            <Text style = {{textAlign:'left', fontSize: 17, marginTop: 20, marginLeft: 10}}>Choose from gallery</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress = {this.onCancel}>
                            <Text style = {{textAlign:'left', fontSize: 17, marginTop: 20, marginLeft: 10}}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </PopupDialog>
			</View>
		);
	}
}

const styles = {
	container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: Constant.APP_COLOR,
    },
    tabView: {
        width: Constant.WIDTH_SCREEN,
        height: 60,
        paddingLeft: 5,
        marginTop: (Platform.OS == 'ios')? 20 : StatusBar.currentHeight,
        flexDirection:'row',
        alignItems:'center',
    },
    backButton: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems:'center',
    },
    title: {
        color: 'white',
		maxWidth: Constant.WIDTH_SCREEN*0.55,
        marginLeft: 5,
        fontSize: 20
    },
    bodyView: {
        // flex: 1,
        width: Constant.WIDTH_SCREEN,
		height: Constant.HEIGHT_SCREEN - 80,
        backgroundColor: 'white',
    },
};


const mapStateToProps = ({chat}) => {
	const {loading, chatMessages, error, userId, doctorId, profile} = chat;
	return {loading, chatMessages, error, userId, doctorId, profile};
};

export default connect(mapStateToProps)(ChatGroup);

// export default ChatGroup;