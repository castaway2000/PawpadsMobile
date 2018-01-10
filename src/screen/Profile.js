//import libraries
import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, StatusBar, Platform, ScrollView, TouchableHighlight,AsyncStorage } from 'react-native';
import { Container, Header, Content, Button } from 'native-base';
import Constant from '../common/Constant'
import reactNativeKeyboardAwareScrollView from 'react-native-keyboard-aware-scroll-view';
import PopupDialog, { SlideAnimation, DialogTitle } from 'react-native-popup-dialog';

// create a component
class Profile extends Component {
    constructor(props){
        super(props)
        this.state = {
            isalert: false,
            token: '',
            username:'',
            userage:'',
            usergender:'',
            userhobby: '',
            userdetail: '',
            userid:'',
        }
    }
    componentWillMount() {
        AsyncStorage.getItem(Constant.QB_TOKEN).then((token) => {
            this.setState({ token: token })
        })
        AsyncStorage.getItem(Constant.QB_USERID).then((value) => {
            this.setState({ userid: value })
        })
    }

    _onback = () => {
        this.props.navigation.goBack()
    }

    showAlertUserPhoto(){
        var {params} = this.props.navigation.state
        return(
            <Image source = {{
                uri: Constant.BLOB_URL + params.UserInfo.blob_id + '/download.json',
                method:'GET',
                headers: {
                        'Content-Type': 'application/json',
                        'QB-Token': this.state.token
                    },
                }}
                defaultSource = {require('../assets/img/user_placeholder.png')}
                style = {[styles.addphoto, {marginTop: -40}]}
            />
        )
    }

    showUserPhoto() {
        var {params} = this.props.navigation.state
        return(
            <Image source = {{
                uri: Constant.BLOB_URL + params.UserInfo.blob_id + '/download.json',
                method:'GET',
                headers: {
                        'Content-Type': 'application/json',
                        'QB-Token': this.state.token
                    },
                }}
                defaultSource = {require('../assets/img/user_placeholder.png')}
                style = {styles.userphoto}
            />
        )
    }

    showUserAbout(){
        var {params} = this.props.navigation.state
        var json = JSON.parse(params.UserInfo.custom_data)
        console.log(json)
        return(
                <Text style = {styles.detail}>
                    { json ?
                        json.about :
                        null
                     }
                </Text>
        )
    }

    showUserAge(){
        var {params} = this.props.navigation.state
        var json = JSON.parse(params.UserInfo.custom_data)
        if(json){
            var today = new Date()
            if(json.age > 0){
                var currentage = today.getFullYear() - json.age
                return(
                    <View style = {{flexDirection:'row', alignItems:'center', marginTop: 20}}>
                        <Image source ={require('../assets/img/male_icon.png')} style = {{width: 17, height: 23}}/>
                        <Text style = {{color: 'gray'}}> Age :<Text> {currentage}</Text></Text>
                    </View>
                )
            }
        }
    }

    showUserHobby(){
        var {params} = this.props.navigation.state
        var json = JSON.parse(params.UserInfo.custom_data)
        return(
            <Text style = {styles.job}>
                { json ?
                    json.hobby :
                    null
                    }
            </Text>
        )
    }

    showAlertUserName(){
        var {params} = this.props.navigation.state
        return(
            <Text style = {{fontWeight:'bold'}}>
                { params.UserInfo.full_name?
                    params.UserInfo.full_name :
                    params.UserInfo.login
                }
            </Text>
        )
    }

    showUserName(){
        var {params} = this.props.navigation.state
        return(
                <Text style = {styles.name}>
                    { params.UserInfo.full_name?
                        params.UserInfo.full_name :
                        params.UserInfo.login
                    }
                </Text>
        )
    }

