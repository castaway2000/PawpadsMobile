//import libraries
import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, StatusBar, Platform, ScrollView, AsyncStorage, ActivityIndicator, Keyboard, Alert } from 'react-native';
import { Container, Header, Content, Button } from 'native-base';
import Constant from '../common/Constant'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import PopupDialog, { SlideAnimation, DialogTitle } from 'react-native-popup-dialog';

import RNFirebase from 'react-native-firebase';
const firebase = RNFirebase.initializeApp({ debug: false, persistence: true })

var ImagePicker = require("react-native-image-picker");

import {CachedImage} from 'react-native-img-cache';

var isCamera = false;
var isGallery = false;
var pictureType = ''; //profile or cover
var currentUserid = '';
var backgroundId = -1;

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
            tableId:'',
            profilePictureURL: '',
            profilePictureLocalPath: '',
            coverPictureURL: '',
            coverPictureLocalPath: '',
        }
    }

    componentWillMount() {
        AsyncStorage.getItem(Constant.QB_TOKEN).then((token) => {
            this.setState({ token: token })
        })

        AsyncStorage.getItem(Constant.QB_USERID).then((value) => {
            this.setState({ userid: value })
            currentUserid = value
        })

        AsyncStorage.getItem(Constant.USER_TABEL_ID).then((value) => {
          this.setState({tableId: value })
          this.downloadProfileFirebase()
        })

        console.log('ProfileEdit.js');

        console.log();
    }

    downloadProfileFirebase() {

      console.log('tableId:',this.state.tableId);

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

                var fullname = ''
                if (profileObj.full_name) {
                  fullname = profileObj.full_name
                } else {
                  fullname = profileObj.login
                }

                if(profileObj.custom_data) {
                    var json = JSON.parse(profileObj.custom_data)

                    var gender = ''
                    if (json.usergender == 'M') {
                      gender = 'Male'
                    } else if (json.usergender == 'F') {
                      gender = 'Female'
                    } else {
                      gender = 'Gender'
                    }

                    this.setState({
                        userid     : profileObj.id,
                        username   : fullname,
                        useremail  : profileObj.email,
                        userage    : json.age.toString(),
                        usergender : gender,
                        userhobby  : json.hobby,
                        userdetail : json.about,
                        loading    : false,
                      });
                      backgroundId = json.backgroundId;
                } else {
                    this.setState({
                        userid   : profileObj.id,
                        username : fullname,
                        useremail: profileObj.email,
                        loading  : false,
                    });
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

                      if (blobid == json["backg roundId"]) {
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
                            username   : responseData.user.login,
                            useremail  : responseData.user.email,
                            loading    : false,
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

    loadingView() {
        if(this.state.loading) {
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
            backgroundId : backgroundId,
            gender : this.state.usergender == 'Male' ? 'M':'F',
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

    _onSaveFirebase = () => {

      console.log('_onSaveFirebase');
      this.setState({
          loading: true,
        });

      var isCoverphotoUpdated = false
      var isProfilephotoUpdated = false

      var customdata = {
          about : this.state.userdetail,
          age : parseInt(this.state.userage),
          hobby : this.state.userhobby,
          backgroundId : backgroundId,
      }

      if (this.state.usergender == 'Male') {
        customdata.usergender = 'M'
      } else if (this.state.usergender == 'Female') {
        customdata.usergender = 'F'
      }

      //Update custom_data
      var updateprofile = {};
      updateprofile['/users/' + this.state.tableId  + '/custom_data'] = JSON.stringify(customdata);
      firebase.database().ref().update(updateprofile)

      //Update full name
      var updatefullname = {};
      updatefullname['/users/' + this.state.tableId  + '/full_name'] = this.state.username;
      firebase.database().ref().update(updatefullname)

      if (this.state.coverPictureLocalPath == '' && this.state.profilePictureLocalPath == '') {
        alert("Profile Updated Successfully!")
        this.setState({
            loading: false,
          });
      }

      if (this.state.coverPictureLocalPath != '') {
        firebase.storage().ref("content/" + this.state.tableId + "/" + "coverphoto.jpg").putFile(this.state.coverPictureLocalPath).then(file => {
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
            "name" : "coverphoto.jpg",
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
          customdata.backgroundId = milliseconds
          updatescontent2['/users/' + this.state.tableId  + '/custom_data'] = JSON.stringify(customdata);
          firebase.database().ref().update(updatescontent2)


          isCoverphotoUpdated = true
          if (isProfilephotoUpdated) {
            isProfilephotoUpdated = false
            this.setState({
                loading: false,
              });
            alert("Profile Updated Successfully!")
          }
});
      } else {
        isCoverphotoUpdated = true
      }

      if (this.state.profilePictureLocalPath != '') {

        firebase.storage().ref("content/" + this.state.tableId + "/" + "profilephoto.jpg").putFile(this.state.profilePictureLocalPath).then(uploadedFile => {
          console.log('Uploaded to firebase:', uploadedFile)
          console.log("Image uploaded successfully.");

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
            "name" : "profilephoto.jpg",
            "public" : false,
            "set_completed_at" : date.toISOString(),
            "size" : 0,
            "tableId" : this.state.tableId,
            "uid" : this.uidString(),
            "updated_at" : date.toISOString(),
            "userid" : currentUserid
          }

            //Update User content
          updatescontent['/content/' + newKeycontent] = content;
          firebase.database().ref().update(updatescontent)

          var newKeyUsercontent = firebase.database().ref().child('users').child('content').push().key;

          var updatescontent1 = {};
          updatescontent1['/users/' + this.state.tableId  + '/content/'+ newKeyUsercontent] = content;
          firebase.database().ref().update(updatescontent1)

          //Update Blobid
          var updatescontent2 = {};
          updatescontent2['/users/' + this.state.tableId  + '/blob_id'] = milliseconds
          firebase.database().ref().update(updatescontent2)

          isProfilephotoUpdated = true

          if (isCoverphotoUpdated) {
            this.setState({
                loading: false,
              });
            isCoverphotoUpdated = false
            alert("Profile Updated Successfully!")
          }
        })
      } else {
        isProfilephotoUpdated = true
      }
    }

    uidString() {
      return 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
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

    _onChooseProfilePicture = () => {
      pictureType = 'profile'
      console.log('_onChooseProfilePicture');
      this.popupDialogCamera.show()
    }

    _onChooseCoverPicture = () => {
      pictureType = 'cover'
      console.log('_onChooseCoverPicture');
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

    onCancelCamera = () => {
      this.popupDialogCamera.dismiss()
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

            if (pictureType == 'profile') {
              this.setState ({ profilePictureURL: source})
              this.setState ({ profilePictureLocalPath: source})
            } else {
              this.setState ({ coverPictureURL: source})
              this.setState ({ coverPictureLocalPath: source})
            }
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

            if (pictureType == 'profile') {
              this.setState ({ profilePictureURL: source})
              this.setState ({ profilePictureLocalPath: source})

            } else {
              this.setState ({ coverPictureURL: source})
              this.setState ({ coverPictureLocalPath: source})
            }
          }
        });
      }
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
                        <CachedImage source = {{
                            uri: this.state.coverPictureURL,
                            }}
                            defaultSource = {require('../assets/img/app_bar_bg.png')}
                            style = {styles.tabViewBg} />
                            <Image source = {{
                                uri: this.state.coverPictureURL,
                                }}
                                style = {styles.tabViewBg} />
                        <TouchableOpacity style = {styles.backButton} onPress = {this._onback}>
                            <Image source = {require('../assets/img/back.png')} style = {{width: 18, height: 18}}/>
                        </TouchableOpacity>
                        <View style = {styles.saveView}>
                            <TouchableOpacity style = {styles.backButton} onPress = {this._onChooseCoverPicture}>
                                <Image source = {require('../assets/img/camera_white_icon.png')} style = {{width: 24, height: 17, resizeMode:'contain'}}/>
                            </TouchableOpacity>
                            <TouchableOpacity style = {styles.backButton} onPress = {this._onSaveFirebase}>
                                <Text style = {styles.savetxt}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style = {styles.bodyView}>
                        <TouchableOpacity  style = {{marginTop: 70}} onPress = {this._onChooseProfilePicture}>
                            <Image source = {require('../assets/img/camera_grey_icon.png')} style = {{width: 24, height: 17,}} />
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
                                onSubmitEditing={() => {Keyboard.dismiss()}}/>
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
                                onSubmitEditing={() => {Keyboard.dismiss()}}/>
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
                                onSubmitEditing={() => {Keyboard.dismiss()}}/>
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
                                onSubmitEditing={() => {Keyboard.dismiss()}}/>
                            <Image source = {require('../assets/img/pencil_icon.png')} style = {styles.icon}/>
                            <View style = {styles.lineBottom}/>
                        </View>

                    </View>
                    {this.loadingView()}
                    <CachedImage source = {{
                        uri: this.state.profilePictureURL,
                        }}
                        defaultSource = {require('../assets/img/user_placeholder.png')}
                        style = {styles.userphoto} />
                        <Image source = {{
                            uri: this.state.profilePictureURL,
                          }}
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
        //marginTop: (Platform.OS == 'ios')? 20 : StatusBar.currentHeight,
        flexDirection:'row',
        justifyContent:'space-between'
    },
    tabViewBg: {
        flex: 1,
        height: 100,
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
    saveView: {
        flexDirection: 'row',
        paddingRight: 10,
    },
    savetxt: {
        color: 'white',
        fontSize: 15,
        backgroundColor: 'transparent'
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
