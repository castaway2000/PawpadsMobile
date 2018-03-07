//import libraries
import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, StatusBar, Platform, ScrollView, Switch,AsyncStorage, ActivityIndicator } from 'react-native';
import { Container, Header, Content, Button, List, ListItem, } from 'native-base';
import Constant from '../common/Constant'
import reactNativeKeyboardAwareScrollView from 'react-native-keyboard-aware-scroll-view';

import PopupDialog, { SlideAnimation, DialogTitle } from 'react-native-popup-dialog';

import RNFirebase from 'react-native-firebase';
const firebase = RNFirebase.initializeApp({ debug: false, persistence: true })

var ImagePicker = require("react-native-image-picker");

import {CachedImage} from 'react-native-img-cache';

//Type of dialog. Possible values: 1(PUBLIC_GROUP), 2(GROUP), 3(PRIVATE)

var isCamera = false;
var isGallery = false;

var isBusy = false;
var groupName = '';
var groupType = '';
var groupParticipants = '';
var adminName = '';
var userPhotoURL = ''
var currentUserid = '';
var isGroupUpdated = false

// create a component
class ChatGroupEdit extends Component {
    constructor(props){
        super(props)
        this.state = {
            groupName : '',
            groupType : '',
            groupParticipants : '',
            adminName : '',
            userPhotoURL: '',
            userPhotoPath:'',
            token: '',
            people: [],
            isparticipantsLayout: true,
            isleaveAndDeleteBtn: true,
            isgroundAvatar: true,
            isphotoAvatarIcon: true,
            isgroupTitleText: true,
            isSaveBtn: true,
            blob_id:'',
            qbusername:'',
            loading: false,
            participants_datas:[],
            tableId:'',
            isGroupUpdated:false,
        }
    }
    componentWillMount() {
        this.init()
        // StatusBar.setHidden(true);
    }

    init(){
        this.setState({ loading: true })
        var {params} = this.props.navigation.state

        AsyncStorage.getItem(Constant.USER_TABEL_ID).then((value) => {
          this.setState({tableId: value })
        })

        AsyncStorage.getItem(Constant.QB_USERID).then((value) => {
            this.setState({ userid: value })
            currentUserid = value
        })

        AsyncStorage.getItem(Constant.QB_USERID).then((currentUserId) => {

            if(params.Dialog != null && params.Dialog.type == 1) {
                this.setState({ isparticipantsLayout: false })
                if(params.Dialog.user_id != currentUserId){
                    this.setState({ isleaveAndDeleteBtn: false,})
                }
            }

            if(params.Dialog != null && currentUserId != params.Dialog.user_id){
                this.setState({
                    isgroundAvatar: false,
                    isphotoAvatarIcon: false,
                    isgroupTitleText: false,
                    isSaveBtn: false,
                    token: token
                })
            }

            this.loadData()
        })
      }

    loadData(){
        var {params} = this.props.navigation.state
        this.loadQBUserProfileFirebase(params.Dialog.user_id)
        if(params.Dialog == null) return null
        isBusy = true
        groupName = params.Dialog.name
        if(params.Dialog.type == 2){
            groupType = 'Private Group'
        }else{
            groupType = 'Channel'
        }
        var ocupantsSize = params.Dialog.occupants_ids.length
        if(ocupantsSize == 0){
            groupParticipants = 'Participants (0)'
        }else{
            groupParticipants = 'Participants (' + (ocupantsSize-1) + ')'
        }

        this.getUsersFirebase(params.Dialog.occupants_ids)
        if(params.Dialog.profileurl != null){
            userPhotoURL = params.Dialog.profileurl
        }
        this.setState({
            groupName : groupName,
            groupType : groupType,
            groupParticipants : groupParticipants,
            userPhotoURL: userPhotoURL,
        })
    }

