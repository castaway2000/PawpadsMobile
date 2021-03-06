
import React, {Component} from 'react';
import {
	View,
	TextInput,
	TouchableOpacity,
	Platform,
	Text,
	Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import reactNativeKeyboardAwareScrollView from 'react-native-keyboard-aware-scroll-view';

import GifScroller from '../../components/ThirdParty/GifScroller.js';

class ChatMessageBox extends Component {
	constructor (props) {
		super(props);
		this.state = {
			text: '',
			height: 40,
			heightIOS: 100
		};
	}

	onTextChange (text) {
		this.setState({
			text: text
		});
	}

	onAttachButtonPress () {
		console.log('Attach');
	}

	renderButtonSend () {
		if (Platform.OS === 'ios') {
			return <Text style = {{color:'white', fontSize: 18}}>:3</Text>;
		} else {
			return <Text style = {{color:'white', fontSize: 18}}>:3</Text>;
		}
	}

	onButtonPress (text) {
		if (text) {
			this.props.sendMessage(text);
			this.setState({
				text: '',
				height: 40,
				showGif: false,
			});
		}
	}

	onGifButtonPress () {

		if (this.state.showGif) {
			this.setState({ showGif: false } )
			this.setState({
				heightIOS: (Platform.OS === 'ios'? 50 : 80)
			});
		} else {
			this.setState({ showGif: true } )
			this.setState({
				heightIOS:  this.state.heightIOS  + (Platform.OS === 'ios'? 100 : 100)
			});
		}
	}

	updateSize (height) {
		this.setState({
			height: height
		});
	}

	giphyPicked(url) {
		console.log(url);

		this.props.giphyPicked(url)

		this.setState({ showGif: false } )
		this.setState({
			heightIOS: 50
		});
	}

	renderGif = () => {
		const {textInputStyle} = styles;

		if (this.state.showGif) {
			return (
				<View>
					<GifScroller inputText={this.state.text}  handleGifSelect={ (url) => this.giphyPicked(url) }/>
				</View> )
			} else {
				return
			}
		}

	renderTextInput () {
		const {height} = this.state;
		const {textInputStyle} = styles;
		if (Platform.OS === 'ios') {
			return (<TextInput
				style={[textInputStyle]}
				autoCorrect={false}
				underlineColorAndroid={'transparent'}
				value={this.state.text}
				returnKeyType='go'
				placeholder={'Type a message...'}
				multiline={true}
				keyboardType='default'
				editable={true}
				onChangeText={(text) => this.onTextChange(text)}
				onSubmitEditing={event => this.onButtonPress(event.nativeEvent.text)}
				onContentSizeChange={(e) => {
					let h = e.nativeEvent.contentSize.height;
					let newHeight = h > 30 ? h + 30 : 60;
					this.setState({
						heightIOS: newHeight
					});
				}}
				maxLength={200}
			/>);
		}
		else {
			return (<TextInput
				style={[textInputStyle, {height: height}]}
				autoCorrect={false}
				value={this.state.text}
				underlineColorAndroid={'transparent'}
				returnKeyLabel='go'
				placeholder={'Type a message...'}
				multiline={true}
				onChangeText={(text) => this.onTextChange(text)}
				onSubmitEditing={event => this.onButtonPress(event.nativeEvent.text)}
				onContentSizeChange={(e) => {
					this.updateSize(e.nativeEvent.contentSize.height);
				}}
				maxLength={200}
			/>);
		}
	}

	render () {
		const {container, buttonContainer,graphicIcon} = styles;
		const {heightIOS} = this.state;
		return (
			<View style={Platform.OS === 'ios' ? [container, {height: (heightIOS+40)}] : [container, {height: (heightIOS+40)}]}>
			{this.renderGif()}
				<View style = {{flexDirection:'row', alignItems:'center'}}>
					{this.renderTextInput()}
					<TouchableOpacity style={buttonContainer} onPress={() => this.onButtonPress(this.state.text)}>
						{this.renderButtonSend()}
					</TouchableOpacity>
				</View>

				<View style = {{flexDirection:'row'}}>
					<TouchableOpacity onPress= {this.props.onPressFile}>
						<Image source = {require('../../assets/img/paper_clip.png')} style = {graphicIcon}/>
					</TouchableOpacity>
					{/*<TouchableOpacity onPress= {this.props.onPressEmoji}>
						<Image source = {require('../../assets/img/smiling-emoticon-square-face.png')} style = {graphicIcon}/>
					</TouchableOpacity>*/}
					<TouchableOpacity onPress={() => this.onGifButtonPress()}>
						<Image source = {require('../../assets/img/giphy.png')} style = {graphicIcon}/>
					</TouchableOpacity>
					{/*
					<TouchableOpacity onPress= {this.props.onPressAdd}>
						<Image source = {require('../../assets/img/add_imoji.png')} style = {graphicIcon}/>
					</TouchableOpacity>*/}
				</View>

			</View>
		);
	}
}

const styles = {
	container: {
		borderTopWidth: 1,
		borderColor: '#f2f2f2',
		bottom: 0,
		backgroundColor: '#f2f2f2',
		paddingLeft: 16,
		paddingRight: 16,
	},
	buttonContainer: {
		marginVertical: 10,
		flex: 0.1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#ea643f',
		marginLeft:7,
		height: 35,
	},
	textInputStyle: {
		flex: 0.8,
		alignItems: 'stretch',
		marginVertical: 10,
		backgroundColor: '#fff',
		borderRadius: 5,
		paddingBottom: 10,
		fontSize: 14,
		paddingTop: 10,
		paddingLeft: 10,
	},
	graphicIcon:{
		width: 24,
		height: 24,
		resizeMode: 'contain',
		marginLeft: 10
	}
};

export {ChatMessageBox};