    onCreateDialog = () =>{
        var {params} = this.props.navigation.state
        let formdata = {'type':'3', 'name': params.UserInfo.full_name, 'occupants_ids': params.UserInfo.id + ',' + this.state.userid}
        var REQUEST_URL = Constant.RETRIEVE_DIALOGS_URL
        fetch(REQUEST_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'QB-Token': this.state.token
            },
            body: formdata
        })
        .then((response) => response.json())
        .then((responseData) => {
            params.UserInfo['_id'] = responseData._id
            this.props.navigation.navigate('Chat', {GroupName: params.UserInfo.login, GroupChatting: false, Dialog: params.UserInfo, Token: this.state.token})

        }).catch((e) => {
            console.log(e)
        })
    }
    render() {
        var {params} = this.props.navigation.state
        return (

                <View style={styles.container}>
                    <View style = {styles.statusbar}/>
                    <ScrollView style = {{backgroundColor: 'white'}}>
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
                                { this.showUserName() }
                                { this.showUserHobby() }
                                { this.showUserAge() }
                                { this.showUserAbout() }

                                <View style = {styles.buttonView}>
                                    {/*<TouchableOpacity style = {styles.removeBtn}>
                                        <Text style = {{color: Constant.APP_COLOR}}>Remove from friends</Text>
                                    </TouchableOpacity>*/}
                                    <TouchableOpacity style = {styles.blockBtn}>
                                        <Text style = {{color: '#de380a'}}>Block user</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                    </View>

                    <View style = {styles.editView}>
                        <TouchableOpacity onPress={() => { this.popupDialog.show(); }}>
                            <Image source = {require('../assets/img/add_to_friend.png')} style = {styles.addphoto}/>
                        </TouchableOpacity>
                        { this.showUserPhoto() }
                        <TouchableOpacity onPress = {this.onCreateDialog} >
                            <Image source = {require('../assets/img/chat_button_new.png')} style = {styles.addphoto}/>
                        </TouchableOpacity>
                    </View>
                    </ScrollView>
                    <PopupDialog
                    ref={(popupDialog) => { this.popupDialog = popupDialog; }}
                    dialogAnimation = { new SlideAnimation({ slideFrom: 'bottom' })}
                    dialogStyle = {styles.dialogView}
                    overlayBackgroundColor = {Constant.APP_COLOR}
                    overlayOpacity = {0.9}
                    height = {50}
                >
                    <View style = {{alignItems:'center', backgroundColor:'white', padding: 10}}>
                        { this.showAlertUserPhoto() }
                        <Text style = {{textAlign:'center', marginTop: 20}}>You are about to add <Text style = {{fontWeight:'bold'}}>{ this.showAlertUserName() }</Text> to friends</Text>
                        <View style = {{width:Constant.WIDTH_SCREEN*0.7, height:1, backgroundColor:'#e4e4e4', marginTop: 25}}/>
                        <TouchableOpacity style = {{marginTop: 12}} onPress = {() => this.popupDialog.dismiss()}>
                            <Text style = {{textAlign:'center', color:'#fb5e33'}}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                    <View style = {{width:Constant.WIDTH_SCREEN*0.7, backgroundColor:'transparent', marginTop: 5}}/>
                    <TouchableHighlight style = {styles.cancelBtn} onPress = {() => this.popupDialog.dismiss()}>
                        <Text style = {styles.requestButton}>Send request</Text>
                    </TouchableHighlight>
                </PopupDialog>
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
        height: Constant.HEIGHT_SCREEN*0.25,
        paddingLeft: 5,
        // marginTop: (Platform.OS == 'ios')? 20 : StatusBar.currentHeight,
    },
    statusbar:{
        width: Constant.WIDTH_SCREEN,
        height: (Platform.OS == 'ios')? 20 : StatusBar.currentHeight,
        backgroundColor: Constant.APP_COLOR,
        position: 'absolute',
        top: 0,
        left: 0,
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
        top: (Platform.OS == 'ios')? Constant.HEIGHT_SCREEN/4-55:Constant.HEIGHT_SCREEN/4-51
    },
    mscrollView: {
        // flex: 1,
        width: Constant.WIDTH_SCREEN,
        alignItems: 'center'
    },
    name: {
        marginTop: 20,
        color: 'black',
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
    },
    requestButton: {
        textAlign:'center',
        color:'white',
        fontWeight:'bold'
    }
});

//make this component available to the app
export default Profile;
