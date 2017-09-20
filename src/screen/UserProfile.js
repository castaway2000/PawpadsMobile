//import libraries
import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, StatusBar, Platform, ScrollView, TouchableHighlight, AsyncStorage } from 'react-native';
import { Container, Header, Content, Button } from 'native-base';
import Constant from '../common/Constant'
import reactNativeKeyboardAwareScrollView from 'react-native-keyboard-aware-scroll-view';
import PopupDialog, { SlideAnimation, DialogTitle } from 'react-native-popup-dialog';

// create a component
class UserProfile extends Component {
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
    componentWillMount() {
        this.loadUserData()
    }
    loadUserData(){
        AsyncStorage.getItem(Constant.USER_FULL_NAME).then((value) => {
            this.setState({ username: value })
        })
    }
    _onback = () => {
        this.props.navigation.goBack()
    }
    render() {
        return (
            <ScrollView style = {{backgroundColor: 'white'}}>
                <View style={styles.container}>
                    <View style = {styles.tabView}>
                        <Image source = {require('../assets/img/app_bar_bg.png')} style = {styles.tabViewBg}/>
                        <View style = {styles.backView}>
                            <TouchableOpacity style = {styles.backButton} onPress = {this._onback}>
                                <Image source = {require('../assets/img/back.png')} style = {{width: 18, height: 18}}/>
                            </TouchableOpacity>
                            <Text style = {styles.title}>Profile</Text>
                        </View>
                    </View>

                    <View style = {styles.bodyView}>
                            <View style = {styles.mscrollView}>
                                <Text style = {styles.name}>{this.state.username}</Text>
                                <Text style = {styles.job}>{this.state.userhobby}</Text>
                                {this.state.userage.length > 0?
                                    <View style = {{flexDirection:'row', alignItems:'center', marginTop: 20}}>
                                        <Image source ={require('../assets/img/male_icon.png')} style = {{width: 17, height: 23}}/>
                                        <Text style = {{color: 'gray'}}> Age :<Text> {this.state.userage}</Text></Text>
                                    </View> : null}
                                <Text style = {styles.detail}>{this.state.userdetail}</Text>
                                {/*<View style = {styles.buttonView}>
                                    <TouchableOpacity style = {styles.removeBtn}>
                                        <Text style = {{color: Constant.APP_COLOR}}>Remove from friends</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style = {styles.blockBtn}>
                                        <Text style = {{color: '#de380a'}}>Block user</Text>
                                    </TouchableOpacity>
                                </View>*/}
                            </View>
                    </View>

                    <View style = {styles.editView}>                        
                        <Image defaultSource = {require('../assets/img/user_placeholder.png')} style = {styles.userphoto}/>
                    </View>

                </View>
                
            </ScrollView>
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
        height: Constant.HEIGHT_SCREEN*0.25,
        paddingLeft: 5,
        marginTop: (Platform.OS == 'ios')? 20 : StatusBar.currentHeight,

    },
    backView: {
        width: Constant.WIDTH_SCREEN,
        height: 60,
        flexDirection:'row',
        alignItems:'center',
    },
    tabViewBg: {
        flex: 1,
        height: 160,
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

    bodyView: {
        flex: 1,
        width: Constant.WIDTH_SCREEN,
        backgroundColor: 'white',
        alignItems: 'center',
        paddingTop: 50
    },
    userphoto: {
        width: 100, 
        height: 100, 
        borderRadius: 50, 
    },
    addphoto: {
        width: 50, 
        height: 50, 
        borderRadius: 25,
    },
    editView: {
        width: Constant.WIDTH_SCREEN,
        height: 100,
        backgroundColor: 'transparent',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        position:'absolute',
        left: 0,
        top: (Platform.OS == 'ios')? Constant.HEIGHT_SCREEN/4-30:Constant.HEIGHT_SCREEN/4-26
    },
    mscrollView: {
        // flex: 1,
        width: Constant.WIDTH_SCREEN,
        alignItems: 'center'
    },
    name: {
        marginTop: 20,
        color: 'gray',
        fontSize: 20,
        fontWeight: 'bold'
    },
    job: {
        color: Constant.APP_COLOR,
        fontSize: 15,
        marginTop: 10
    },
    detail: {
        color: 'gray',
        fontSize: 15,
        marginTop: 20,
        textAlign: 'center',
        width: Constant.WIDTH_SCREEN*0.7
    },
    removeBtn: {
        width: Constant.WIDTH_SCREEN,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#f4f4f4'
    },
    blockBtn: {
        width: Constant.WIDTH_SCREEN,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#f4f4f4',
        marginTop: 20        
    },
    buttonView: {
        marginTop: 60
    },
    dialogView: {
        width: Constant.WIDTH_SCREEN*0.75,
        backgroundColor: 'transparent',
        justifyContent:'center',
        alignItems:'center',
        
    },
    cancelBtn: {
        backgroundColor: '#fb5e33', 
        width: Constant.WIDTH_SCREEN*0.75, 
        height: 40, 
        alignItems:'center', 
        justifyContent:'center'
    }
});

//make this component available to the app
export default UserProfile;
