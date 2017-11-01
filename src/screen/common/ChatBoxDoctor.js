
import React, {Component} from 'react';
import {
	Text,
	View,
	Image,
	AsyncStorage,
	TouchableOpacity,
	Navigator
} from 'react-native';
import {colors} from '../../actions/const';
import Constant from '../../common/Constant'

class ChatBoxDoctor extends Component {
	constructor(props){
        super(props)
        this.state = {
            refresh: false,
			distancerefresh: false,
			blob_id:'',
			userprofile: [],
			distance_unit: 'km',
			distance: Number,
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
	showUserName(){
		return(
			<Text style={styles.messageTime}>
				{this.state.userprofile.full_name?
					this.state.userprofile.full_name:
					this.state.userprofile.login}
			</Text>
		)
	}
	degreesToRadians(degrees){
		return degrees * Math.PI/180
	}
	distanceInKmBetweenEarthCoordinates(lat1, lon1, lat2, lon2){
		var earthRadiusKm = 6371
		var dLat = this.degreesToRadians(lat2 - lat1)
		var dLon = this.degreesToRadians(lon2 - lon1)
		lat1 = this.degreesToRadians(lat1)
		lat2 = this.degreesToRadians(lat2)

		var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2)
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
		return earthRadiusKm * c
	}
	showUserDistance(){
		{this.state.distancerefresh == false?
			navigator.geolocation.getCurrentPosition(
				(position) => {
					var distance = this.distanceInKmBetweenEarthCoordinates(Math.round(this.props.latitude), Math.round(position.coords.latitude), Math.round(this.props.longitude), Math.round(position.coords.longitude))
					console.log(distance)
					this.setState({ 
						distance: distance.toFixed(2),
						distancerefresh: true,
					})
				},
				(error) => this.setState({error: error.message}),
            	{enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
			):
			null
		}
		
		return(
			<Text style={[styles.messageTime, styles.messageDistance]}>{this.state.distance} km</Text>
		)
	}

	showMessageBody(){
		if(this.props.messageImage.length > 0){
			return(
				<View style={styles.doctorMessageImageContainer}>
					<Image source = {{
							uri: Constant.BLOB_URL + this.props.messageImage[0].id + '/download.json',
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
		}else if (this.props.messageSticker) {
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
		}
		else{
			return(
				<View style={styles.doctorMessageContainer}>
					<Text style={styles.messageText}>{this.props.messageBody}</Text>
				</View>
			)
		}
		
	}
	render() {
		const {doctorMessageContainer, messagesContainer, messageTime, messageText, messagePhoto} = styles;
		return (
			<View style = {messagesContainer}>
				<Text style={messageTime}>{this.props.messageLocalTimestamp}</Text>
				<View style = {{flexDirection:'row', alignItems:'flex-end', marginTop:3}}>
					{this.state.refresh == false? this.downloadLastUser(this.props.messageSenderPhoto) : null}
					{this.showUserphoto()}
					{this.showMessageBody()}
					
				</View>
				<View style = {{flexDirection:'row', marginTop:3}}>
					{ this.showUserName()}
					{ this.showUserDistance()}
				</View>
			</View>
		);
	}
}

const styles = {
	messagesContainer: {
		marginLeft: 10,
		marginTop: 5,
		marginBottom: 5,
		alignItems: 'flex-start',
		justifyContent: 'center'
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
		borderRadius: 10,
		borderBottomLeftRadius: 0,
		backgroundColor: 'rgba(242, 242, 242, 1)'
	},
	doctorMessageImageContainer: {
		marginLeft: 10,
		paddingVertical: 5,
		minWidth: 100,
		maxWidth: 260,
		justifyContent: 'flex-start',
		alignItems: 'flex-start',
		paddingHorizontal: 10,
	},
	messageTime: {
		fontSize: 12,
		paddingTop: 5,
		color: 'rgba(190, 190, 190, 1)'
	},
	messageText: {
		color: '#000'
	},
	messagePhoto: {
		width: 30,
		height: 30,
		borderRadius: 15
	},
	messageDistance: {
		position: 'absolute',
		top: 0,
		left: 0,
		width: Constant.WIDTH_SCREEN,
		textAlign: 'center',
		backgroundColor: 'transparent'
	},
	messageImg: {
		width: 220,
		height: 220,
		resizeMode: 'contain',
	}
};

export {ChatBoxDoctor};