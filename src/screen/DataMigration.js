//import libraries
import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, StatusBar, Platform, ScrollView, AsyncStorage } from 'react-native';
import Constant from '../common/Constant'
import hmacSHA1 from 'crypto-js/hmac-sha1'

import RNFetchBlob from 'react-native-fetch-blob'

import RNFirebase from 'react-native-firebase';
const firebase = RNFirebase.initializeApp({ debug: false, persistence: true })

// Geofire
import { initializeApp } from 'firebase'
const geofire = require('geofire');

//Type of dialog. Possible values: 1(PUBLIC_GROUP), 2(GROUP), 3(PRIVATE)

const firebaseApp = initializeApp({
  apiKey: Constant.FIREBASE_API_KEY,
  authDomain: Constant.FIREBASE_AUTH_DOMAIN,
  databaseURL: Constant.FIREBASE_DATABASE_URL,
  storageBucket: Constant.FIREBASE_STORAGE_BUCKET
},"App1")

// create a component
class DataMigration extends Component {

    constructor(props) {
        super(props);
        this.state = {
          qb_token: '',
          userid:'',
          qb_token_user:'',
          password:'',
          tableId:'',
          loadedImages:0,
          userDialogSkipped:0,
          userChatSkipped:0,
          userBlockListSkipped:0,
          userFriendListSkipped:0,
          bodyText: 'Migrating your data please wait...0%'
        };
    }

    componentWillMount() {

      AsyncStorage.getItem(Constant.QB_USERID).then((value) => {
        console.log("user id is:",value);
          this.setState({userid: value })

          AsyncStorage.getItem(Constant.QB_TOKEN).then((value) => {
            console.log("token is:",value);
              this.setState({qb_token: value })

              AsyncStorage.getItem(Constant.QB_USER_TOKEN).then((value) => {
                console.log("user token is:",value);
                  this.setState({qb_token_user: value })

                  AsyncStorage.getItem(Constant.USER_PASSWORD).then((value) => {
                    console.log("user password is:",value);
                      this.setState({password: value })

                      AsyncStorage.getItem(Constant.USER_TABEL_ID).then((value) => {
                        console.log("user password is:",value);
                          this.setState({tableId: value })

                          this._getBlocklist()
                          //this._queryuser()

                        })
                  })
              })
          })
      })
    }

    /**
     * BLOCK LIST
     */
     _getBlocklist = () => {

         console.log("Quickblox: Getting... Blocklist data");

         var REQUEST_URL = Constant.GET_BLOCKLIST + "?skip=" + this.state.userBlockListSkipped*100

         fetch(REQUEST_URL, {
             method: 'GET',
             headers: {
                 'Content-Type': 'application/json',
                 'QB-Token': this.state.qb_token
             }
         })
         .then((response) => response.json())
         .then((responseData) => {

           if (responseData["items"].length > 0) {
             console.log("Quickblox: Responce:",this.state.userBlockListSkipped,responseData);
             this.state.userBlockListSkipped = this.state.userBlockListSkipped + 1

             for (var index = 0; index < responseData["items"].length; index++) {
               responseData["items"][index]["blocked_user"] = responseData["items"][index]["blocked_user"].toString()
               responseData["items"][index]["source_user"] = responseData["items"][index]["source_user"].toString()
               responseData["items"][index]["user_id"] = responseData["items"][index]["user_id"].toString()

               this._saveBlocklisttoFirebase(responseData,index)
             }
             this._getBlocklist()
           } else {
             console.log("No Blocklist data found.");
             this.setState({bodyText: "Migrating friend list please wait...20%" })
             this._getFriendList() //1.0
           }
         }).catch((e) => {
             console.log(e)
              this.setState({bodyText: "Migrating friend list please wait...20%" })
             this._getFriendList() //1.0
         })
     }
     _saveBlocklisttoFirebase = (responseData,index) => {

       var updates = {};
       var newKey = firebase.database().ref().child('blocklist').push().key;
       updates = responseData["items"][index]
       firebase.database().ref().child('/blocklist/' + responseData["items"][index]["_id"]).set(updates)
     }

