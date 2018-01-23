
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
import RNFirebase from 'react-native-firebase';
const firebase = RNFirebase.initializeApp({ debug: false, persistence: true })

var messages = []
var currentUserid = ''

class Chat extends Component {
	constructor(props) {
		super(props);
		this.state = {
			messages: this.props.chatMessages,
			loading: true,
			protected: this.props.profile,
			token: '',
			userprofile: [],
		};
	}

	componentWillMount() {
		console.log("getChatMessageFirebase");
		this.getChatMessageFirebase()

		AsyncStorage.getItem(Constant.QB_USERID).then((value) => {
			currentUserid = value
			this.downloadLastUserFirebase()
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

    getChatMessage() {
		var {params} = this.props.navigation.state
        messages = []
        AsyncStorage.getItem(Constant.QB_TOKEN).then((value) => {
            var REQUEST_URL = Constant.GROUPCHAT_MESSAGE_URL + '?chat_dialog_id=' + params.Dialog._id + '&sort_desc=date_sent'+'&limit=50'

						console.log("URL:",REQUEST_URL);

            fetch(REQUEST_URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'QB-Token': "396746f4c6505e87ce7a1577abe9e17e6e0089b4"
                },
            })
            .then((response) => response.json())
            .then((responseData) => {
							console.log("responseData:",responseData);
                if(responseData.limit > 0) {
                    responseData.items.map((item, index) => {
                        messages.push(item)
                    })

										console.log("messages :",messages);

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

		getChatMessageFirebase() {
			var {params} = this.props.navigation.state
			messages = []

			firebase.database()
					.ref(`/chats`)
					.orderByChild("chat_dialog_id")
					.equalTo(params.Dialog._id)
					.once("value")
					.then(snapshot => {

							if (snapshot.val()) {

								let chatobj =  snapshot.val();

								let keys = Object.keys(chatobj);

								for (var i = 0; i < keys.length; i++) {

									if (!chatobj[keys[i]]["attachments"]) {
								  		chatobj[keys[i]]["attachments"] = [];
									}
									messages.push(chatobj[keys[i]])
								}

						  		console.log("messages :",messages);

									this.setState({messages:messages,loading: false})

								} else {
									this.setState({ loading: false })

							}
					})
		}

	downloadLastUser() {

		var {params} = this.props.navigation.state
		var last_message_userid = ''
        for(var j=0; j<params.Dialog.occupants_ids.length; j++){
            if(params.Dialog.occupants_ids[j] != currentUserid){
                last_message_userid = params.Dialog.occupants_ids[j].toString()
            }
        }

		AsyncStorage.getItem(Constant.QB_TOKEN).then((token) => {
			var REQUEST_URL = Constant.USERS_URL +  last_message_userid + '.json'
			fetch(REQUEST_URL, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'QB-Token':token
				},
			})
			.then((response) => response.json())
			.then((responseData) => {
				this.setState({
					userprofile: responseData.user,
				});
			}).catch((e) => {
				console.log(e)
			})
		})
    }

		downloadLastUserFirebase() {

			var {params} = this.props.navigation.state
			var last_message_userid = ''
					for(var j=0; j<params.Dialog.occupants_ids.length; j++){
							if(params.Dialog.occupants_ids[j] != currentUserid){
									last_message_userid = params.Dialog.occupants_ids[j].toString()
							}
					}

					if (last_message_userid) {
						console.log("downloadLastUser...");
							firebase.database()
									.ref(`/users`)
									.orderByChild("id")
									.equalTo(last_message_userid)
									.once("value")
									.then(snapshot => {

										if (snapshot.val()) {
											var profileObj = snapshot.val();

											if (profileObj) {
												let keys = Object.keys(profileObj);

												var profile = null;
												if (keys.length > 0) {
													profile = profileObj[keys[0]]
												}

												if (profile) {

													this.setState({
														userprofile: profile,
													});

													if (profile["content"]) {
														for (let item in profile["content"]) {
															let content = profile["content"][item]
															let blobid =  content["id"]

															if (blobid == profile["blob_id"]) {

																firebase.storage().ref("content/" + profile["firid"] + "/" + profile["content"][item]["name"]).getDownloadURL().then((url) => {
																	this.state.userprofile["profileurl"] = url;
																	this.setState({
																		userprofile: profile,
																	});
																})
															}
														}
													}
												}
											}
										}
									})
								}
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

		AsyncStorage.getItem(Constant.QB_TOKEN).then((value) => {
			let formdata = {"chat_dialog_id":params.Dialog._id,
							"message": text}
            var REQUEST_URL = Constant.GROUPCHAT_MESSAGE_URL
            fetch(REQUEST_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'QB-Token': value
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
			return <ActivityIndicator style={{margin: 200}} color={colors.primaryOrange} size={'large'}/>;
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
					<ChatMessageBox sendMessage={(text) => this.sendMessage(text)}/>
				</KeyboardAvoidingView>
			);
		} else {
			return (
				<KeyboardAvoidingView behavior='padding' style={{flex: 1}} keyboardVerticalOffset={80}>
					{this.renderScrollView()}
					<ChatMessageBox sendMessage={(text) => this.sendMessage(text)}/>
				</KeyboardAvoidingView>
			);
		}

	}

	createGroup(){
		var {params} = this.props.navigation.state
		return(
			<TouchableOpacity style = {[styles.backButton, {position:'absolute', right: 10}]} onPress = {() => this.props.navigation.navigate('Profile', {UserInfo: this.state.userprofile})}>
				<Image source = {{
					uri: Constant.BLOB_URL + params.Dialog.blob_id + '/download.json',
					method:'GET',
					headers: {
							'Content-Type': 'application/json',
							'QB-Token': params.Token,
						},
					}}
					defaultSource = {require('../assets/img/user_placeholder.png')}
					style = {styles.menuIcon} />
			</TouchableOpacity>
		)
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
					{this.createGroup()}
                </View>
                <View style = {styles.bodyView}>
                    {this.renderChat()}
                </View>
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
	menuIcon: {
		width: 30,
		height: 30,
		borderRadius: 15,
		resizeMode:'contain'
	}
};


const mapStateToProps = ({chat}) => {
	const {loading, chatMessages, error, userId, doctorId, profile} = chat;
	return {loading, chatMessages, error, userId, doctorId, profile};
};

export default connect(mapStateToProps)(Chat);

// export default ChatGroup;