    loadQBUserProfile(userid){
        var REQUEST_URL = Constant.USERS_URL + userid + '.json'
        fetch(REQUEST_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'QB-Token': this.state.token
            },
        })
        .then((response) => response.json())
        .then((responseData) => {
            if(responseData.full_name){
                this.setState({
                    blob_id: responseData.user.blob_id.toString(),
                    qbusername: responseData.user.full_name,
                    loading: false,
                })
            }else{
                this.setState({
                    blob_id: responseData.user.blob_id.toString(),
                    qbusername: responseData.user.login,
                    loading: false ,
                })
            }

        }).catch((e) => {
            console.log(e)
        })
    }

    loadQBUserProfileFirebase(userid) {
      firebase.database()
					.ref('/users')
					.orderByChild("id")
					.equalTo(userid.toString())
					.once("value")
					.then(snapshot => {

            let profileObj =  snapshot.val();

            if (profileObj) {
              let keys = Object.keys(profileObj);

              var profile = null;
              if (keys.length > 0) {
                profile = profileObj[keys[0]]
              }

              if (profile) {
                if(profile.full_name) {
                    this.setState({
                        qbusername: profile.full_name,
                        loading: false,
                    })
                } else {
                    this.setState({
                        qbusername: profile.login,
                        loading: false ,
                    })
                }

                if (profile["content"]) {
                  for (let item in profile["content"]) {
                    let content = profile["content"][item]
                    let blobid =  content["id"]

                    if (blobid == profile["blob_id"]) {
                      let path = "content/" + profile["firid"] + "/" + profile["content"][item]["name"]
                      console.log('path:', path);

                      firebase.storage().ref(path).getDownloadURL().then((url) => {
                        this.setState({
                            blob_id: url
                        })
                      })
                    }
                  }
                }
              }

            } else {

            }

					})
    }

    getUsers(userIdsList) {
        this.state.participants_datas = []
        var {params} = this.props.navigation.state
        if(userIdsList == null || userIdsList.length == 0){
            return null
        }
        var index = userIdsList.indexOf(params.Dialog.user_id)
        userIdsList.splice(index, 1)
        isBusy = false
        userIdsList.map((item, index) => {
            var REQUEST_URL = Constant.USERS_URL +  item.blob_id + '.json'
            fetch(REQUEST_URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'QB-Token': this.state.token
                },
            })
            .then((response) => response.json())
            .then((responseData) => {
                this.state.participants_datas.push(responseData)
            }).catch((e) => {
                console.log(e)
            })
        })
    }

    getUsersFirebase(userIdsList) {
        var {params} = this.props.navigation.state
        if(userIdsList == null || userIdsList.length == 0){
            return null
        }

        var index = userIdsList.indexOf(params.Dialog.user_id)
        userIdsList.splice(index, 1)
        isBusy = false
        userIdsList.map((item, index) => {
          firebase.database()
    					.ref('/users')
    					.orderByChild("id")
    					.equalTo(item.toString())
    					.once("value")
    					.then(snapshot => {

                let profileObj =  snapshot.val();

                if (profileObj) {
                  let keys = Object.keys(profileObj);

                  var profile = null;
                  if (keys.length > 0) {
                    profile = profileObj[keys[0]]
                  }

                  if (profile) {
                    this.state.participants_datas.push(profile)
                  }

                } else {

                }

    					})
        })
    }

    showLoading() {
        if (this.state.loading) {
			return (
				<View style={styles.loadingView}>
					<ActivityIndicator color={'black'} size={'large'}/>
				</View>
			);
		}
  }

    _onback = () => {
      const { navigation } = this.props;

      if (navigation.state.params.forcerefresh) {
        if (navigation.state.params.forcerefresh == true) {
          navigation.goBack();
          navigation.state.params.onRefresh({ isRefresh: true });
        }
      } else {
        if (this.state.isGroupUpdated) {
          navigation.goBack();
          navigation.state.params.onRefresh({ isRefresh: true });
        } else {
          navigation.goBack();
        }
      }
    }

    _onChooseProfilePicture = () => {
      this.popupDialogCamera.show()
    }

    onCamera = () => {
      isCamera = true
      isGallery = false
      this.popupDialogCamera.dismiss()
      //this.getAttachmentID()
      this.showPicker()
    }

    onGallery = () => {
      isCamera = false
      isGallery = true
      this.popupDialogCamera.dismiss()
      this.showPicker()
    }

    showPicker() {

      const options = {
        quality: 1.0,
        maxWidth: 200,
        maxHeight: 200,
        storageOptions: {
        skipBackup: true,
        cameraRoll: true,
        waitUntilSaved: true
        }
      }

      if(isCamera) {
        ImagePicker.launchCamera(options, (response)  => {
          console.log('Response = ', response);

          if (response.didCancel) {
            console.log('User cancelled image picker');
          }
          else if (response.error) {
            console.log('ImagePicker Error: ', response.error);
          }
          else if (response.customButton) {
            console.log('User tapped custom button: ', response.customButton);
          } else {
            var source = ''
            console.log("ProfileScreen.js Platform: ", Platform);
            if (Platform.OS === 'ios') {
              source = response.uri.replace('file://', '')
            } else {
              source = response.uri
            }
            console.log(source)

            this.setState ({ userPhotoURL: source, userPhotoPath:source})
          }
        });
      } else {
        ImagePicker.launchImageLibrary(options, (response)  => {
          console.log('Response = ', response);

          // console.log('Response Data = ', response.data);

          if (response.didCancel) {
            console.log('User cancelled image picker');
          }
          else if (response.error) {
            console.log('ImagePicker Error: ', response.error);
          }
          else if (response.customButton) {
            console.log('User tapped custom button: ', response.customButton);
          } else {
            var source = ''
            if (Platform.OS === 'ios') {
              source = response.uri.replace('file://', '');
            } else {
              source = response.uri;
            }
            console.log(source)
            this.setState ({ userPhotoURL: source, userPhotoPath:source})

          }
        });
      }
    }

    onCancelCamera = () => {
      this.popupDialogCamera.dismiss()
    }

    _onSaveProfile = () => {

      var {params} = this.props.navigation.state
      this.setState({ loading: true })

      if (this.state.userPhotoPath != '') {
        let imagename = "groutphoto_" + params.Dialog._id +".jpg"

        firebase.storage().ref("content/" + this.state.tableId + "/" + imagename).putFile(this.state.userPhotoURL).then(file => {

          console.log("Image uploaded successfully.",file);

          //Update content
          var milliseconds = (new Date).getTime();
          var date = new Date();

          var updatescontent = {};
          var newKeycontent = firebase.database().ref().child('content').push().key;

          let content = {
            "blob_status" : "complete",
            "content_type" : "image/jpeg",
            "created_at" : date.toISOString(),
            "id" : milliseconds,
            "name" : imagename,
            "public" : false,
            "set_completed_at" : date.toISOString(),
            "size" : 0,
            "tableId" : this.state.tableId,
            "uid" : this.uidString(),
            "updated_at" : date.toISOString(),
            "userid" : currentUserid
          }

          backgroundId = milliseconds;

            //Update User content
          updatescontent['/content/' + newKeycontent] = content;
          firebase.database().ref().update(updatescontent)

          var newKeyUsercontent = firebase.database().ref().child('users').child('content').push().key;

          var updatescontent1 = {};
          updatescontent1['/users/' + this.state.tableId  + '/content/'+ newKeyUsercontent] = content;
          firebase.database().ref().update(updatescontent1)

          //Update custom_data
          var updatescontent2 = {};
          updatescontent2['/dialog/' + params.Dialog._id + '/photo'] = milliseconds.toString()
          firebase.database().ref().update(updatescontent2)

          params.Dialog.name = this.state.groupName

          this.setState({ loading: false,isGroupUpdated:true})


          alert("Group Updated Successfully!")
        });
      } else {

        //Update custom_data
        var updatescontent2 = {};
        updatescontent2['/dialog/' + params.Dialog._id + '/name' ] = this.state.groupName
        firebase.database().ref().update(updatescontent2)

        params.Dialog.name = this.state.groupName

        this.setState({ loading: false, isGroupUpdated:true})


        alert("Group Updated Successfully!")
      }
    }

    uidString() {
      return 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

    render() {
        return (
            <View style={styles.container}>
                <ScrollView style = {styles.mscrollView}>
                    <View style = {{alignItems:'center'}}>
                        <View style = {styles.tabView}>
                            <Image source = {require('../assets/img/app_bar_bg.png')} style = {styles.tabViewBg}/>
                            <TouchableOpacity style = {styles.backButton} onPress = {this._onback}>
                                <Image source = {require('../assets/img/back.png')} style = {{width: 18, height: 18}}/>
                            </TouchableOpacity>
                            {this.state.isSaveBtn?
                                <View style = {styles.saveView}>
                                    <TouchableOpacity style = {styles.backButton} onPress = {this._onSaveProfile}>
                                        <Text style = {styles.savetxt}>Save</Text>
                                    </TouchableOpacity>
                                </View> :
                                null
                            }
                        </View>

                        <View style = {styles.bodyView}>
                            {this.state.isphotoAvatarIcon?
                                <TouchableOpacity  style = {{marginTop: 60}} onPress = {this._onChooseProfilePicture}>
                                    <Image source = {require('../assets/img/camera_grey_icon.png')} style = {{width: 24, height: 17,}}/>
                                </TouchableOpacity>:
                                <Image source = {require('../assets/img/camera_grey_icon.png')} style = {{width: 24, height: 17,marginTop: 60}}/>
                            }

                            <View style = {styles.cellView}>
                                <TextInput
                                    editable = {this.state.isphotoAvatarIcon? true: false}
                                    style = {styles.inputText}
                                    placeholder = 'Group name'
                                    onChangeText = {(text) => this.setState({groupName:text})}
                                    keyboardType = 'default'
                                    placeholderTextColor = '#515151'
                                    value = {this.state.groupName}
                                    underlineColorAndroid = 'transparent'
                                    onSubmitEditing={() => {Keyboard.dismiss()}}
                                />

                                {this.state.isphotoAvatarIcon?
                                    <Image source = {require('../assets/img/pencil_icon.png')} style = {styles.icon}/>:
                                    null
                                }

                            </View>
                            <View style = {styles.cellView}>
                                <Text style = {{fontSize: 18, color:'#515151'}}>{this.state.groupType}</Text>
                                {/*<Switch
                                    style = {{marginRight: 0}}
                                    onValueChange={(value) => this.setState({isShowMeNear: value})}
                                    onTintColor="#62DCFB"
                                    thumbTintColor="white"
                                    tintColor="lightgray"
                                    value={this.state.isShowMeNear}
                                />*/}
                            </View>
                            <View style = {styles.cellView}>
                                 <Text style = {styles.chatText}>Chat admin</Text>
                            </View>

                            <View style = {styles.chatadminView}>
                                <CachedImage source = {{
                                    uri: this.state.blob_id,
                                    }}
                                    defaultSource = {require('../assets/img/user_placeholder.png')}
                                    style = {styles.menuIcon} />
                                <Text style = {styles.menuItem}>{this.state.qbusername}</Text>
                            </View>


                            {this.state.isparticipantsLayout?
                                <View style = {styles.cellCategoryView}>
                                    <Text style = {styles.chatText}>{this.state.groupParticipants}</Text>
                                </View>:
                                null
                            }

                            <List
                                scrollEnabled = {false}
                                style = {styles.mList}
                                dataArray={this.state.participants_datas}
                                renderRow={data =>
                                    <ListItem button noBorder onPress={() => this.props.navigation.navigate('Profile', { GroupName: data.login})} style = {styles.cellItem}>
                                      {this.showCellImage(data)}
                                        <Text style = {styles.menuItem}>{data.full_name? data.full_name: data.login}</Text>
                                    </ListItem>
                                }
                            >
                            </List>
                        </View>

                        <CachedImage source = {{
                            uri: this.state.userPhotoURL ,
                            }}
                            defaultSource = {require('../assets/img/user_placeholder.png')}
                            style = {styles.userphoto} />
                            <Image source = {{
                                uri: this.state.userPhotoURL ,
                                }}
                                defaultSource = {require('../assets/img/user_placeholder.png')}
                                style = {styles.userphoto} />
                    </View>
                </ScrollView>
                {this.showLoading()}
                <PopupDialog
                            ref={(popupDialog) => { this.popupDialogCamera = popupDialog; }}
                            //dialogStyle = {styles.dialogView}
                            overlayBackgroundColor = {'black'}
                            overlayOpacity = {0.9}
                            height = {200}
                            width = {280}
                            >
                            <View style = {{backgroundColor:'white', padding: 15, borderRadius: 10}}>
                                <Text style = {{textAlign:'left', margin: 10, fontSize: 20, fontWeight: 'bold'}}>Select file</Text>
                                <TouchableOpacity onPress = {this.onCamera}>
                                    <Text style = {{textAlign:'left', fontSize: 17, marginTop: 10, marginLeft: 10}}>Take from camera</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress = {this.onGallery}>
                                    <Text style = {{textAlign:'left', fontSize: 17, marginTop: 20, marginLeft: 10}}>Choose from gallery</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress = {this.onCancelCamera}>
                                    <Text style = {{textAlign:'left', fontSize: 17, marginTop: 20, marginLeft: 10}}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </PopupDialog>
            </View>
        );
    }

    showCellImage(profile) {

      if (profile["content"]) {
        var index = 0
        for (let item in profile["content"]) {
          index = index + 1
          let content = profile["content"][item]
          let blobid =  content["id"]

          if (blobid == profile["blob_id"]) {
            let path = "content/" + profile["firid"] + "/" + profile["content"][item]["name"]
            console.log('path:', path);

            firebase.storage().ref(path).getDownloadURL().then((url) => {
              //profile.profileurl = url

              var newDs = [];
              newDs = this.state.participants_datas.slice();
              this.state.participants_datas[index].profileurl = url;
              this.state.participants_datas =  this.state.dataSource.cloneWithRows(newDs)

              this.setState({
                 participants_datas: this.state.participants_datas
               })

            })
          }
        }
      }


      return (
        <CachedImage source = {{
          uri: profile.profileurl,
        }}
        defaultSource = {require('../assets/img/user_placeholder.png')}
        style = {styles.menuIcon} />
      );
    }

  }