     /**
      * FRIEND LIST
      */
      _getFriendList = () => {

          console.log("Quickblox: Getting... Friend List data");

          var REQUEST_URL = Constant.GET_FRIENDSLIST + "?skip=" + this.state.userFriendListSkipped*100

          fetch(REQUEST_URL, {
              method: 'GET',
              headers: {
                  'Content-Type': 'application/json',
                  'QB-Token': this.state.qb_token
              }
          })
          .then((response) => response.json())
          .then((responseData) => {

            if (responseData["items"].length > 0) {
              console.log("Quickblox: Responce:",this.state.userFriendListSkipped,responseData);
              this.state.userFriendListSkipped = this.state.userFriendListSkipped + 1

              for (var index = 0; index < responseData["items"].length; index++) {
                this._saveFriendlisttoFirebase(responseData,index)
              }
              this._getFriendList()
            } else {
              console.log("No Friend data found.");
              this.setState({bodyText: "Migrating Location data please wait...40%" })
              this._getLocationDataQuickblox() //2.0
            }
          }).catch((e) => {
              console.log(e)
              this.setState({bodyText: "Migrating Location data please wait...40%" })
              this._getLocationDataQuickblox()  //2.0
          })
      }

      _saveFriendlisttoFirebase = (responseData,index) => {

        var updates = {};
        var newKey = firebase.database().ref().child('friendlist').push().key;
        updates = responseData["items"][index]

        responseData["items"][index].user1 = responseData["items"][index].user1.toString()
        responseData["items"][index].user2 = responseData["items"][index].user2.toString()
        responseData["items"][index].user_id = responseData["items"][index].user_id.toString()

        firebase.database().ref().child('/friendlist/' + responseData["items"][index]["_id"]).set(updates)
      }

