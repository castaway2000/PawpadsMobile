//import libraries
import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, StatusBar, Platform, ScrollView, AsyncStorage } from 'react-native';
import Constant from '../common/Constant'
import hmacSHA1 from 'crypto-js/hmac-sha1'
import RNFirebase from 'react-native-firebase';
import RNFetchBlob from 'react-native-fetch-blob'

const firebase = RNFirebase.initializeApp({ debug: false, persistence: true })


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

                      //this._getBlocklist()
                      //this._getFriendList()
                      //this._getUserDialog()
                      this._getUserChats()
                      this._getLocationDataQuickblox()
                  })
              })
          })
      })
    }

    /**
     * Chat Block
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
               this._saveBlocklisttoFirebase(responseData,index)
             }
             this._getBlocklist()
           } else {
             console.log("No Blocklist data found.");
           }
         }).catch((e) => {
             console.log(e)
         })
     }

     _saveBlocklisttoFirebase = (responseData,index) => {

       var updates = {};
       var newKey = firebase.database().ref().child('blocklist').push().key;
       updates = responseData["items"][index]
       firebase.database().ref().child('/blocklist/' + responseData["items"][index]["_id"]).set(updates)

     }

     /**
      * Chat Friend
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
            }
          }).catch((e) => {
              console.log(e)
          })
      }

      _saveFriendlisttoFirebase = (responseData,index) => {

        var updates = {};
        var newKey = firebase.database().ref().child('friendlist').push().key;
        updates = responseData["items"][index]
        firebase.database().ref().child('/friendlist/' + responseData["items"][index]["_id"]).set(updates)
      }

      /**
      * Chat Dialog
      */
      _getUserDialog = () => {

        console.log("Quickblox: Getting... Dialog data");

        var REQUEST_URL = Constant.RETRIEVE_DIALOGS_URL + "?skip=" + this.state.userDialogSkipped*100

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
          }
        }).catch((e) => {
            console.log(e)
        })
    }

      _saveUserDialogtoFirebase = (responseData,index) => {

      var updates = {};
      var newKey = firebase.database().ref().child('dialog').push().key;
      updates = responseData["items"][index]
      firebase.database().ref().child('/dialog/' + responseData["items"][index]["_id"]).set(updates)
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

          if (responseData["items"].length > 0) {
            console.log("Quickblox: Responce:",this.state.userChatSkipped,responseData);
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
      * LOCATION DATA
      */
      _getLocationDataQuickblox = () => {

        console.log("Quickblox: Getting... Location data");

        var REQUEST_URL = Constant.GET_USER_LOCATION + "?user.id=" + this.state.userid

        fetch(REQUEST_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'QB-Token': this.state.qb_token_user
            }
        })
        .then((response) => response.json())
        .then((responseData) => {
          console.log("Quickblox: Responce:",responseData);
            if(responseData.items) {
              this._saveUserLocationtoFirebase(responseData)
            }
        }).catch((e) => {
            console.log(e)
        })
    }

      _saveUserLocationtoFirebase = (responseData) => {
      if (responseData.items) {
        let items = responseData["items"]
        console.log("Quickblox: items:",items);

        var geodata = {}
        if (items.length > 0) {
          geodata =  items[0]["geo_datum"]

          console.log("Quickblox: latitude:",geodata["latitude"]);
          console.log("Quickblox: longitude:",geodata["longitude"]);
          console.log("Quickblox: longitude:",geodata["user_id"]);
          console.log("Quickblox: USER:",geodata["user"]["user"]);

          firebase.database()
              .ref(`/users`)
              .orderByChild("id")
              .equalTo(geodata["user_id"].toString())
              .once("value")
              .then(snapshot => {
                this.setState({ loading: false })
                  if (snapshot.val()) {

                    let response = snapshot.val()
                    var keys = Object.keys(response);
                    var tableId =  keys[keys.length-1]

                    //Update Location
                    var rootRef = firebase.database().ref(`/users`);
                    let userlocation = {};
                    userlocation[tableId + "/location"] = {
                      "latitude":geodata["latitude"],
                      "longitude":geodata["longitude"],
                      "blob_id": geodata["user"]["user"]["blob_id"],
                    }
                    rootRef.update(userlocation);

                    //Update Custom data
                    let customdata = {};
                    customdata[tableId + "/custom_data"] = geodata["user"]["user"]["custom_data"]

                    rootRef.update(customdata);

                    this.setState({tableId: tableId })

                    this._getUserBlobs();

                  } else {
                      console.log("User Not found on Firebase. Incorrect user id.")
                  }
              })
        } else {

        }
      } else {

      }
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

          for (var index in responseData["items"]) {
            //Store to firebase

            var updates = {};
            var newKey = firebase.database().ref().child('users').child('content').push().key;
            updates['/users/' + this.state.tableId + '/content/' + newKey] = responseData["items"][index]["blob"]
            firebase.database().ref().update(updates)

            //Download Images
            this._downloadImages(responseData, index);
          }

        }).catch((e) => {
            console.log(e)
        })
    }

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
          if (this.state.loadedImages == responseData["items"].length) {
              console.log("All Images Uploaded.",this.state.loadedImages ,responseData["items"].length);
          }

        }, (uploadedAsset) => {

          ///
          this.setState({loadedImages: this.state.loadedImages + 1 })
          if (this.state.loadedImages == responseData["items"].length) {
              console.log("All Images Uploaded.",this.state.loadedImages ,responseData["items"].length);
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
      })
    }

      render() {
        return (
            <View style={styles.container}>
            <View style = {styles.tabView}>
                <Text style = {styles.title}>Data Migration</Text>
            </View>
            <View style={styles.container}>
            <Text style = {styles.detailLabel}>Migrating your data...</Text>
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
