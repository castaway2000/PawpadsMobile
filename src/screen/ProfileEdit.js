//import libraries
import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, StatusBar, Platform, ScrollView } from 'react-native';
import { Container, Header, Content, Button } from 'native-base';
import Constant from '../common/Constant'
import reactNativeKeyboardAwareScrollView from 'react-native-keyboard-aware-scroll-view';

// create a component
class ProfileEdit extends Component {
    constructor(props){
        super(props)
        this.state = {
            username:'',
            userage:'',
            usergender:'',
            userhobby: '',
            userdetail: '',
        }
    }
    _onback = () => {
        this.props.navigation.goBack()
    }
    render() {
        return (
            <View style={styles.container}>
                <View style = {styles.tabView}>
                    <Image source = {require('../assets/img/app_bar_bg.png')} style = {styles.tabViewBg}/>
                    <TouchableOpacity style = {styles.backButton} onPress = {this._onback}>
                        <Image source = {require('../assets/img/back.png')} style = {{width: 18, height: 18}}/>
                    </TouchableOpacity>
                    <View style = {styles.saveView}>
                        <TouchableOpacity style = {styles.backButton} onPress = {this._onback}>
                            <Image source = {require('../assets/img/camera_white_icon.png')} style = {{width: 24, height: 17, resizeMode:'contain'}}/>
                        </TouchableOpacity>
                        <TouchableOpacity style = {styles.backButton} onPress = {this._onback}>
                            <Text style = {styles.savetxt}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                
                <View style = {styles.bodyView}>
                    <TouchableOpacity  style = {{marginTop: 60}}>
                        <Image source = {require('../assets/img/camera_grey_icon.png')} style = {{width: 24, height: 17,}}/>
                    </TouchableOpacity>
                    <View style = {styles.cellView}>
                        <View style = {styles.lineTop}/>
                        <TextInput
                            style = {styles.inputText}
                            placeholder = 'Full name'
                            onChangeText = {(text) => this.setState({username:text})}
                            keyboardType = 'default'
                            placeholderTextColor = '#515151'
                            value = {this.state.username}
                            underlineColorAndroid = 'transparent'
                        />
                        <Image source = {require('../assets/img/pencil_icon.png')} style = {styles.icon}/>
                        <View style = {styles.lineBottom}/>
                    </View>
                    <View style = {styles.cellView}>
                        <View style = {styles.lineTop}/>
                        <TextInput
                            style = {styles.inputText}
                            onChangeText = {(text) => this.setState({userage:text})}
                            value = {this.state.userage}
                            placeholder = 'Birth year'
                            placeholderTextColor = '#515151'
                            keyboardType = 'default'
                            underlineColorAndroid = 'transparent'
                        />
                        <Image source = {require('../assets/img/grey_arrow_down.png')} style = {styles.icon}/>
                        <View style = {styles.lineBottom}/>
                    </View>
                    <View style = {styles.cellView}>
                        <View style = {styles.lineTop}/>
                        <TextInput
                            style = {styles.inputText}
                            onChangeText = {(text) => this.setState({usergender:text})}
                            value = {this.state.usergender}
                            placeholder = 'Gender'
                            placeholderTextColor = '#515151'
                            keyboardType = 'default'
                            underlineColorAndroid = 'transparent'
                        />
                        <Image source = {require('../assets/img/grey_arrow_down.png')} style = {styles.icon}/>
                        <View style = {styles.lineBottom}/>
                    </View>
                    <View style = {styles.cellView}>
                        <View style = {styles.lineTop}/>
                        <TextInput
                            style = {styles.inputText}
                            placeholder = 'Hobby'
                            placeholderTextColor = '#515151'
                            onChangeText = {(text) => this.setState({userhobby:text})}
                            keyboardType = 'default'
                            value = {this.state.userhobby}
                            underlineColorAndroid = 'transparent'
                        />
                        <Image source = {require('../assets/img/pencil_icon.png')} style = {styles.icon}/>
                        <View style = {styles.lineBottom}/>
                    </View>
                    <View style = {styles.cellView}>
                        <View style = {styles.lineTop}/>
                        <TextInput
                            style = {styles.inputText}
                            placeholder = 'Write something about yourself'
                            placeholderTextColor = '#515151'
                            onChangeText = {(text) => this.setState({userdetail:text})}
                            keyboardType = 'default'
                            value = {this.state.userdetail}
                            underlineColorAndroid = 'transparent'
                        />
                        <Image source = {require('../assets/img/pencil_icon.png')} style = {styles.icon}/>
                        <View style = {styles.lineBottom}/>
                    </View>

                </View>
                
                <Image defaultSource = {require('../assets/img/user_placeholder.png')} style = {styles.userphoto}/>

            </View>
        );
    }
}

// define your styles
const styles = StyleSheet.create({
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
        justifyContent:'space-between'
    },
    tabViewBg: {
        flex: 1,
        height: 60,
        position: 'absolute',
        top: 0,
        left: 0,
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
        fontSize: 20,
        backgroundColor: 'transparent'
    },
    saveView: {
        flexDirection: 'row',
        paddingRight: 10,
    },
    savetxt: {
        color: 'white',
        fontSize: 15,
    },
    bodyView: {
        flex: 1,
        width: Constant.WIDTH_SCREEN,
        backgroundColor: 'white',
        alignItems: 'center'
    },
    userphoto: {
        width: 100, 
        height: 100, 
        borderRadius: 50, 
        position: 'absolute',
        top: 30
    },
    cellView: {
        flexDirection: 'row',
        height: 50,
        width: Constant.WIDTH_SCREEN,
        paddingLeft: 20,
        paddingRight: 20,
        justifyContent:'space-between',
        alignItems: 'center',
        marginTop: 30,
    },
    lineTop: {
        width: Constant.WIDTH_SCREEN,
        height: 1,
        backgroundColor: '#f4f4f4',
        position: 'absolute',
        top: 0,
        left: 0,
    },
    lineBottom: {
        width: Constant.WIDTH_SCREEN,
        height: 1,
        backgroundColor: '#f4f4f4',
        position: 'absolute',
        bottom: 0,
        left: 0,
    },
    icon: {
        width: 16,
        height: 16,
        resizeMode: 'contain',
        marginLeft: 20
    },
    inputText: {
        flex: 1,
        fontSize: 18,
        color: Constant.APP_COLOR
    }
});

//make this component available to the app
export default ProfileEdit;