      /**
      * LOCATION DATA
      */
      _getLocationDataQuickblox = () => {

        console.log("Quickblox: Getting... Location data");

        var REQUEST_URL = Constant.GET_USER_LOCATION + "?user.id=" + this.state.userid

        console.log("URL IS:",REQUEST_URL);

        fetch(REQUEST_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'QB-Token': this.state.qb_token_user
            }
        })
        .then((response) => response.json())
        .then((responseData) => {
          console.log("Quickblox Locationdata: Responce:",responseData);
            if(responseData.items) {
              this._saveUserLocationtoFirebase(responseData)
            }
            this.setState({bodyText: "Migrating chats please wait...60%" })
            this._getUserDialog() //3.0


        }).catch((e) => {
            console.log(e)
            this.setState({bodyText: "Migrating chats please wait...60%" })
            this._getUserDialog() //3.0
        })}

      _saveUserLocationtoFirebase = (responseData) => {
            if (responseData.items) {
        let items = responseData["items"]
        console.log("Quickblox: items:",items);
        console.log("Quickblox: userid:",this.state.userid);

        var geodata = {}
        if (items.length > 0) {
          geodata =  items[0]["geo_datum"]

          console.log("Quickblox: latitude:",geodata["latitude"]);
          console.log("Quickblox: longitude:",geodata["longitude"]);
          console.log("Quickblox: longitude:",geodata["user_id"]);
          console.log("Quickblox: USER:",geodata["user"]["user"]);

          firebase.database().ref('users/' + this.state.tableId).update({
            "latitude":parseFloat(geodata["latitude"]),
            "longitude":parseFloat(geodata["longitude"]),
          });

          //Save to geofire
          const geofireRef = new geofire(firebaseApp.database().ref('geofire/'))
          geofireRef.set(this.state.tableId, [parseFloat(geodata["latitude"]), parseFloat(geodata["longitude"])]).then(function() {
            console.log("Provided key has been added to GeoFire");
          }, function(error) {
            console.log("Error: " + error);
          });

        } else {

        }
      } else {

      }}

      /**
      * Chat Dialog
      */
      _getUserDialog = () => {

        console.log("Quickblox: Getting... Dialog data");

        var REQUEST_URL = Constant.RETRIEVE_DIALOGS_URL + "?skip=" + this.state.userDialogSkipped*100 + "&type[in]=2,3"

        console.log("Quickblox: Getting... Dialog data");
        fetch(REQUEST_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'QB-Token': this.state.qb_token_user
            }
        })
        .then((response) => response.json())
        .then((responseData) => {

          if (responseData["items"].length > 0) {
            console.log("Quickblox: Responce:",this.state.userDialogSkipped,responseData);
            this.state.userDialogSkipped = this.state.userDialogSkipped + 1

            for (var index = 0; index < responseData["items"].length; index++) {
              this._saveUserDialogtoFirebase(responseData,index)
              this._getUserChats(responseData["items"][index]["_id"])
            }
            this._getUserDialog()
          } else {
            console.log("No Dialog data found.");
            this.setState({bodyText: "Migrating images please wait...80%" })
            this._getUserBlobs() //4.0
          }
        }).catch((e) => {
            console.log(e)
            this.setState({bodyText: "Migrating images please wait...80%" })
            this._getUserBlobs() //4.0
        })
      }

      _saveUserDialogtoFirebase = (responseData,index) => {

        let dialog = responseData["items"][index];

        if (dialog.user_id) {
          dialog.user_id = dialog.user_id.toString()
        }

        if (dialog.last_message_user_id) {
          dialog.last_message_user_id = dialog.last_message_user_id.toString()
        }

        if (dialog.occupants_ids) {

          dialog.occupants_ids = dialog.occupants_ids.map(String)

          dialog.occupants_ids.sort()

          if (dialog.type == 3) {
            dialog.occupants_ids_combined = dialog.occupants_ids.join("-")
          }

        }

        //Type of dialog. Possible values: 1(PUBLIC_GROUP), 2(GROUP), 3(PRIVATE)
        if (dialog.type == 1) {
          var updates = {};
          var newKey = firebase.database().ref().child('dialog/group-public').push().key;
          updates = dialog
          firebase.database().ref().child('dialog/group-public/' + dialog._id).set(updates)
        } else if (dialog.type == 2 || dialog.type == 3) {
          var updates = {};
          var newKey = firebase.database().ref().child('dialog/group-chat-private').push().key;
          updates = dialog
          firebase.database().ref().child('dialog/group-chat-private/' + dialog._id).set(updates)
        } 
        
        //save dialog to user noBorder
        var newKey = firebase.database().ref().child('dialog/group-public').push().key;
        var updates = {"id":dialog._id,"type":dialog.type};
        firebase.database().ref().child('/users/' + this.state.tableId + '/dialog/'+ newKey).set(updates)
      }

      /**
      * Chats
      */
      _getUserChats = (chatDialogId) => {

        console.log("Quickblox: Getting... Chat data");

        var REQUEST_URL = Constant.GROUPCHAT_MESSAGE_URL + "?chat_dialog_id=" + chatDialogId + "&skip=" + this.state.userChatSkipped*100

        fetch(REQUEST_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'QB-Token': this.state.qb_token_user
            }
        })
        .then((response) => response.json())
        .then((responseData) => {
          console.log("Quickblox: Responce:",this.state.userChatSkipped,responseData);
          if (responseData["items"].length > 0) {
            this.state.userChatSkipped = this.state.userChatSkipped + 1

            for (var index = 0; index < responseData["items"].length; index++) {
              this._saveUserChattoFirebase(responseData,index)
            }
            this._getUserChats(chatDialogId)
          } else {
            console.log("No Chat data found.");
          }
        }).catch((e) => {
            console.log(e)
        })
    }

      _saveUserChattoFirebase = (responseData,index) => {
        var updates = {};
        var newKey = firebase.database().ref().child('chats').push().key;
        updates = responseData["items"][index]
        firebase.database().ref().child('/chats/' + responseData["items"][index]["_id"]).set(updates)
    }

      /**
      * User Blobs
      */
      _getUserBlobs = () => {
        console.log("Quickblox: Getting User Blobs....");
        var REQUEST_URL = Constant.CREATE_FILE_URL

        fetch(REQUEST_URL, {
            method: 'GET',
            headers: {
                'QB-Token': this.state.qb_token_user
            }
        })
        .then((response) => response.json())
        .then( (responseData) => {
          console.log("Quickblox User blobs Responce:",responseData);

          this.setState({totalImagesCount: responseData["items"].length})

          if (responseData["items"].length > 0) {
            for (var index in responseData["items"]) {
              //Store to firebase

              //Push in user section
              var updates = {};
              var newKey = firebase.database().ref().child('users').child('content').push().key;
              updates['/users/' + this.state.tableId + '/content/' + newKey] = responseData["items"][index]["blob"]
              firebase.database().ref().update(updates)

              //Push in user section
              var updates1 = {};
              var newKey1 = firebase.database().ref().child('content').push().key;
              responseData["items"][index]["blob"]["userid"] = this.state.userid;
              responseData["items"][index]["blob"]["tableId"] = this.state.tableId
              updates1['/content/' + newKey1] = responseData["items"][index]["blob"]
              firebase.database().ref().update(updates1)

              //Download Images
              this._downloadImages(responseData, index);
            }
          } else {

            console.log("No Userblob found.");
            this._firebaseSetDataMigrated()
          }

        }).catch((e) => {
            console.log(e)
            console.log("Error while receiving Userblob.");
            this._firebaseSetDataMigrated()
        })}

      _downloadImages = (responseData,index) => {
        let imageurl = Constant.BLOB_URL + responseData["items"][index]["blob"]["uid"] + ".json";
        let imagename = responseData["items"][index]["blob"]["name"]
        console.log("imagename is:",imagename);

        // send http request in a new thread (using native code)
        RNFetchBlob
        .config({
          fileCache : true,
        })
        .fetch('GET', imageurl, {
          'QB-Token' : this.state.qb_token,
        })

        // when response status code is 200
        .then((res) => {
          console.log('The file saved to ', res.path())

          //Upload Image to firebase
          firebase.storage().ref("content/" + this.state.tableId + "/" + imagename).putFile(res.path())
          .on('state_changed', (snapshot) => {

          }, (err) => {
            console.log("Error " + err);

            ///
            this.setState({loadedImages: this.state.loadedImages + 1 })

            Console.log("this.state.loadedImages",this.state.loadedImages)
            Console.log("responseData[items].length",responseData["items"].length)

            if (this.state.loadedImages == responseData["items"].length) {
                console.log("All Images Uploaded.",this.state.loadedImages ,responseData["items"].length);
                this._firebaseSetDataMigrated()
            }

          }, (uploadedAsset) => {

            ///
            this.setState({loadedImages: this.state.loadedImages + 1 })
            if (this.state.loadedImages == responseData["items"].length) {
                console.log("All Images Uploaded.",this.state.loadedImages ,responseData["items"].length);
                this._firebaseSetDataMigrated()
            }
          });
        })

        // Status code is not 200
        .catch((errorMessage, statusCode) => {
          console.log("errorMessage = ",index,errorMessage);

          ///
          this.setState({loadedImages: this.state.loadedImages + 1 })
          if (this.state.loadedImages == responseData["items"].length) {
              console.log("All Images Uploaded.",this.state.loadedImages ,responseData["items"].length);
          }
          // error handling
        })}

        _firebaseSetDataMigrated = () => {

          this.setState({bodyText: "Please wait...99%" })

          console.log("this.state.userid = ",this.state.userid);

          firebase.database().ref('users/' + this.state.tableId).update({"isDataMigrated": "true"});

          this.setState({bodyText: "Migration finished."})

          const { navigate } = this.props.navigation
          navigate ('Drawer')
        }

      render() {
        return (
            <View style={styles.container}>
            <View style = {styles.tabView}>
            <Text style = {styles.title}>Data Migration</Text>
            </View>
            <View style={styles.container}>
            <Text style={styles.detailLabel} onPress={this.onPressTitle}>
              {this.state.bodyText}
              </Text>
            </View>
            </View>
        );
    }

      _onback = () => {
        this.props.navigation.goBack()
    }
}

// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: Constant.APP_COLOR,
        justifyContent: 'center',
      },
      tabView: {
            width: Constant.WIDTH_SCREEN,
            height: 60,
            paddingLeft: 5,
            marginTop: (Platform.OS == 'ios')? 20 : StatusBar.currentHeight,
            flexDirection:'row',
            alignItems:'center',
            justifyContent: 'center',
        },
        title: {
            color: 'white',
            marginLeft: 10,
            fontSize: 20,
            justifyContent: 'center',
        },
        detailLabel: {
            color: 'white',
            fontSize: 20,
            justifyContent: 'center',
            alignItems:'center',
        },
});

//make this component available to the app
export default DataMigration;
