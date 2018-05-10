//import libraries
import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, StatusBar, Platform, ScrollView, TouchableHighlight,AsyncStorage } from 'react-native';
import { Container, Header, Content, Button } from 'native-base';
import Constant from '../common/Constant'
import reactNativeKeyboardAwareScrollView from 'react-native-keyboard-aware-scroll-view';
import PopupDialog, { SlideAnimation, DialogTitle } from 'react-native-popup-dialog';
import {CachedImage} from 'react-native-img-cache';

var currentUserid = ''

import RNFirebase from 'react-native-firebase';

const firebase = RNFirebase.initializeApp({ debug: false, persistence: true })

// create a component
class Profile extends Component {
    constructor(props) {
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
            isblockedByMe: false,
            isblockedByOp: false,
            blockTableKey:"",
            shouldshowaddbutton: true,
            shouldshowchatbutton: true,
            shouldshowcoverimage: true,
            headermessage:'',
            isFriend: false,
            dialog: null,
        }
    }

    componentWillMount() {

      console.log("Profile.js");

        AsyncStorage.getItem(Constant.QB_TOKEN).then((token) => {
            this.setState({ token: token })
        })
        AsyncStorage.getItem(Constant.QB_USERID).then((value) => {
            this.setState({ userid: value })
            this.checkAlreadyFriend()
            this.checkDialogExiste()
        })

        AsyncStorage.getItem(Constant.QB_USERID).then((value) => {
          currentUserid = value
          console.log("USER ID IS:",currentUserid);
          this.getBlockList()
        })
    }

    _onback = () => {
      if (this.props.navigation.state.params.ChatVC) {
        this.props.navigation.state.params.ChatVC.update()
      }

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
                style = {[styles.addphoto, {marginTop: -40}]}/>
        )
    }

    showUserPhoto() {
        var {params} = this.props.navigation.state
        return(
            <CachedImage source = {{
                uri: params.UserInfo.profileurl,
              }}
                defaultSource = {require('../assets/img/user_placeholder.png')}
                style = {styles.userphoto} />
        )
    }

    showUserAbout() {
        var {params} = this.props.navigation.state

        var json = null;

        if (params.UserInfo.custom_data) {
          json = JSON.parse(params.UserInfo.custom_data)
        }

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

    showUserAge() {
        var {params} = this.props.navigation.state

        var json = null;

        if (params.UserInfo.custom_data) {
           json = JSON.parse(params.UserInfo.custom_data)
        }

        if(json) {
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

          var json = null;
        if (params.UserInfo.custom_data) {
         json = JSON.parse(params.UserInfo.custom_data)
        }


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

    onCreateDialog = () => {
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

    onCreateDialogFirebase = () => {

      if (this.state.dialog) {
        this.props.navigation.navigate('Chat', {GroupName: this.state.dialog.name, IsPriveteGroup: true, Dialog: this.state.dialog})
      } else {
        this.createDialog()
      }
    }

    getBlockList() {

      var {params} = this.props.navigation.state
      var last_message_userid = params.UserInfo.id

      console.log("currentUserid.toString():",currentUserid.toString());

      firebase.database()
      .ref(`/blocklist`)
      .orderByChild("source_user")
      .equalTo(currentUserid.toString())
      .once("value")
      .then(snapshot => {

        console.log("block list:",snapshot.val());

          if (snapshot.val()) {

            let blocklists =  snapshot.val();

            let keys = Object.keys(blocklists);

            if (keys.length > 0) {

              for (var i = 0; i < keys.length; i++) {
                let blockobj = blocklists[keys[i]]

                if (blockobj.blocked_user == last_message_userid) {
                  console.log("I have blocked someone.");

                  this.setState({isblockedByMe:true})

                  this.setState({blockTableKey:keys[i]})
                  this.setState({shouldshowcoverimage:false})
                  this.setState({headermessage:"You have blocked this user."})
                  this.setState({shouldshowaddbutton:false})
                  this.setState({shouldshowchatbutton:false})
                }
              }
            }

            console.log("blockTableKey is:",this.state.blockTableKey);

            } else {
              console.log("error is:");
            }
          })

          firebase.database()
          .ref(`/blocklist`)
          .orderByChild("blocked_user")
          .equalTo(currentUserid.toString())
          .once("value")
          .then(snapshot => {

            console.log("block list:",snapshot.val());
              if (snapshot.val()) {

                let blocklists =  snapshot.val();

                let keys = Object.keys(blocklists);

                if (keys.length > 0) {

                  for (var i = 0; i < keys.length; i++) {
                    let blockobj = blocklists[keys[i]]

                    if (blockobj.source_user == last_message_userid) {
                      console.log("Some one blocked me!");

                      this.setState({isblockedByOp:true})

                      this.setState({blockTableKey:keys[i]})
                      this.setState({shouldshowcoverimage:false})
                      this.setState({headermessage:"You are blocked."})
                      this.setState({shouldshowaddbutton:false})
                      this.setState({shouldshowchatbutton:false})
                    }
                  }
                }

                console.log("blocklist is:",blocklist);

                } else {
                  console.log("error is:");
                }
              })
        }

        _onBlockUnblockUser = () => {

          if (this.state.isblockedByMe) {

            console.log("Unblock");
            if (this.state.blockTableKey) {
              var ref = firebase.database().ref(`/blocklist`)
              ref.child(this.state.blockTableKey).remove();
            }

            setTimeout(()=> {
              this.setState({"isblockedByMe":false})
               alert("User unblocked successfully.")

               this.setState({isblockedByMe:false})
               this.setState({isblockedByOp:false})

               this.setState({shouldshowcoverimage:true})
               this.setState({headermessage:""})
               this.setState({shouldshowaddbutton:true})
               this.setState({shouldshowchatbutton:true})

            }, 400)

          } else {

            var updates = {};
            var newKey = firebase.database().ref().child('blocklist').push().key;

            var {params} = this.props.navigation.state

            var milliseconds = (new Date).getTime();
            console.log(milliseconds);

            var date = new Date();
            console.log(date.toISOString());

            let blocklistdict = {
              _id: newKey,
              blocked_user: params.UserInfo.id.toString(),
              created_at: milliseconds,
              source_user: currentUserid.toString(),
              updated_at: milliseconds,
              user_id: currentUserid.toString(),
            }

            updates['/blocklist/' + newKey] = blocklistdict;
            firebase.database().ref().update(updates)

            setTimeout(()=> {
              this.setState({"isblockedByMe":true})
               alert("User blocked successfully.")

               this.setState({isblockedByMe:true})
               this.setState({isblockedByOp:true})

               this.setState({shouldshowcoverimage:false})
               this.setState({headermessage:"You have blocked this user."})
               this.setState({shouldshowaddbutton:false})
               this.setState({shouldshowchatbutton:false})
            }, 400)
          }
        }

        checkDialogExiste = () => {

          var {params} = this.props.navigation.state

          let ids = [this.state.userid, params.UserInfo.id]
          ids.sort()

          firebase.database()
              .ref(`/dialog`)
              .orderByChild("occupants_ids_combined")
              .equalTo(ids.join("-"))
              .once("value")
              .then(snapshot => {

                if (snapshot.val()) {
                  var dialogObj = snapshot.val();

                  if (dialogObj) {
                    let keys = Object.keys(dialogObj);

                    var dialog = null;
                    if (keys.length > 0) {
                      dialog = dialogObj[keys[0]]
                    }

                    if (dialog) {
                      this.setState({dialog: dialog})
                    }
                  }
                }
              })
        }

        createDialog = () => {

          var {params} = this.props.navigation.state

          //create dialog
          //Group Chat
          var updates = {};

          var milliseconds = (new Date).getTime()/1000|0;
          var date = new Date();

          var updatescontent = {};
          var newKey = firebase.database().ref().child('dialog/group-chat-private').push().key;

          var occupantsids = [this.state.userid, params.UserInfo.id]

          occupantsids = occupantsids.map(String)

          occupantsids.sort()

          var occupants_ids_combined = occupantsids.join("-")

          //Type of dialog. Possible values: 1(PUBLIC_GROUP), 2(GROUP), 3(PRIVATE)
          let dialog =  {
            _id :  newKey,
            created_at : date.toISOString(),
            last_message : "",
            last_message_date_sent : milliseconds,
            last_message_user_id : this.state.userid.toString(),
            name : params.UserInfo.full_name ? params.UserInfo.full_name : params.UserInfo.login,
            occupants_ids : occupantsids,
            photo : "",
            type : 3, //PERSONAL
            unread_messages_count : 0,
            occupants_ids_combined:  occupants_ids_combined,
            updated_at : date.toISOString(),
            user_id : this.state.userid.toString()
          }

          this.setState({dialog: dialog})

          updates['/dialog/group-chat-private/' + newKey] = dialog;

          var ref = firebase.database().ref().update(updates).then( () => {
              this.props.navigation.navigate('Chat', {GroupName: this.state.dialog.name, IsPriveteGroup: true, Dialog: this.state.dialog})
          }).catch(function(error) {
            console.error("Write failed: "+error)
          });

        }

        renderBlockUnblock = () => {

          if (this.state.isblockedByMe) {
            return (
              <TouchableOpacity style = {styles.blockBtn} onPress = {this._onBlockUnblockUser}>
                  <Text style = {{color: '#de380a'}}>Unblock User</Text>
              </TouchableOpacity>
            )
          } else if (this.state.isblockedByOp) {
            return (
              <TouchableOpacity style = {styles.blockBtn}>
                  <Text style = {{color: '#de380a'}}>You are Blocked.</Text>
              </TouchableOpacity>
            )
          } else {
            return (
              <TouchableOpacity style = {styles.blockBtn} onPress = {this._onBlockUnblockUser}>
                  <Text style = {{color: '#de380a'}}>Block User</Text>
              </TouchableOpacity>
            )
          }
        }


        sendFriendRequest = () => {

          this.popupDialog.dismiss()
          var {params} = this.props.navigation.state

          var milliseconds = (new Date).getTime()/1000|0;

          var date = new Date();


          ///
          var updates = {};
          var newKey = firebase.database().ref().child('friendlist').push().key;

          var chatdict = {
            "_id" : newKey,
            "created_at" : date,
            "date_sent" : milliseconds,
            "updated_at" : date,
            "user_id" : this.state.userid,
            "friend_id" : params.UserInfo.id,
            "status" : 1, //approved
          }

          updates['/friendlist/' + newKey] = chatdict;
          firebase.database().ref().update(updates)

          ///
          var updates1 = {};
          var newKey1 = firebase.database().ref().child('friendlist').push().key;

          var chatdict1 = {
            "_id" : newKey1,
            "created_at" : date,
            "date_sent" : milliseconds,
            "updated_at" : date,
            "user_id" : params.UserInfo.id,
            "friend_id" : this.state.userid,
            "status" : 1, //approved
          }

          updates1['/friendlist/' + newKey1] = chatdict1;
          firebase.database().ref().update(updates1)

          this.setState({isFriend:true})
        }

        checkAlreadyFriend = () => {
          var {params} = this.props.navigation.state
          firebase.database()
              .ref(`/friendlist`)
              .orderByChild("user_id")
              .equalTo(this.state.userid)
              .once("value")
              .then(snapshot => {
                if (snapshot.val()) {
                  let response = snapshot.val()
                  var keys = Object.keys(response);
                  for (var i = 0; i < keys.length; i++) {
                    //console.log("checkAlreadyFriend",response[keys[i]]);
                    if (response[keys[i]].friend_id == params.UserInfo.id) {
                      console.log("friend found");
                      this.setState({isFriend:true})
                    }
                  }
                }
              })
            }

        showaddbutton() {
          if (this.state.shouldshowaddbutton) {
            if (this.state.isFriend) {
              return(
                <Image source = {require('../assets/img/added_to_friend.png')} style = {styles.addphoto}/>
              )
            } else {
              return(
                <TouchableOpacity onPress={() => { this.popupDialog.show(); }}>
                  <Image source = {require('../assets/img/add_to_friend.png')} style = {styles.addphoto}/>
                </TouchableOpacity>
              )
            }

          } else {
            return null
          }

        }

        showchatbutton() {
          if (this.state.shouldshowchatbutton) {
          return(
            <TouchableOpacity onPress = {this.onCreateDialogFirebase} >
                <Image source = {require('../assets/img/chat_button_new.png')} style = {styles.addphoto}/>
            </TouchableOpacity>
          )
        } else {
          return null
        }}

        showCoverImage() {
            var {params} = this.props.navigation.state

            if (Platform.OS == 'ios') {
                return(
                    <CachedImage source = {{
                        uri: params.UserInfo.coverPictureURL,
                        }}
                        defaultSource = {require('../assets/img/app_bar_bg.png')}
                        style = {styles.tabViewBg} />
                    )
                
            } else {
                return (
                    <View style = {styles.tabViewBg}>
                    <Image source = {require('../assets/img/app_bar_bg.png')}
                       defaultSource = {require('../assets/img/app_bar_bg.png')}
                        style = {styles.tabViewBg} />

                <CachedImage source = {{
                    uri: params.UserInfo.coverPictureURL,
                    }}
                    defaultSource = {require('../assets/img/app_bar_bg.png')}
                    style = {styles.tabViewBg} />
                    </View>
                )
            }
        }

        renderCoverImage() {

          var {params} = this.props.navigation.state

          if (this.state.shouldshowcoverimage) {
              
            return(
              <View style = {styles.tabView}>
              <View style = {styles.tabViewRedBg} />

              {this.showCoverImage()}

              <View style = {styles.backView}>
                  <TouchableOpacity style = {styles.backButton} onPress = {this._onback}>
                      <Image source = {require('../assets/img/back.png')} style = {{width: 18, height: 18}}/>
                  </TouchableOpacity>
                  <Text style = {styles.title}>Profile</Text>
              </View>
              
              </View>
            )
          } else {
            return(

              <View style={{flex: 1, flexDirection: 'row'}}>
              <View style = {styles.tabView}>

              <View style = {styles.tabViewRedBg} />

              <View style = {styles.backView}>

              <TouchableOpacity style = {styles.backButton} onPress = {this._onback}>
              <Image source = {require('../assets/img/back.png')} style = {{width: 18, height: 18}}/>
              </TouchableOpacity>
              <Text style = {styles.title}>Profile</Text>
              </View>

              <View style={{flex: 1, flexDirection:'row',alignItems:'flex-start',justifyContent:'center'}}>
              <Text style = {{marginTop: 0, backgroundColor:'transparent', color: 'white'}}>{this.state.headermessage}</Text>
              </View>
              </View>
              </View>
            )
          }
        }

//

    render() {
        var {params} = this.props.navigation.state
        return (

                <View style={styles.container}>
                    <View style = {styles.statusbar}/>
                    <ScrollView style = {{backgroundColor: 'white'}}>

                    {this.renderCoverImage()}

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

                                    { this.renderBlockUnblock() }


                                </View>
                            </View>
                    </View>

                    <View style = {styles.editView}>
                    { this.showaddbutton() }
                        { this.showUserPhoto() }
                        { this.showchatbutton() }

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
                    <TouchableHighlight style = {styles.cancelBtn} onPress = {() => this.sendFriendRequest()}>
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
      height: 140,
      width: '110%',
      position: 'absolute',
      backgroundColor: 'red'
    },

    tabViewRedBg: {
      flex: 1,
      height: 140,
      width: '110%',
      position: 'absolute',
      backgroundColor: '#8b0000'

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
        height: 170,
        backgroundColor: 'transparent',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        position:'absolute',
        left: 0,
        top: (Platform.OS == 'ios')? Constant.HEIGHT_SCREEN/4-115:Constant.HEIGHT_SCREEN/4-111
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
