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
	StatusBar
} from 'react-native';
import {connect} from 'react-redux';
import Constant from '../common/Constant'
import {Actions} from 'react-native-router-flux';
import {getChatMessage, sendMessage} from '../actions';
import {colors} from '../actions/const';
import {ChatMessageBox, ChatBoxUser, ChatBoxDoctor} from './common';
class Chat extends Component {
	constructor(props) {
		super(props);
		this.state = {
			messages: this.props.chatMessages,
			loading: this.props.loading,
			protected: this.props.profile
		};
	}

	componentWillMount() {
		// this.props.getChatMessage();
		//this.animateChatBoxUser();
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
		const {messages} = this.state;
		const {doctorId, userId} = this.props;
		let tmp = messages;
		tmp.push({
			body: text,
			receiver_user_id: doctorId,
			sender_user_id: userId,
			timestamp_utc: new Date().toUTCString(),
			type: 'text'
		});
		this.setState({
			messages: tmp
		});
		Keyboard.dismiss();
		// this.props.sendMessage(text, tmp);
	}

	componentWillUnmount() {
		Keyboard.dismiss();
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps !== this.props || nextProps.chatMessages.length !== this.props.chatMessages.length) {
			this.setState({
				messages: nextProps.chatMessages,
				loading: nextProps.loading,
				profile: nextProps.profile
			});
		}
	}

	renderListMessages(item, index) {
		console.log(item, index)
		if (item.sender_user_id != this.props.doctorId) {
			return (
				<ChatBoxDoctor
					key={index}
					messageBody={item.body}
					messageSender={item.sender_name}
					messageSenderPhoto={item.photo}
					messageLocalTimestamp={(new Date(item.timestamp_utc)).toLocaleString([], {
						hour: '2-digit',
						minute: '2-digit'
					})}/>
			);
		}
		else {
			return (
				<ChatBoxUser
					key={index}
					messageBody={item.body}
					messageSender={item.sender_name}
					messageLocalTimestamp={(new Date(item.timestamp_utc)).toLocaleString([], {
						hour: '2-digit',
						minute: '2-digit'
					})}/>
			);
		}
	}

	renderChatMessage() {
		if (this.state.loading) {
			return <ActivityIndicator style={{margin: 20}} color={colors.primaryOrange} size={'large'}/>;
		}
		else {
			return this.state.messages.map((item, index) => {
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
                    <Text style = {styles.title}>{params.GroupName}</Text>

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
        marginLeft: 10,
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

export default connect(mapStateToProps, {getChatMessage, sendMessage})(Chat);

// export default Chat;
