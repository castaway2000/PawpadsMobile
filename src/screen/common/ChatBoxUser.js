
import React, {Component} from 'react';
import {
	Text,
	View,
	Image,
	AsyncStorage,
	TouchableOpacity,
} from 'react-native';
import Constant from '../../common/Constant'

class ChatBoxUser extends Component {

	showMessageBody(){
		if(this.props.messageImage.length > 0){
			return(
				<Image source = {{
						uri: Constant.BLOB_URL + this.props.messageImage[0].id + '/download.json',
						method:'GET',
						headers: { 
								'Content-Type': 'application/json',
								'QB-Token': this.props.token
							},
						}}
						style = {styles.messageImg} 
				/>
			)
		}
		else{
			return(
				<Text style={styles.messageText}>{this.props.messageBody}</Text>
			)
		}
	}
	render() {
		const {userMessageContainer, messagesContainer, messageTime, messageText} = styles;
		return (
			<View style={messagesContainer}>
				<View style={userMessageContainer}>
					{this.showMessageBody()}
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
		justifyContent: 'flex-end',
		alignItems: 'center'
	},
	userMessageContainer: {
		borderWidth: 1,
		paddingVertical: 5,
		maxWidth: 260,
		marginRight: 10,
		borderColor: '#24A2B1',
		flexDirection: 'column',
		justifyContent: 'flex-end',
		alignItems: 'flex-end',
		paddingHorizontal: 10,
		borderRadius: 15,
		borderBottomRightRadius: 0,
		backgroundColor: '#24A2B1'

	},
	messageTime: {
		position: 'relative',
		fontSize: 10,
		paddingTop: 5,
		color: 'rgba(242, 242, 242, 1)'
	},
	messageText: {
		color: '#fff'
	},
	messageImg: {
		width: 220,
		height: 220,
		resizeMode: 'contain',
	}
};

export {ChatBoxUser};