
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
import RNFirebase from 'react-native-firebase';

const firebase = RNFirebase.initializeApp({ debug: false, persistence: true })

import {CachedImage} from 'react-native-img-cache';

const geofire = require('geofire');

class ChatBoxDoctor extends Component {
	constructor(props) {
        super(props)
        this.state = {
					refresh: false,
					distancerefresh: false,
					profileurl:'',
					userprofile: [],
					distance_unit: 'km',
					distance: Number,
					attachmentimageurl:'',
        }
    }

	downloadLastUser(last_message_userid) {
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

		downloadLastUserFirebase(last_message_userid) {

			console.log("last_message_userid IS a a:",last_message_userid);
			firebase.database()
					.ref(`/users`)
					.orderByChild("id")
					.equalTo(last_message_userid.toString())
					.once("value")
					.then(snapshot => {

						if (snapshot.val()) {
							var profileObj = snapshot.val();

							if (profileObj) {
								let keys = Object.keys(profileObj);

								console.log("profileObj IS a a:",profileObj);

								var profile = null;
								if (keys.length > 0) {
									profile = profileObj[keys[0]]
								}

								if (profile) {

									if (profile["content"]) {

										for (let item in profile["content"]) {
											let content = profile["content"][item]
											let blobid =  content["id"]

											if (blobid == profile["blob_id"]) {

												firebase.storage().ref("content/" + profile["firid"] + "/" + profile["content"][item]["name"]).getDownloadURL().then((url) => {
													console.log("url IS a a:",url); //profileurl
													profile.profileurl = url;
													this.setState({
														userprofile: profile,
														profileurl: url,
														refresh: true
													});

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
						}
					})
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

	showUserProfiel  = () => {
		this.props.navigation.navigate('Profile', {UserInfo: this.state.userprofile})
	}

	showUserphoto() {
		if(this.props.messageSenderPhoto){
			return(

				<TouchableOpacity onPress = {() => this.showUserProfiel()}>
					<Image source = {{
						uri: this.state.profileurl
						}}
						style={styles.messagePhoto}
						defaultSource = {require('../../assets/img/user_placeholder.png')} />
						
						{this.state.userprofile.isonline ? <View style = {styles.onlinestatus}/> : null} 
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

	calculateDistance = (lat1, lon1, lat2, lon2) => {
		let distance = 6371
		if (lat1 && lon1 && lat2 && lon2) {
			distance = parseInt(geofire.distance([lat1, lon1], [lat2, lon2]))
		}

		return distance
	}

	showUserDistance() {

		{this.state.distancerefresh == false?
			navigator.geolocation.getCurrentPosition(
				(position) => {

					var distance = this.calculateDistance(Math.round(parseFloat(this.props.latitude)), Math.round(parseFloat(this.props.longitude)), Math.round(position.coords.latitude), Math.round(position.coords.longitude))

					AsyncStorage.getItem(Constant.SETTINGS_DISTANCE_UNIT).then((value) => {
	            if(value){
	                //this.setState({ distance_unit: value })

									if (this.state.distance_unit == 'miles') {
										distance = distance/1.60934
									}

									//this.setState({distance: distance.toFixed(2),})
	            } else {
								//this.setState({ distance_unit: "miles" })
								distance = distance/1.60934
							//	this.setState({distance: distance.toFixed(2),})
							}
	        })
				},
				(error) => this.setState({error: error.message}),
            	{enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
			):
			null
		}

		return(
			<Text style={[styles.messageTime, styles.messageDistance]}>{this.state.distance} {this.state.distance_unit}</Text>
		)
	}

	showMessageBody() {

		console.log("Doctor : this.props.messageImage.length",this.props.messageImage);

		if(this.props.messageImage.length > 0){

			if (this.state.attachmentimageurl == '') {
 				this.downloadAttachmentimageurl(this.props.messageImage[0].id)
				this.state.attachmentimageurl = ' '
			}

			return(
				<View style={styles.doctorMessageImageContainer}>
					<CachedImage source = {{
							uri: this.state.attachmentimageurl,
							}}
							style = {styles.messageImg}
					/>
				</View>
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
				<View style = {styles.doctorMessageContainer}>
					<Text style = {styles.messageText}>{this.props.messageBody}</Text>
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
					{this.state.refresh == false? this.downloadLastUserFirebase(this.props.messageSenderPhoto) : null}
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
	},
	onlinestatus: { 
        borderRadius: 5,
        right: 0,
        bottom:0, 
        position: 'absolute',
        backgroundColor: "#00ff00", 
        width:10, 
        height:10
    }
};

export {ChatBoxDoctor};