// define your styles
const styles = StyleSheet.create({
    container: {
        // flex: 1,
        alignItems: 'center',
        backgroundColor: 'white',
    },
    mscrollView:{
        // flex:1,
        backgroundColor: 'white',
        width: Constant.WIDTH_SCREEN,
        height: Constant.HEIGHT_SCREEN,
    },
    tabView: {
        width: Constant.WIDTH_SCREEN,
        height: 80,
        paddingLeft: 5,
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between'
    },
    tabViewBg: {
        flex: 1,
        height: 80,
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
        backgroundColor:'transparent'
    },
    bodyView: {
        flex: 1,
        // height: (Platform.OS == 'ios')?Constant.HEIGHT_SCREEN - 80:Constant.HEIGHT_SCREEN - 83,
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
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#f4f4f4'
    },
    cellCategoryView: {
        flexDirection: 'row',
        height: 50,
        width: Constant.WIDTH_SCREEN,
        paddingLeft: 20,
        paddingRight: 20,
        justifyContent:'space-between',
        alignItems: 'center',
        marginTop: 15,
    },
    cellChatView: {
        flexDirection: 'row',
        height:60,
        width: Constant.WIDTH_SCREEN,
        paddingLeft: 20,
        paddingRight: 20,
        alignItems: 'center',
        marginTop: 20,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#f4f4f4'
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
        color: Constant.APP_COLOR,
    },
    chatText: {
        fontSize: 18,
        color: '#515151'
    },
    mList: {
        flex: 1,
        width: Constant.WIDTH_SCREEN,
        backgroundColor:'white'
    },
    menuItem:{
        color: 'black',
        opacity: 1,
        fontSize: 18,
        marginLeft: 15,
    },
    menuIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    cellItem: {
        height:70,
        padding:10,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#f4f4f4'
    },
    chatadminView: {
        flexDirection: 'row',
        height: 50,
        width: Constant.WIDTH_SCREEN,
        paddingLeft: 20,
        alignItems: 'center',
        marginTop: 15,
    },
    loadingView: {
        flex: 1,
        position: 'absolute',
        top: Constant.HEIGHT_SCREEN/2
    }
});

//make this component available to the app
export default ChatGroupEdit;
