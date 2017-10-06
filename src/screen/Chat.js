
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
        this.getChatMessage()
		
		AsyncStorage.getItem(Constant.QB_USERID).then((value) => {
			currentUserid = value
			this.downloadLastUser()
		})
	}

	componentWillReceiveProps(nextProps) {
		console.log('will receive props')
		console.log(nextProps.chatMessages)
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
            var REQUEST_URL = Constant.GROUPCHAT_MESSAGE_URL + '?chat_dialog_id=' + params.Dialog._id + '&sort_desc=date_sent'+'&limit=50'
			console.log(REQUEST_URL)
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
                    console.log(responseData)
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
	
	downloadLastUser(){
		
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
				console.log(responseData)
				this.setState({
					userprofile: responseData.user,
				});
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
	
		AsyncStorage.getItem(Constant.QB_TOKEN).then((value) => {
			let formdata = new FormData()
			formdata.append('chat_dialog_id', params.Dialog._id)
			formdata.append('message', text)
            var REQUEST_URL = Constant.GROUPCHAT_MESSAGE_URL
            fetch(REQUEST_URL, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
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
			return (
				<ChatBoxDoctor
					key={index}
					messageBody={item.message}
					latitude = {item.latitude}
					longitude = {item.longitude}
					navigation = {this.props.navigation}
					messageLocalTimestamp={(new Date(item.created_at)).toLocaleString([], {
						hour: '2-digit',
						minute: '2-digit',
						month: 'short',
						day: 'numeric',
					})}/>
			);
		}
		else {
			return (
				<ChatBoxUser
					key={index}
					messageBody={item.message}
					//messageSender={item.sender_name}
					messageLocalTimestamp={(new Date(item.created_at)).toLocaleString([], {
						hour: '2-digit',
						minute: '2-digit',
					})}/>
			);
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
		console.log('chat group user profile link')
		console.log(params)
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
