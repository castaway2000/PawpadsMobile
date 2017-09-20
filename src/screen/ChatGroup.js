/**
 * Created by mponomarets on 7/5/17.
 */
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
import InvertibleScrollView from 'react-native-invertible-scroll-view';


var messages = []
var currentUserid = ''

class ChatGroup extends Component {
	constructor(props) {
		super(props);
		this.state = {
			messages: this.props.chatMessages,
			loading: true,
			protected: this.props.profile,
		};
	}

	componentWillMount() {
        this.getChatMessage()
		AsyncStorage.getItem(Constant.QB_USERID).then((value) => {
			currentUserid = value
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
                    console.log(responseData)
                    responseData.items.map((item, index) => {
                        messages.push(item)
                    })
                    this.setState({
						messages: messages,
                        loading: false
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

				console.log(newArray)
				this.setState({
					message:newArray
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
		else {
			return (
				<ChatBoxUser
					key={index}
					messageBody={item.message}
					//messageSender={item.sender_name}
					messageLocalTimestamp={(new Date(item.created_at)).toLocaleString([], {
						hour: '2-digit',
						minute: '2-digit'
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

	chatEdit(){
		var {params} = this.props.navigation.state
		if(params.GroupChatting){
			return(
				<TouchableOpacity style = {styles.backButton} onPress = {() => this.props.navigation.navigate('ChatGroupEdit')}>
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
