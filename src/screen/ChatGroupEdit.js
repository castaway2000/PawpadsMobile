//import libraries
import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, Alert, TextInput, TouchableOpacity, StatusBar, Platform, ScrollView, Switch, AsyncStorage, ActivityIndicator } from 'react-native';
import { Container, Header, Content, Button, List, ListItem, } from 'native-base';
import Constant from '../common/Constant'
import reactNativeKeyboardAwareScrollView from 'react-native-keyboard-aware-scroll-view';

import PopupDialog, { SlideAnimation, DialogTitle } from 'react-native-popup-dialog';

import RNFirebase from 'react-native-firebase';
const firebase = RNFirebase.initializeApp({ debug: false, persistence: true })

var ImagePicker = require("react-native-image-picker");

import {CachedImage} from 'react-native-img-cache';
import { NavigationActions } from 'react-navigation';
//Type of dialog. Possible values: 1(PUBLIC_GROUP), 2(GROUP), 3(PRIVATE)

var isCamera = false;
var isGallery = false;

// create a component
class ChatGroupEdit extends Component {
    constructor(props){
        super(props)
        this.state = {
            groupName : '',
            groupType : '',
            groupParticipants : '',
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

    init() {

      this.state.userPhotoURL = ""

        this.setState({userPhotoURL: "" })

        var {params} = this.props.navigation.state

        AsyncStorage.getItem(Constant.USER_TABEL_ID).then((value) => {
          this.setState({tableId: value})
        })

        AsyncStorage.getItem(Constant.QB_USERID).then((value) => {

          this.setState({ userid: value})

            if(params.Dialog != null && params.Dialog.type == 1) {
                this.setState({ isparticipantsLayout: false })
                if(params.Dialog.user_id == value){
                    this.setState({ isleaveAndDeleteBtn: true,})
                } else {
                  this.setState({ isleaveAndDeleteBtn: false,})
                }
            }

            if(params.Dialog != null && value != params.Dialog.user_id){
                this.setState({
                    isgroundAvatar: false,
                    isphotoAvatarIcon: false,
                    isgroupTitleText: false,
                    isSaveBtn: false,
                })
            }

            this.loadData()
        })
      }

    loadData(){
        var {params} = this.props.navigation.state
        this.loadQBUserProfileFirebase(params.Dialog.user_id)
        if(params.Dialog == null) return null

        this.setState({groupName:params.Dialog.name})

        if(params.Dialog.type == 2) {
            this.setState({groupType:'Private Group'})
        } else {
            this.setState({groupType:'Channel'})
        }

        
        var ocupants = params.Dialog.occupants_ids
        if (ocupants) {
            var ocupantsSize = params.Dialog.occupants_ids.length
            if (ocupantsSize == 0) {
                this.setState({groupParticipants: 'Participants (0)'})
            } else {
                this.setState({groupParticipants: 'Participants (' + (ocupantsSize-1) + ')'})
            }
        } else {
            this.setState({groupParticipants: 'Participants (0)'})
        }


        this.getUsersFirebase(params.Dialog.occupants_ids)
        if(params.Dialog.profileurl != null){
            userPhotoURL = params.Dialog.profileurl
            this.setState({userPhotoURL: userPhotoURL})
        }
        this.setState({
            groupName : this.state.groupName,
            groupType : this.state.groupType,
            groupParticipants : this.state.groupParticipants,
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

    	if (this.props.navigation.state.params.TabChannelsRef) {
    		this.props.navigation.state.params.TabChannelsRef.onRefresh()
    	}

      if (this.props.navigation.state.params.ChatGroupVC) {
        let vc = this.props.navigation.state.params.ChatGroupVC

        vc.onRefresh()

        //vc.props.navigation.state.params.GroupName = "test test"
      }

    	this.props.navigation.goBack()
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

            this.setState ({ userPhotoURL: source, userPhotoPath: source})
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
            this.setState ({ userPhotoURL: source, userPhotoPath: source})

          }
        });
      }
    }

    onCancelCamera = () => {
      this.popupDialogCamera.dismiss()
    }

    _onSaveProfile = () => {

        //1(PUBLIC_GROUP), 2(GROUP), 3(PRIVATE)

      this.setState({ loading: true })

      var {params} = this.props.navigation.state
    
    var dialogname =  ''

    if (params.Dialog.type == 1) {
        dialogname = 'group-chat-public'
    } else {
        dialogname = 'group-chat-private'
    }

      if (params.IsCreated) {
          
        if (params.IsCreated == true) {

          var updates = {};

          updates['/dialog/'+ dialogname + '/' + params.Dialog._id] = params.Dialog;

          var ref = firebase.database().ref().update(updates).then( () => {

            params.IsCreated = false

            console.log("Write completed")

            this.updateGroup()

          }).catch(function(error) {
            console.error("Write failed: "+error)
          });
        }
      } else {
        this.updateGroup()
      }

      /*

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
            "userid" : this.state.userid
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

          this.setState({ loading: false, isGroupUpdated:true})


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
      }*/
    }

