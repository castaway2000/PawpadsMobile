
import React, {Component} from 'react';
import {
	Text,
	View,
	Image,
	AsyncStorage,
	TouchableOpacity,
} from 'react-native';
import Constant from '../../common/Constant'

import RNFirebase from 'react-native-firebase';
const firebase = RNFirebase.initializeApp({ debug: false, persistence: true })

import {CachedImage} from 'react-native-img-cache';

class ChatBoxUser extends Component {
	constructor(props) {
        super(props)
        this.state = {
					attachmentimageurl: '',
        }
    }

	downloadAttachmentimageurl(imageid) {
		console.log("imageid",imageid);
		firebase.database()
				.ref(`/content`)
				.orderByChild("id")
				.equalTo(parseInt(imageid))
				.once("value")
				.then(snapshot => {

					let contents = snapshot.val()

					if (contents) {
						var keys = Object.keys(contents);

						if (keys.length > 0) {
							let content = contents[keys[0]]

							firebase.storage().ref("content/" + content["tableId"] + "/" + content["name"]).getDownloadURL().then((url) => {
								this.setState({
									attachmentimageurl: url,
								});
							})
						}
					}
				})
	}

	showMessageBody() {

		if(this.props.messageImage.length > 0) {

			if (this.state.attachmentimageurl == '') {
				this.downloadAttachmentimageurl(this.props.messageImage[0].id)
				this.state.attachmentimageurl = ' '
			}

			return(
				<CachedImage source = {{
						uri: this.state.attachmentimageurl,
						}}
						style = {styles.messageImg}
				/>
			)
		} else if (this.props.messageSticker) {
			return(
				<View style={styles.doctorMessageImageContainer}>
					<Image source = {{
							uri: this.props.messageSticker,
							method:'GET',
							headers: {
									'Content-Type': 'application/json',
									'QB-Token': this.state.token
								},
							}}
							style = {styles.messageImg}
					/>
				</View>
			)
		} else {
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
