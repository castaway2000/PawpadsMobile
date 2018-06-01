//import libraries
import React, { Component } from 'react';
import { Alert,View, Text, StyleSheet, Image, TextInput, TouchableOpacity, StatusBar, Platform, ScrollView, ActivityIndicator, TouchableHighlight,AsyncStorage } from 'react-native';
import { Container, Header, Content, Button } from 'native-base';
import Constant from '../common/Constant'
import reactNativeKeyboardAwareScrollView from 'react-native-keyboard-aware-scroll-view';
import PopupDialog, { SlideAnimation, DialogTitle } from 'react-native-popup-dialog';

import RNFirebase from 'react-native-firebase';
const firebase = RNFirebase.initializeApp({ debug: false, persistence: true })

import {CachedImage} from 'react-native-img-cache';

//Type of dialog. Possible values: 1(PUBLIC_GROUP), 2(GROUP), 3(PRIVATE)

// create a component
class UserProfile extends Component {
    constructor(props){
        super(props)
        this.state = {
            isalert: false,
            token: '',
            username:'',
            fullname:'',
            userid:'',
            userinfo:'',
            blob_id:'',
            loading:true,
            tableId:'',
            profilePictureURL: '',
            coverPictureURL: '',
        }
    }

    componentWillMount() {
        AsyncStorage.getItem(Constant.QB_TOKEN).then((token) => {
            this.setState({ token: token })
        })
        AsyncStorage.getItem(Constant.QB_USERID).then((value) => {
            this.setState({ userid: value })
        })
        //this.downloadProfile()
        console.log('UserProfile.js');

        AsyncStorage.getItem(Constant.USER_TABEL_ID).then((value) => {
          this.setState({tableId: value })
          this.downloadProfileFirebase()
        })
    }

    isMyprofile = () => {

        var {params} = this.props.navigation.state

        if (params.UserInfo.id == this.state.userid) {
            return true
        }

        return false
    }