    updateGroup = () => {
      var {params} = this.props.navigation.state
      this.setState({ loading: true })

      var {params} = this.props.navigation.state
    
      var dialogname =  ''
  
      if (params.Dialog.type == 1) {
          dialogname = 'group-chat-public'
      } else {
          dialogname = 'group-chat-private'
      }

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
            "userid" : this.state.userid
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
          updatescontent2['/dialog/' + dialogname + '/' + params.Dialog._id + '/photo'] = milliseconds.toString()
          firebase.database().ref().update(updatescontent2)

          params.Dialog.name = this.state.groupName


          var updatescontent3 = {};
          updatescontent3['/dialog/' + dialogname + '/' + params.Dialog._id + '/name' ] = this.state.groupName
          firebase.database().ref().update(updatescontent3)

          this.setState({ loading: false, isGroupUpdated:true})

          Alert.alert("Pawpads", 'Group Updated Successfully!');
        });
      } else {

        //Update custom_data
        var updatescontent2 = {};
        updatescontent2['/dialog/' + dialogname + '/' + params.Dialog._id + '/name' ] = this.state.groupName
        firebase.database().ref().update(updatescontent2)

        params.Dialog.name = this.state.groupName

        this.setState({ loading: false, isGroupUpdated:true})

        Alert.alert("Pawpads", 'Group Updated Successfully!');
    }
  }

    uidString() {
      return 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  onRemoveChannel = () => {

    var {params} = this.props.navigation.state
    
    var name =  ''

    //1(PUBLIC_GROUP), 2(GROUP), 3(PRIVATE)

    if (params.Dialog.type == 1) {
        name = 'channel'
    } else {
        name = 'group'
    }

    Alert.alert(
      'Pawpads',
      'Are you sure you want to delete this ' + name + '?',
      [
        {text: 'Delete', onPress: () => {
          this.deleteGroup()
        }},
        {text: 'Cancel', onPress: () => {

        }, style: 'cancel'},
      ],
      { cancelable: false }
    )
  }

  deleteGroup = () => {

    this.setState({ loading: true })

    var {params} = this.props.navigation.state
    
    var {params} = this.props.navigation.state
    
    var dialogname =  ''

    if (params.Dialog.type == 1) {
        dialogname = 'group-chat-public'
    } else {
        dialogname = 'group-chat-private'
    }

    firebase.database().ref(`/dialog/` + dialogname).child(params.Dialog._id).remove();

    firebase.database().ref('/users/' + this.state.tableId  + '/dialog/').child(params.Dialog._id).remove();

    setTimeout(()=>{
        
      this.setState({ loading: false })

      Alert.alert("Pawpads", 'Group deleted successfully.');

      this.props.navigation.goBack("Login")

      const navigateAction = NavigationActions.navigate({
          
        routeName: 'Dashboard',

        params: {},

        action: NavigationActions.navigate({ routeName: 'Dashboard' }),
      });

      this.props.navigation.dispatch(navigateAction);

    }, 500)

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
                            
                            { this.state.isleaveAndDeleteBtn?
                            <View style = {styles.buttonView}>
                                {/*<TouchableOpacity style = {styles.removeBtn}>
                                    <Text style = {{color: Constant.APP_COLOR}}>Remove from friends</Text>
                                </TouchableOpacity>*/}
                                <TouchableOpacity style = {styles.blockBtn} onPress = {this.onRemoveChannel}>
                                    <Text style = {{color: '#de380a'}}>Leave and delete</Text>
                                </TouchableOpacity>
                            </View> : null
                          }
                        </View>

                            { this.state.isleaveAndDeleteBtn?
                        <TouchableOpacity onPress = {this._onChooseProfilePicture} style = {styles.userphotoTouch} >

                        <Image source = {{
                            uri: this.state.userPhotoURL ,
                            }}
                            defaultSource = {require('../assets/img/user_placeholder.png')}
                            style = {styles.userphoto} />
                            
                        </TouchableOpacity> :
                        <Image source = {{
                            uri: this.state.userPhotoURL ,
                            }}
                            defaultSource = {require('../assets/img/user_placeholder.png')}
                            style = {styles.userphotoTouch} />
                          }



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
        height: 90,
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
        top: 0
    },
    userphotoTouch: {
      width: 100,
      height: 100,
      borderRadius: 50,
      position: 'absolute',
      top: 30,
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
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent'
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
    buttonView: {
        marginTop: 60
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
});

//make this component available to the app
export default ChatGroupEdit;
