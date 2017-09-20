
import React, {Component} from 'react';
import {
	Text,
	View,
	Image,
	AsyncStorage,
	TouchableOpacity,
} from 'react-native';
import {colors} from '../../actions/const';
import Constant from '../../common/Constant'

class ChatBoxDoctor extends Component {
	constructor(props){
        super(props)
        this.state = {
            refresh:false,
			blob_id:'',
			userprofile: [],
        }
    }
	downloadLastUser(last_message_userid){
		AsyncStorage.getItem(Constant.QB_TOKEN).then((token) => {
			var REQUEST_URL = Constant.USERS_URL +  last_message_userid +'.json'
			fetch(REQUEST_URL, {
				method: 'GET',
				headers: { 
					'Content-Type': 'application/json',
					'QB-Token':token
				},
			})
			.then((response) => response.json())
			.then((responseData) => {
				console.log('->->->->->->->->')
				console.log(responseData)
				this.setState({
					userprofile: responseData.user,
					blob_id: responseData.user.blob_id,
					refresh: true,
					token: token,
				});
			}).catch((e) => {
				console.log(e)
			})
		})
        
    }

	showUserProfiel  = () => {
		// this.props.navigation.navigate('ChatGroup', {GroupName: data.name, GroupChatting: true, Dialog: data})
		this.props.navigation.navigate('Profile', {UserInfo: this.state.userprofile})
	}

	showUserphoto(){
		if(this.props.messageSenderPhoto){
			return(
				<TouchableOpacity onPress = {() => this.showUserProfiel()}>
					<Image source = {{
						uri: Constant.BLOB_URL + this.state.blob_id + '/download.json',
						method:'GET',
						headers: { 
								'Content-Type': 'application/json',
								'QB-Token': this.state.token
							},
						}}
						style={styles.messagePhoto} 
						defaultSource = {require('../../assets/img/user_placeholder.png')} />
				</TouchableOpacity>
			)
		}
		else{
			return null
		}
		
	}
	render() {
		const {doctorMessageContainer, messagesContainer, messageTime, messageText, messagePhoto} = styles;
		return (
			<View style={messagesContainer}>
				{this.state.refresh == false? this.downloadLastUser(this.props.messageSenderPhoto) : null}
				{this.showUserphoto()}
				
				<View style={doctorMessageContainer}>
					<Text style={messageText}>{this.props.messageBody}</Text>
					<Text style={messageTime}>{this.props.messageLocalTimestamp}</Text>
				</View>
			</View>
		);
	}
}

const styles = {
	messagesContainer: {
		flexDirection: 'row',
		margin: 10,
		justifyContent: 'flex-start',
		alignItems: 'center'
	},
	doctorMessageContainer: {
		borderWidth: 1,
		marginLeft: 10,
		paddingVertical: 5,
		minWidth: 100,
		maxWidth: 260,
		borderColor: 'rgba(242, 242, 242, 1)',
		justifyContent: 'flex-start',
		alignItems: 'flex-start',
		paddingHorizontal: 10,
		flexDirection: 'column',
		borderRadius: 15,
		borderBottomLeftRadius: 0,
		backgroundColor: 'rgba(242, 242, 242, 1)'
	},
	messageTime: {
		fontSize: 10,
		paddingTop: 5,
		color: 'rgba(193, 197, 201, 1)'
	},
	messageText: {
		color: '#000'
	},
	messagePhoto: {
		width: 40,
		height: 40,
		borderRadius: 20
	}

};

export {ChatBoxDoctor};