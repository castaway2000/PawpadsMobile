//import libraries
import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, StatusBar, Platform, ScrollView, AsyncStorage, ActivityIndicator, Keyboard } from 'react-native';
import { Container, Header, Content, Button } from 'native-base';
import Constant from '../common/Constant'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import PopupDialog, { SlideAnimation, DialogTitle } from 'react-native-popup-dialog';

// create a component
class ProfileEdit extends Component {
    constructor(props){
        super(props)
        this.state = {
            token: '',
            userid: '',
            username:'',
            useremail: '',
            userage:'',
            usergender:'Gender',
            userhobby: '',
            userdetail: '',
            blob_id: '',
            loading:true,
        }
    }
    componentWillMount() {
        AsyncStorage.getItem(Constant.QB_TOKEN).then((token) => {
            this.setState({ token: token })
        })
        AsyncStorage.getItem(Constant.QB_USERID).then((value) => {
            this.setState({ userid: value })
        })
        this.downloadProfile()
    }
    downloadProfile(){
        AsyncStorage.getItem(Constant.QB_TOKEN).then((token) => {
            AsyncStorage.getItem(Constant.QB_USERID).then((userid) => {
                var REQUEST_URL = Constant.USERS_URL + userid + '.json'
                fetch(REQUEST_URL, {
                    method: 'GET',
                    headers: { 
                        'Content-Type': 'application/json',
                        'QB-Token': token
                    },
                })
                .then((response) => response.json())
                .then((responseData) => {
                    console.log('Edit User Profile -->')
                    console.log(responseData)
                    if(responseData.user.custom_data){
                        var json = JSON.parse(responseData.user.custom_data)
                        this.setState({ 
                            token      : token,
                            userid     : userid,
                            username   : responseData.user.login,
                            useremail  : responseData.user.email,
                            userage    : json.age.toString(),
                            usergender : json.gender,
                            userhobby  : json.hobby,
                            userdetail : json.about,
                            loading    : false,
                        }) 
                        if(responseData.user.blob_id){
                            this.setState({
                                blob_id: responseData.user.blob_id.toString()
                            })
                        }
                    }else{
                        this.setState({
                            token      : token,
                            userid     : userid,
                            username: responseData.user.login,
                            useremail  : responseData.user.email,
                            loading: false,
                        })
                        if(responseData.user.blob_id){
                            this.setState({
                                blob_id: responseData.user.blob_id.toString()
                            })
                        }
                    }
                }).catch((e) => {
                    console.log(e)
                })   
            })
        })
    }
    _onback = () => {
        this.props.navigation.goBack()
    }
    loadingView(){
        if(this.state.loading){
            return (
				<View style={styles.loadingView}>
					<ActivityIndicator color={'black'} size={'large'}/>
				</View>
			);
        }
    }
    _onSave = () => {
        data = {
            about : this.state.userdetail,
            age : parseInt(this.state.userage),
            backgroundId : -1,
            gender : this.state.usergender,
            hobby : this.state.userhobby,
        }

        // data = 'about:' + this.state.userdetail + 'age:' + parseInt(this.state.userage) + 'backgroundId:' + '-1' + 'gender:' + this.state.usergender + 'hobby:'+ this.state.userhobby

        let formdata = new FormData()
        formdata.append('user[custom_data]', JSON.stringify(data))

       var REQUEST_URL = Constant.USERS_URL + this.state.userid + '.json'
        fetch(REQUEST_URL, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'multipart/form-data',
                'QB-Token': this.state.token
            },
            body:formdata
        })
        .then((response) => response.json())
        .then((responseData) => {
            console.log('Upload User Profile -->')
            console.log(responseData)
            if(responseData.errors){
                alert(responseData.errors.email[0])
            }else{
                alert('Profile Saved')
                // this.props.navigation.goBack()
            }
        }).catch((e) => {
            console.log(e)
        }) 
    }
    _onClickedGender = () => {
        this.popupDialog.show()
    }
    onMale = () => {
        this.popupDialog.dismiss()
        this.setState ({ usergender: 'Male'})
    }
    onFemale = () => {
        this.popupDialog.dismiss()
        this.setState ({ usergender: 'Female'})
    }
    onNotset = () => {
        this.popupDialog.dismiss()
        this.setState ({ usergender: 'Gender'})
    }
    onCancel = () => {
        this.popupDialog.dismiss()
        this.setState ({ usergender: 'Gender'})
    }

    render() {
        return (
            <View style={styles.container}>
                <KeyboardAwareScrollView 
                    contentContainerStyle = {styles.container} 
                    scrollEnabled = {false}
                    style = {{backgroundColor: 'transparent'}}
                    resetScrollToCoords = {{x:0, y:0}}
                >
                    <View style = {styles.tabView}>
                        <Image source = {require('../assets/img/app_bar_bg.png')} style = {styles.tabViewBg}/>
                        <TouchableOpacity style = {styles.backButton} onPress = {this._onback}>
                            <Image source = {require('../assets/img/back.png')} style = {{width: 18, height: 18}}/>
                        </TouchableOpacity>
                        <View style = {styles.saveView}>
                            <TouchableOpacity style = {styles.backButton} onPress = {this._onback}>
                                <Image source = {require('../assets/img/camera_white_icon.png')} style = {{width: 24, height: 17, resizeMode:'contain'}}/>
                            </TouchableOpacity>
                            <TouchableOpacity style = {styles.backButton} onPress = {this._onSave}>
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
                                onSubmitEditing={() => {Keyboard.dismiss()}}
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
                                keyboardType = 'numeric'
                                maxLength = {4}
                                underlineColorAndroid = 'transparent'
                                onSubmitEditing={() => {Keyboard.dismiss()}}
                            />
                            <Image source = {require('../assets/img/pencil_icon.png')} style = {styles.icon}/>
                            <View style = {styles.lineBottom}/>
                        </View>
                        <TouchableOpacity onPress = {this._onClickedGender}>
                            <View style = {styles.cellView}>
                                <View style = {styles.lineTop}/>
                                <Text style = {this.state.usergender == 'Gender'? styles.placeHolderText : styles.inputText}>
                                    {this.state.usergender}
                                </Text>
                                <Image source = {require('../assets/img/grey_arrow_down.png')} style = {styles.icon}/>
                                <View style = {styles.lineBottom}/>
                            </View>
                        </TouchableOpacity>
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
                                onSubmitEditing={() => {Keyboard.dismiss()}}
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
                                onSubmitEditing={() => {Keyboard.dismiss()}}
                            />
                            <Image source = {require('../assets/img/pencil_icon.png')} style = {styles.icon}/>
                            <View style = {styles.lineBottom}/>
                        </View>

                    </View>
                    {this.loadingView()}
                    <Image source = {{
                        uri: Constant.BLOB_URL + this.state.blob_id + '/download.json',
                        method:'GET',
                        headers: { 
                                'Content-Type': 'application/json',
                                'QB-Token': this.state.token
                            },
                        }}
                        defaultSource = {require('../assets/img/user_placeholder.png')}
                        style = {styles.userphoto} />
                </KeyboardAwareScrollView>
                <PopupDialog
                    ref={(popupDialog) => { this.popupDialog = popupDialog; }}
                    //dialogStyle = {styles.dialogView}
                    overlayBackgroundColor = {'black'}
                    overlayOpacity = {0.9}
                    height = {240}
                    width = {280}
                >
                    <View style = {{backgroundColor:'white', padding: 15, borderRadius: 10}}>
                        <Text style = {{textAlign:'left', margin: 10, fontSize: 20, fontWeight: 'bold'}}>Select gender</Text>
                        <TouchableOpacity onPress = {this.onMale}>
                            <Text style = {{textAlign:'left', fontSize: 17, marginTop: 10, marginLeft: 20}}>Male</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress = {this.onFemale}>
                            <Text style = {{textAlign:'left', fontSize: 17, marginTop: 20, marginLeft: 20}}>Female</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress = {this.onNotset}>
                            <Text style = {{textAlign:'left', fontSize: 17, marginTop: 20, marginLeft: 20}}>Not set</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress = {this.onCancel}>
                            <Text style = {{textAlign:'right', fontSize: 17, marginTop: 25, marginRight: 10, color: Constant.APP_COLOR}}>CANCEL</Text>
                        </TouchableOpacity>
                    </View>
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
        height: 100,
        paddingLeft: 5,
        marginTop: (Platform.OS == 'ios')? 20 : StatusBar.currentHeight,
        flexDirection:'row',
        justifyContent:'space-between'
    },
    tabViewBg: {
        flex: 1,
        height: 100,
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
        top: 70
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
    },
    placeHolderText: {
        flex: 1,
        fontSize: 18,
        color: '#515151'
    },
    loadingView: {
        position:'absolute',
        justifyContent:'center',
        top: 300,
        left: Constant.WIDTH_SCREEN/2-15,
    },

});

//make this component available to the app
export default ProfileEdit;