    downloadProfile() {
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
                    console.log(responseData)
                    if(responseData.user.custom_data){
                        this.setState({
                            username: responseData.user.login,
                            userinfo: responseData.user.custom_data,
                            token: token,
                            loading: false,
                        })
                        if(responseData.user.blob_id){
                            this.setState({ blob_id: responseData.user.blob_id})
                        }
                    }else{
                        this.setState({
                            username: responseData.user.login,
                            token: token,
                            loading: false,
                        })
                        if(responseData.user.blob_id){
                            this.setState({ blob_id: responseData.user.blob_id})
                        }
                    }

                }).catch((e) => {
                    console.log(e)
                })
            })
        })
    }

    downloadProfileFirebase() {

      firebase.database()
      .ref('/users/' + this.state.tableId)
        .once("value")
        .then(snapshot => {

          this.setState({
              loading: false
          });

          if (snapshot.val()) {
            var profileObj = snapshot.val();

            if (profileObj) {

              console.log("profileObj IS a a:",profileObj);

              if (profileObj) {

                if(profileObj.custom_data) {
                    var json = JSON.parse(profileObj.custom_data)
                    this.setState({
                        username: profileObj.login,
                        fullname: profileObj.full_name,
                        userinfo: profileObj.custom_data,
                        loading: false,
                    })
                } else {
                  this.setState({
                      username: profileObj.login,
                      loading: false,
                      fullname: profileObj.full_name,
                  })
                }

                if (profileObj["content"]) {
                  for (let item in profileObj["content"]) {
                    let content = profileObj["content"][item]
                    let blobid =  content["id"]

                    if (blobid == profileObj["blob_id"]) {
                      let path = "content/" + profileObj["firid"] + "/" + profileObj["content"][item]["name"]
                      console.log('path:', path);

                      firebase.storage().ref(path).getDownloadURL().then((url) => {
                        console.log("url IS a a:",url);

                        this.setState({
                            profilePictureURL: url
                        });
                      })
                    }

                    if(profileObj.custom_data) {
                      var json = JSON.parse(profileObj.custom_data)

                      if (blobid == json["backgroundId"]) {
                        let path = "content/" + profileObj["firid"] + "/" + profileObj["content"][item]["name"]
                        console.log('path:', path);

                        firebase.storage().ref(path).getDownloadURL().then((url) => {
                          console.log("url IS a a:",url);

                          this.setState({
                              coverPictureURL: url
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

    _onback = () => {
        this.props.navigation.goBack()
    }

    showUserPhoto() {
        return(
            <CachedImage source = {{
                uri: this.state.profilePictureURL,
                }}
                defaultSource = {require('../assets/img/user_placeholder.png')}
                style = {styles.userphoto}/>
        )
    }

    showUserAbout(){
        if(this.state.userinfo.length > 0) {
            var json = JSON.parse(this.state.userinfo)
            return(
                <Text style = {styles.job}>
                    {json.about}
                </Text>
            )
        } else {
            return null
        }
    }

    showGender() {

      var json = JSON.parse(this.state.userinfo)

      console.log("this.state.userinfo.usergender ",json.usergender);

      if (json.usergender == "F") {
        return (
          <Image source ={require('../assets/img/female_icon.png')} resizeMode = "contain" style = {{width: 17, height: 23}}/>
        )
      } else {
        return (
          <Image source ={require('../assets/img/male_icon.png')} resizeMode = "contain" style = {{width: 17, height: 23}}/>
        )
      }
    }

    showUserAge(){

        if(this.state.userinfo.length > 0){
            var json = JSON.parse(this.state.userinfo)
            if(json.age > 0) {
                var today = new Date()
                var currentage = today.getFullYear() - json.age
                return(
                    <View style = {{flexDirection:'row', alignItems:'center', marginTop: 20}}>
                    {this.showGender()}
                    <Text style = {{color: 'gray'}}> Age :<Text> {currentage}</Text></Text>
                    </View>
                )
            }
        }else{
            return null
        }
    }

    showUserHobby(){
        if(this.state.userinfo.length > 0){
            var json = JSON.parse(this.state.userinfo)
            return(
                <Text style = {styles.job}>
                    {json.hobby}
                </Text>
            )
        }else{
            return null
        }
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
        return(
            <Text style = {styles.name}>
                {this.state.fullname ? this.state.fullname : this.state.username}
            </Text>
        )
    }
    onCreateDialog = () =>{
        var {params} = this.props.navigation.state
        let formdata = new FormData()
        formdata.append('type', '3')
        formdata.append('name', params.UserInfo.full_name)
        formdata.append('occupants_ids', params.UserInfo.id + ',' + this.state.userid)
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

    loadingView(){
        if(this.state.loading){
            return (
				<View style={styles.loadingView}>
					<ActivityIndicator color={'black'} size={'large'}/>
				</View>
			);
        }
    }

    showBlockButton() {

        if (this.state.isMyprofile == true) {
            return (
                <View style = {styles.buttonView}>
                <TouchableOpacity style = {styles.blockBtn}>
                    <Text style = {{color: '#de380a'}}>Block user</Text>
                </TouchableOpacity>
            </View>
            )
        } else {
            return (
                null
            )
        }
    }

    render() {
        var {params} = this.props.navigation.state
        return (
            <View style = {{backgroundColor: 'white', flex: 1}}>
                <View style={styles.container}>
                    <View style = {styles.tabView}>

                        <CachedImage source = {{
                            uri: this.state.coverPictureURL,
                            }}
                            defaultSource = {require('../assets/img/app_bar_bg.png')}
                            style = {styles.tabViewBg}/>

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
                                { this.showBlockButton() }
                            </View>
                    </View>

                    <View style = {styles.editView}>
                        { this.showUserPhoto() }
                    </View>
                    {this.loadingView()}
                </View>

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
        //marginTop: (Platform.OS == 'ios')? 20 : StatusBar.currentHeight,

    },
    backView: {
        width: Constant.WIDTH_SCREEN,
        height: 100,
        flexDirection:'row',
        alignItems:'center',
    },
    tabViewBg: {
      flex: 1,
      height: Constant.HEIGHT_SCREEN*0.25,
      width: '110%',
      position: 'absolute',
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
        top: (Platform.OS == 'ios')? Constant.HEIGHT_SCREEN/4-40 : Constant.HEIGHT_SCREEN/4-26
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
        marginTop: 10,
        marginLeft:8,
        marginRight:8,
        textAlign: 'center',
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
    },
    loadingView: {
        position:'absolute',
        justifyContent:'center',
        top: 300,
        left: Constant.WIDTH_SCREEN/2-15,
    },
});

//make this component available to the app
export default UserProfile;
