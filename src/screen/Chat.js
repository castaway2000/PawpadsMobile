
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
	Button,
    Image,
    Text,
	StatusBar,
	ListView,
    AsyncStorage,
	RefreshControl
} from 'react-native';

import FCM, {NotificationActionType} from "react-native-fcm";
import {registerKilledListener, registerAppListener} from '../common/Listeners'
import firebaseClient from '../common/FirebaseClient'

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
import PopupDialog, { SlideAnimation, DialogTitle } from 'react-native-popup-dialog';
import GifScroller from '../components/ThirdParty/GifScroller.js';
import {CachedImage} from 'react-native-img-cache';

//Type of dialog. Possible values: 1(PUBLIC_GROUP), 2(GROUP), 3(PRIVATE)

var ImagePicker = require("react-native-image-picker");
var messages = []
var currentUserid = ''
var firbaseChatObserver = null

var isCamera = false;
var isGallery = false;

class Chat extends Component {
	constructor(props) {
		super(props);
		this.state = {
			messages: this.props.chatMessages,
			loading: true,
			protected: this.props.profile,
			token: '',
			userprofile: [],
			tableId:'',
			showGif: false,
			isblockedByMe: false,
			isblockedByOp: false,
			blockTableKey: "",
			latitude: "",
			longitude: "",
			isUserFound: true,
		};
	}

update = () => {
	this.getBlockList()
}

	componentWillMount() {
		console.log("getChatMessageFirebase");
		this.getChatMessageFirebase()

		AsyncStorage.getItem(Constant.QB_USERID).then((value) => {
			currentUserid = value
			console.log("USER ID IS:",currentUserid);
			this.downloadLastUserFirebase()
			this.getBlockList()
		})

		AsyncStorage.getItem(Constant.USER_TABEL_ID).then((value) => {
			console.log("tableId is:",value);
			this.setState({tableId: value})
		})

		AsyncStorage.getItem(Constant.USER_LATITUDE).then((value) => {
			console.log("USER_LATITUDE is:",value);
			this.setState({latitude: value})
		})

		AsyncStorage.getItem(Constant.USER_LONGITUDE).then((value) => {
			console.log("USER_LONGITUDE is:",value);
			this.setState({longitude: value})
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

	componentWillUnmount() {
		console.log("componentWillUnmount");
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
                } else {
                    this.setState({ loading: false })
                }
            }).catch((e) => {
                console.log(e)
            })
        })
    }

		onPressUnblock = () =>  {
			console.log("Unblock");
			if (this.state.blockTableKey) {
				var ref = firebase.database().ref(`/blocklist`)
				ref.child(this.state.blockTableKey).remove();
			}

			this.setState({"isblockedByMe":false})
		}

		getBlockList() {

			var {params} = this.props.navigation.state
			var last_message_userid = ''
					for(var j=0; j<params.Dialog.occupants_ids.length; j++){
							if(params.Dialog.occupants_ids[j] != currentUserid){
									last_message_userid = params.Dialog.occupants_ids[j].toString()
							}
					}

			firebase.database()
			.ref(`/blocklist`)
			.orderByChild("source_user")
			.equalTo(currentUserid.toString())
			.once("value")
			.then(snapshot => {

					if (snapshot.val()) {

						let blocklists =  snapshot.val();

						let keys = Object.keys(blocklists);

						if (keys.length > 0) {

							for (var i = 0; i < keys.length; i++) {
								let blockobj = blocklists[keys[i]]

								if (blockobj.blocked_user == last_message_userid) {
									console.log("I have blocked someone.");

									this.setState({isblockedByMe: true})
									this.setState({blockTableKey: keys[i]})
								}
							}
						}

						console.log("blockTableKey is:",this.state.blockTableKey);

						} else {
							console.log("error is:");
							this.setState({isblockedByMe:false})
						}
					})

					firebase.database()
					.ref(`/blocklist`)
					.orderByChild("blocked_user")
					.equalTo(currentUserid.toString())
					.once("value")
					.then(snapshot => {

						console.log("block list:",snapshot.val());
						
							if (snapshot.val()) {

								let blocklists =  snapshot.val();

								let keys = Object.keys(blocklists);

								if (keys.length > 0) {

									for (var i = 0; i < keys.length; i++) {
										let blockobj = blocklists[keys[i]]

										if (blockobj.source_user == last_message_userid) {
											console.log("Some one blocked me!");

											this.setState({isblockedByOp:true})

										}
									}
								}

								console.log("blocklist is:",blocklist);

								} else {
									console.log("error is:");
									this.setState({isblockedByOp:false})
								}
							})
				}

    getChatMessageFirebase() {
			var {params} = this.props.navigation.state
			messages = []

			console.log("Dialog id is:",params.Dialog._id);
			
			/*
			if (firbaseChatObserver) {
				if (firbaseChatObserver) firbaseChatObserver.off();
				if (firbaseChatObserver) firbaseChatObserver.off('child_added');
			}

				firbaseChatObserver = firebase.database().ref(`/chats`).orderByChild("chat_dialog_id").equalTo(params.Dialog._id).limitToFirst(20)

						firbaseChatObserver.on('child_added', (snapshot) => {

							console.log("firbaseChatObserver child_added:",snapshot.val());

							if (snapshot.val()) {

								let chatobj =  snapshot.val();

								if (!chatobj["attachments"]) {
										chatobj["attachments"] = [];
								}
								messages.push(chatobj)

								if (messages.length > 0) {
									messages.sort(function(a, b) {
											var keyA = a.date_sent,
													keyB = b.date_sent;
											if(keyA > keyB) return -1;
											if(keyA < keyB) return 1;
											return 0;
									});}

									console.log("messages :",messages);

									this.setState({messages:messages,loading: false})

								} else {
									this.setState({ loading: false })
								}
							})*/

			firebase.database()
					.ref(`/chats`)
					.orderByChild("chat_dialog_id")
					.limitToLast(10)
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

								if (messages.length > 0) {
									messages.sort(function(a, b) {
											var keyA = a.date_sent,
													keyB = b.date_sent;
											if(keyA > keyB) return -1;
											if(keyA < keyB) return 1;
											return 0;
									});
								}

						  		console.log("messages :",messages);

									this.setState({messages:messages,loading: false})

									this.updateChats()

								} else {
									this.setState({ loading: false })
								}
					})
		}

		updateChats() {
			var {params} = this.props.navigation.state

			if (firbaseChatObserver) {
				if (firbaseChatObserver) firbaseChatObserver.off();
				if (firbaseChatObserver) firbaseChatObserver.off('child_added');
			}

				firbaseChatObserver = firebase.database().ref(`/chats`).orderByChild("chat_dialog_id").equalTo(params.Dialog._id).limitToLast(10)

						firbaseChatObserver.on('child_added', (snapshot) => {

							console.log("firbaseChatObserver child_added:",snapshot.val());

							if (snapshot.val()) {

								let chatobj =  snapshot.val();

								if (!chatobj["attachments"]) {
										chatobj["attachments"] = [];
								}

								var isFound = false
								for (var i = 0; i < messages.length; i++) {
											let message =	messages[i]
											if (chatobj["_id"] == message["_id"]) {
												isFound = true
											}
								}

								if (!isFound) {
									messages.unshift(chatobj)
									console.log("messages :",messages);

									this.setState({messages:messages,loading: false})
									console.log("renderrenderrenderrenderrender 372");
								}

								} else {
									this.setState({ loading: false })
								}
							}
						)
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

													console.log("profile  is:",profile);

													this.setState({userprofile: profile,});

													if (profile["content"]) {
														for (let item in profile["content"]) {
															let content = profile["content"][item]
															let blobid =  content["id"]

															if (blobid == profile["blob_id"]) {

																firebase.storage().ref("content/" + profile["firid"] + "/" + profile["content"][item]["name"]).getDownloadURL().then((url) => {
																	this.state.userprofile["profileurl"] = url;
																	this.setState({userprofile: profile,});
																})
															}

															if(profile.custom_data) {
																var json = JSON.parse(profile.custom_data)

																if (blobid == json["backgroundId"]) {
																	let path = "content/" + profile["firid"] + "/" + profile["content"][item]["name"]
																	console.log('coverPictureURL path:', path);

																	firebase.storage().ref(path).getDownloadURL().then((url) => {
																		console.log("coverPictureURL IS a a:",url);
																		this.state.userprofile["coverPictureURL"] = url;
																		this.setState({userprofile: profile,});
																	})
																}
															}
														}
													}
												}
											}
										} else {
											this.setState({isUserFound:false})
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

		} else {
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
			} else {
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

				if (this.state.isblockedByMe)  {
					return (
						<KeyboardAvoidingView behavior='padding' style={{flex: 1}} keyboardVerticalOffset={80}>
						{this.renderScrollView()}
						<TouchableOpacity
						style={styles.loginScreenButton}
						onPress={this.onPressUnblock}
						underlayColor='#ffff00'>
						<Text style={styles.loginText}>Unblock</Text></TouchableOpacity>
						</KeyboardAvoidingView>
					);
				} else if (this.state.isblockedByOp) {
					return (
						<KeyboardAvoidingView behavior='padding' style={{flex: 1}} keyboardVerticalOffset={80}>
						{this.renderScrollView()}
						<TouchableOpacity
						style={styles.loginScreenButton}
						underlayColor='#ffff00'>
						<Text style={styles.loginText}>You are blocked.</Text></TouchableOpacity>
						</KeyboardAvoidingView>
					);
				} else if (!this.state.isUserFound) {
					return (
						<KeyboardAvoidingView behavior='padding' style={{flex: 1}} keyboardVerticalOffset={80}>
						{this.renderScrollView()}
						<View style={styles.loginScreenButton}>
						<Text style={styles.loginText}>User not found.</Text></View>
						</KeyboardAvoidingView>
					);
				} else {
					return (
						<KeyboardAvoidingView behavior='padding' style={{flex: 1}} keyboardVerticalOffset={80}>
						{this.renderScrollView()}
						<ChatMessageBox sendMessage={(text) => this.sendMessageFirebase(text)}
						onPressFile = {this._onClickedFile}
						onPressEmoji = {this._onClickedEmoji}
						onPressGif = {this._onClickedGif}
						onPressAdd = {this._onClickedAdd}
						giphyPicked = {this._onGiphyPicked}/>
						</KeyboardAvoidingView>
					);
				}
			}

	createGroup() {
		var {params} = this.props.navigation.state
		return(
			<TouchableOpacity style = {[styles.backButton, {position:'absolute', right: 10}]} onPress = {() => this.props.navigation.navigate('Profile', {UserInfo: this.state.userprofile, ChatVC: this})}>
				<CachedImage source = {{
					uri: this.state.userprofile["profileurl"],
					}}
					defaultSource = {require('../assets/img/user_placeholder.png')}
					style = {styles.menuIcon} />
					
					{this.state.userprofile.isonline ? <View style = {styles.onlinestatus}/> : null} 
			</TouchableOpacity>
		)
	}


		 onCamera = () => {
			 isCamera = true
			 isGallery = false
			 this.popupDialog.dismiss()
			 this.showPicker()

		 }

	    onGallery = () => {
				isCamera = false
				isGallery = true
				this.popupDialog.dismiss()
				this.showPicker()
			}

	    onCancel = () => {
				this.popupDialog.dismiss()
	    }

			_onClickedFile = () => {
				this.popupDialog.show()
			}

			_onClickedEmoji = () => {
				console.log('_onClickedEmoji');
			}

			_onClickedGif = () => {
				console.log('_onClickedGif');
			}

			_onClickedAdd = () => {
				console.log('_onClickedAdd');
			}

			_onGiphyPicked= (url) => {
				console.log('_onGiphyPicked',url);
				this.sendGIFMessageFirebase(url)
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

				if(isCamera) {
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
							this.sendPhotoMessage(source, response.fileName)
						}
					});
				} else {
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
						} else {
							var source = ''
							// console.log("ProfileScreen.js Platform: ", Platform);
							// if (Platform.OS === 'ios') {
								 source = response.uri.replace('file://', '');
								// source = response.uri
							// } else {
							// 	source = {uri: response.uri, isStatic: true};
							// }
							console.log(source)
							this.sendPhotoMessage(source, response.fileName)
						}
					});
				}
			}

			sendMessageFirebase(text) {
				console.log("Send message tapped...");

				var updates = {};
				var newKey = firebase.database().ref().child('chats').push().key;

				var {params} = this.props.navigation.state

				var milliseconds = (new Date).getTime()/1000|0;
				console.log(milliseconds);

				var date = new Date();
				console.log(date.toISOString());


				var chatdict = {
		      "_id" : newKey,
		      "chat_dialog_id" : params.Dialog._id,
		      "created_at" : date,
		      "date_sent" : milliseconds,
			  "delivered_ids" : [],
			  "latitude" : this.state.latitude,
			  "longitude" : this.state.longitude,
		      "message" : text,
		      "read" : 0,
		      "read_ids" : [],
		      "recipient_id" : "",
		      "send_to_chat" : "1",
		      "sender_id" : currentUserid,
		      "updated_at" : date,
		    }

				updates['/chats/' + newKey] = chatdict;
				firebase.database().ref().update(updates)

				//TODO: update chat dialog
				var diloagDict = {
					"last_message" : text,
					"last_message_date_sent" : milliseconds,
					"last_message_user_id" : currentUserid,
					"updated_at" : date,
				}

				firebase.database().ref('/dialog/group-chat-private/' + params.Dialog._id).update(diloagDict)

				this.updateChats()

				if (this.state.userprofile.FCMToken && this.state.userprofile.isTogglepushSelected == "true") {
					this.sendRemoteNotification(this.state.userprofile.FCMToken)
				}
			}

			sendGIFMessageFirebase(url) {
				console.log("Send message tapped...");

				var updates = {};
				var newKey = firebase.database().ref().child('chats').push().key;

				var {params} = this.props.navigation.state

				var milliseconds = (new Date).getTime()/1000|0;
				console.log(milliseconds);

				var date = new Date();
				console.log(date.toISOString());

				var chatdict = {
					"_id" : newKey,
					"STICKER": url,
					"chat_dialog_id" : params.Dialog._id,
					"created_at" : date,
					"date_sent" : milliseconds,
					"delivered_ids" : [],
					"latitude" : this.state.latitude,
					"longitude" : this.state.longitude,
					"message" : 'sticker',
					"read" : 0,
					"read_ids" : [],
					"recipient_id" : "",
					"send_to_chat" : "1",
					"sender_id" : currentUserid,
					"updated_at" : date,
				}

				updates['/chats/' + newKey] = chatdict;
				firebase.database().ref().update(updates)

				//TODO: update chat dialog
				var diloagDict = {
					"last_message" : 'sticker',
					"last_message_date_sent" : milliseconds,
					"last_message_user_id" : currentUserid,
					"updated_at" : date,
				}

				firebase.database().ref('/dialog/group-chat-private/' + params.Dialog._id).update(diloagDict)

				this.updateChats()

				if (this.state.userprofile.FCMToken && this.state.userprofile.isTogglepushSelected == "true") {
					this.sendRemoteNotification(this.state.userprofile.FCMToken)
				}
			}

			sendPhotoMessage(source, fileName) {
				//Upload Image to firebase

				firebase.storage().ref("content/" + this.state.tableId + "/" + fileName).putFile(source).then(uploadedFile => {
					
					console.log('Uploaded to firebase:', uploadedFile)

					var updates = {};
					var newKey = firebase.database().ref().child('chats').push().key;

					var {params} = this.props.navigation.state

					var milliseconds = (new Date).getTime();
					console.log(milliseconds);

					var date = new Date();
					console.log(date.toISOString());

					let chatdict = {
						"_id" : newKey,
						"attachments" : [ {
							"id" : milliseconds.toString(),
							"name" : fileName,
							"type" : "photo"
						} ],
						"chat_dialog_id" : params.Dialog._id,
						"created_at" : date.toISOString(),
						"date_sent" : milliseconds,
						"delivered_ids" : [],
						"message" : fileName,
						"read" : 1,
						"read_ids" : [ ],
						"recipient_id" : "",
						"sender_id" : currentUserid,
						"updated_at" : date.toISOString(),
						"latitude" : this.state.latitude,
						"longitude" : this.state.longitude,
					}

					updates['/chats/' + newKey] = chatdict;
					firebase.database().ref().update(updates)

					//Update content
					var updatescontent = {};
					var newKeycontent = firebase.database().ref().child('content').push().key;

					let content = {
						"blob_status" : "complete",
						"content_type" : "image/jpeg",
						"created_at" : date.toISOString(),
						"id" : milliseconds,
						"name" : fileName,
						"public" : false,
						"set_completed_at" : date.toISOString(),
						"size" : 0,
						"tableId" : this.state.tableId,
						"uid" : this.uidString(),
						"updated_at" : date.toISOString(),
						"userid" : currentUserid
					}

					updatescontent['/content/' + newKeycontent] = content;
					firebase.database().ref().update(updatescontent)

					//Update User  content
					var newKeyUsercontent = firebase.database().ref().child('users').child('content').push().key;

					updatescontent['/users/' + this.state.tableId  + '/content/'+ newKeycontent] = content;
					firebase.database().ref().update(updatescontent)

					//TODO: update chat dialog
					var diloagDict = {
						"last_message" : 'photo',
						"last_message_date_sent" : milliseconds,
						"last_message_user_id" : currentUserid,
						"updated_at" : date,
					}

					firebase.database().ref('/dialog/group-chat-private/' + params.Dialog._id).update(diloagDict)

					this.updateChats()
				})

				if (this.state.userprofile.FCMToken && this.state.userprofile.isTogglepushSelected == "true") {
					this.sendRemoteNotification(this.state.userprofile.FCMToken)
				}
			}

			uidString() {
				return 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
					var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
					return v.toString(16);
			});
		}

		sendRemoteNotification(token) {

			let platform = this.state.userprofile.Platform

			var {params} = this.props.navigation.state

			let body;
			
			if(platform === 'android') {
				body = {
					"to": token,
					"notification": {
						"title": "Pawpads",
						"body": "You have a new message.",
					},
					"data": {
						"type":"1",
						"data": params.Dialog
					}
			}
		} else {
			body = {
				"to": token,
				"notification":{
					"title": "Pawpads",
					"body": "You have a new message.",
					"sound": "default"
				},
				"data": {
					"type":"1",
					"data": params.Dialog
				},
					"priority": 10
				}
			}
			firebaseClient.send(JSON.stringify(body), "notification");
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
	menuIcon: {
		width: 30,
		height: 30,
		borderRadius: 15,
		resizeMode: 'stretch'
	},

	loginScreenButton: {
		alignItems: 'center',
		backgroundColor: '#ff0000',
		padding: 10,
		justifyContent: 'center',
		height: 50,
		marginBottom: (Platform.OS == 'ios')? 0 : 26,
	},

	loginText:{
		color: '#FFFFFF',
		fontSize: 20
	},
	onlinestatus: { 
        borderRadius: 5,
        right: 8,
        bottom:8, 
        position: 'absolute',
        backgroundColor: "#00ff00", 
        width:10, 
        height:10
    }
};


const mapStateToProps = ({chat}) => {
	const {loading, chatMessages, error, userId, doctorId, profile} = chat;
	return {loading, chatMessages, error, userId, doctorId, profile};
};

export default connect(mapStateToProps)(Chat);

// export default ChatGroup;
