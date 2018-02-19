//import libraries
import React, { Component } from 'react';
import { View, NativeModules,  StyleSheet,Text, Image, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, ActivityIndicator, Keyboard, AsyncStorage } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { connect } from 'react-redux';
import { loginUser, passwordChanged } from '../../actions';
import Constant from '../../common/Constant'
var CryptoJS = require("crypto-js")
import hmacSHA1 from 'crypto-js/hmac-sha1'
import {formatDate} from '../../actions/const';
import RNFirebase from 'react-native-firebase';
import { LoginManager } from 'react-native-fbsdk'
import { LoginButton, AccessToken, GraphRequestManager, GraphRequest } from 'react-native-fbsdk';

import {
    EMAIL_CHANGED,
    PASSWORD_CHANGED,
    LOGIN_USER_SUCCESS ,
    LOGIN_USER_FAIL,
    LOGIN_USER,
} from '../../actions/types'

let nextInput;
const firebase = RNFirebase.initializeApp({ debug: false, persistence: true })
const { RNTwitterSignIn } = NativeModules;


var CryptoJS = require("crypto-js");
firebase.database().goOnline()
var tmp;

// create a component
class Login extends Component {

    static navigationOptions = {
        title:'',
        header: null
    };

    constructor(props) {
        super(props)
        this.state = {
            name: 'test001', //cris 1BITJAY_1875640410  howsonanna stad blaze test001
            password: '12345678', //
            qb_token: '',
            loading: this.props.loading,
            isname: true,
            ispassword: true,
            qb_token_user : "",
        }
    }

    componentWillMount() {
        tmp = this

        this.getQB_Token()
    }

    getQB_Token() {

        var time = parseInt(Date.now()/1000)
        var signatureParams = 'application_id='+ Constant.QB_APPID + '&auth_key=' + Constant.QB_AUTH_KEY + '&nonce=' + time + '&timestamp=' + time
        var signature = ''
        signature = hmacSHA1(signatureParams, Constant.QB_AUTH_SECRET).toString()

        let formdata = new FormData()
        formdata.append('application_id', Constant.QB_APPID)
        formdata.append('auth_key', Constant.QB_AUTH_KEY)
        formdata.append('timestamp', time)
        formdata.append('nonce', time)
        formdata.append('signature', signature)

        var REQUEST_URL = Constant.SESSION_URL
        fetch(REQUEST_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            body:formdata
        })
        .then((response) => response.json())
        .then((responseData) => {
            var token = responseData.session.token

            if (token) {
              AsyncStorage.setItem(Constant.QB_TOKEN, token);
            }

            console.log("token is:",token);
            this.setState({
                qb_token: token
            })

        }).catch((e) => {
            console.log(e)
        })
    }

    getQB_Token_User(username,password) {

      console.log("Getting user session token.");

        var time = parseInt(Date.now()/1000)
        var signatureParams = 'application_id='+ Constant.QB_APPID + '&auth_key=' + Constant.QB_AUTH_KEY + '&nonce=' + time + '&timestamp=' + time + '&user[login]=' + this.state.name + '&user[password]=' + this.state.password
        var signature = ''
        signature = hmacSHA1(signatureParams, Constant.QB_AUTH_SECRET).toString()

        var params = {
          "application_id":Constant.QB_APPID,
          "auth_key":Constant.QB_AUTH_KEY,
          "timestamp":time,
          "nonce":time,
          "signature":signature,
          "user": {"login": this.state.name, "password": this.state.password}
        }
        console.log("user params is:",params);

        var REQUEST_URL = Constant.SESSION_URL
        fetch(REQUEST_URL, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body:JSON.stringify(params)
        })
        .then((response) => response.json())
        .then((responseData) => {
          console.log("user session token responce:",responseData);
          var token = responseData.session.token

          if (token) {
            AsyncStorage.setItem(Constant.QB_USER_TOKEN, token);
          }

          this.setState({
              qb_token: token
          })

          //Go to home
          this._checkDataMigration("false")

        }).catch((e) => {
            console.log(e)
        })
    }

    getQB_Token_User_Facebook(fbtoken) {

      //provider facebook
      //keys[token] fb token
      console.log("Getting user facebook session token.");

        var time = parseInt(Date.now()/1000)

        //application_id=22&auth_key=wJHd4cQSxpQGWx5&keys[token]=AM46dxjhisdffgry26282352fdusdfusdfgsdf&nonce=33432&provider=facebook&timestamp=1326966962
        var signatureParams = 'application_id='+ Constant.QB_APPID + '&auth_key=' + Constant.QB_AUTH_KEY + '&keys[token]=' + fbtoken + '&nonce=' + time + '&provider=' + 'facebook' + '&timestamp=' + time
        var signature = ''
        signature = hmacSHA1(signatureParams, Constant.QB_AUTH_SECRET).toString()

        var params = {
          "application_id":Constant.QB_APPID,
          "auth_key":Constant.QB_AUTH_KEY,
          "timestamp":time,
          "nonce":time,
          "signature":signature,
          "provider": "facebook",
          "keys": {"token": fbtoken}
        }
        console.log("user params is:",params);

        var REQUEST_URL = Constant.SESSION_URL
        fetch(REQUEST_URL, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body:JSON.stringify(params)
        })
        .then((response) => response.json())
        .then((responseData) => {
          console.log("user session token responce:",responseData);
          var token = responseData.session.token

          if (token) {
            AsyncStorage.setItem(Constant.QB_USER_TOKEN, token);
          }

          this.setState({
              qb_token_user: token
          })

          //Go to home
          this._checkDataMigration("false")

        }).catch((e) => {
            console.log(e)
        })
    }

    getQB_Token_User_Twitter(twtoken,twsecret) {

      //provider facebook
      //keys[token] fb token
      console.log("Getting user twitter session token.");

        var time = parseInt(Date.now()/1000)
        var signatureParams = 'application_id='+ Constant.QB_APPID + '&auth_key=' + Constant.QB_AUTH_KEY + '&keys[token]=' + twtoken + '&keys[secret]=' + twsecret + '&nonce=' + time + '&provider=' + 'twitter' + '&timestamp=' + time
        var signature = ''
        signature = hmacSHA1(signatureParams, Constant.QB_AUTH_SECRET).toString()

        var params = {
          "application_id":Constant.QB_APPID,
          "auth_key":Constant.QB_AUTH_KEY,
          "timestamp":time,
          "nonce":time,
          "signature":signature,
          "provider": "twitter",
          "keys": {"token": twtoken, "secret": twsecret}
        }
        console.log("user params is:",params);

        var REQUEST_URL = Constant.SESSION_URL
        fetch(REQUEST_URL, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body:JSON.stringify(params)
        })
        .then((response) => response.json())
        .then((responseData) => {
          console.log("user session token responce:",responseData);
          var token = responseData.session.token

          if (token) {
            AsyncStorage.setItem(Constant.QB_USER_TOKEN, token);
          }

          this.setState({
              qb_token_user: token
          })

          //Go to home
          this._checkDataMigration("false")

        }).catch((e) => {
            console.log(e)
        })
    }

    _onLogin = () => {
        if (this.state.name.length < 1) {
            this.setState({ isname: false })
        } else {
            if (this.state.password.length < 1) {
                this.setState({ ispassword: false })
            } else {
                this.firebaseLoginNormal()
                Keyboard.dismiss();
            }
        }
    }

    _checkDataMigration = (isDataMigrated) => {
      console.log("Check for data migration.");
      if (isDataMigrated == "true") {
        console.log("Data Migrated.");
        const { navigate } = this.props.navigation
        navigate ('Drawer')
      } else {
        console.log("Data Not Migrated.");
        this.props.navigation.navigate('DataMigration')
      }
    }

   //Login with firebase
    firebaseLoginNormal = () => {
      console.log("Login with firebase started.");
      this.setState({ loading: true })
        firebase.database()
            .ref(`/users`)
            .orderByChild("login")
            .equalTo(this.state.name)
            .once("value")
            .then(snapshot => {
              this.setState({ loading: false })
                if (snapshot.val()) {

                    console.log("User found on Firebase.");

                    let response = snapshot.val()
                    var keys = Object.keys(response);
                    var tableId =  keys[keys.length-1]

                    //Get Login data
                    let blob_id = response[tableId]["blob_id"]
                    let created_at = response[tableId]["created_at"]
                    let custom_data = response[tableId]["custom_data"]
                    let email = response[tableId]["email"]
                    let full_name = response[tableId]["full_name"]
                    let qbID = response[tableId]["id"]
                    let last_request_at = response[tableId]["last_request_at"]
                    let login = response[tableId]["login"]
                    let owner_id = response[tableId]["owner_id"]
                    let updated_at = response[tableId]["updated_at"]
                    let password = response[tableId]["password"]
                    let isDataMigrated = response[tableId]["isDataMigrated"]

                    console.log("User password found on firebase. Password is:" ,password);
                    this.setState({ loading: false })

                    //Decrypt password
                    var plaintextpassword  = CryptoJS.AES.decrypt(password.toString(), Constant.FIREBASE_PASS_SECRET).toString(CryptoJS.enc.Utf8);

                    if (plaintextpassword == this.state.password) {
                      console.log("User entered correct password");

                      //save pref
                      AsyncStorage.setItem(Constant.USER_TABEL_ID, tableId);

                      if (qbID) {
                        AsyncStorage.setItem(Constant.QB_USERID, qbID.toString());
                      }

                      if (this.state.password) {
                        AsyncStorage.setItem(Constant.USER_PASSWORD, this.state.password);
                      }

                      if (login) {
                        AsyncStorage.setItem(Constant.USER_FULL_NAME, login);
                      }

                      if (email) {
                        AsyncStorage.setItem(Constant.USER_EMAIL, email);
                      }

                      if (blob_id) {
                        AsyncStorage.setItem(Constant.USER_BLOBID, blob_id.toString());
                      }

                      if (isDataMigrated == "true") {
                        this._checkDataMigration("true")
                      } else {
                        this.getQB_Token_User(this.state.name, this.state.password)
                      }

                    } else {
                      console.log("User entered wrong password");
                      alert("Please enter correct password.")
                    }
                  } else {
                    console.log("User Not found on Firebase.")
                    console.log("Adding Trying to loginwith Quickblox....")

                    this._loginWithQuickbloxNormal()

                }
            })
    }

    //Login with twitter
    firebaseLoginTwitter = () => {
      console.log("Twitter: Login with firebase started.");
      this.setState({ loading: true })

      RNTwitterSignIn.init(Constant.TWITTER_COMSUMER_KEY, Constant.TWITTER_CONSUMER_SECRET);
      RNTwitterSignIn.logIn()
        .then((loginData)=>{

          console.log("Twitter: Login success:",loginData);

          const { authToken, authTokenSecret } = loginData;
          if (authToken && authTokenSecret) {

            let twitterId = loginData["userID"]
            let login = loginData["userName"] + "_" + twitterId

            console.log("twitterId:",twitterId);
            console.log("login:",login);

            firebase.database()
                .ref(`/users`)
                .orderByChild("login")
                .equalTo(login)
                .once("value")
                .then(snapshot => {
                  this.setState({ loading: false })
                    if (snapshot.val()) {
                      console.log("Twitter: User found on Firebase.")

                      let response = snapshot.val()
                      var keys = Object.keys(response);
                      var tableId =  keys[keys.length-1]

                      //Get Login data
                      let blob_id = response[tableId]["blob_id"]
                      let created_at = response[tableId]["created_at"]
                      let custom_data = response[tableId]["custom_data"]
                      let email = response[tableId]["email"]
                      let full_name = response[tableId]["full_name"]
                      let qbID = response[tableId]["id"]
                      let last_request_at = response[tableId]["last_request_at"]
                      let login = response[tableId]["login"]
                      let owner_id = response[tableId]["owner_id"]
                      let updated_at = response[tableId]["updated_at"]
                      let password = response[tableId]["password"]
                      let isDataMigrated = response[tableId]["isDataMigrated"]

                      //save pref
                      AsyncStorage.setItem(Constant.USER_TABEL_ID, tableId);

                      if (qbID) {
                        AsyncStorage.setItem(Constant.QB_USERID, qbID.toString());
                      }

                      if (login) {
                        AsyncStorage.setItem(Constant.USER_FULL_NAME, login);
                      }

                      if (email) {
                        AsyncStorage.setItem(Constant.USER_EMAIL, email);
                      }

                      if(blob_id) {
                          AsyncStorage.setItem(Constant.USER_BLOBID, blob_id.toString());
                      }

                      //Go to home
                      if (isDataMigrated == "true") {
                        this._checkDataMigration(isDataMigrated)
                      } else {
                        this.getQB_Token_User_Twitter(authToken,authTokenSecret)
                      }

                    } else {
                      //Check quickblox for twitter data
                      this._loginWithQuickbloxTwitter(authToken,authTokenSecret,loginData)
                    }
                })
          }
        }).catch((error)=>{
          this.setState({ loading: false })

          console.log(error);
        });
      }

    //Login with facebook
    firebaseLoginFacebook = () => {
      console.log("Facebook: Login with firebase started.");
      LoginManager.logInWithReadPermissions(['public_profile', 'email', 'user_friends']).then(

        function (result) {
          if (result.isCancelled) {

            console.log('Facebook: Login cancelled')

           } else {

             console.log('Facebook: Login success with permissions: ' + result.grantedPermissions.toString())

             AccessToken.getCurrentAccessToken().then( (data) => {

               let accessToken = data.accessToken;

               const responseInfoCallback = (error, result) => {

                 if (error) {
                   console.log("Facebook:",error)
                   alert('Error fetching data: ' + error.toString());
                 } else {
                   console.log("Facebook: Success fetching data:",result)

                   let facebookID = result["id"]
                   let login = "facebook_" + facebookID

                   console.log("facebookID:",facebookID);
                   console.log("login:",login);

                   firebase.database()
                       .ref(`/users`)
                       .orderByChild("login")
                       .equalTo(login)
                       .once("value")
                       .then(snapshot => {
                           if (snapshot.val()) {
                             console.log("Facebook: User found on Firebase.")

                             let response = snapshot.val()
                             var keys = Object.keys(response);
                             var tableId =  keys[keys.length-1]

                             //Get Login data
                             let blob_id = response[tableId]["blob_id"]
                             let created_at = response[tableId]["created_at"]
                             let custom_data = response[tableId]["custom_data"]
                             let email = response[tableId]["email"]
                             let full_name = response[tableId]["full_name"]
                             let qbID = response[tableId]["id"]
                             let last_request_at = response[tableId]["last_request_at"]
                             let login = response[tableId]["login"]
                             let owner_id = response[tableId]["owner_id"]
                             let updated_at = response[tableId]["updated_at"]
                             let password = response[tableId]["password"]
                             let isDataMigrated = response[tableId]["isDataMigrated"]

                             //save pref
                             AsyncStorage.setItem(Constant.USER_TABEL_ID, tableId);

                             if (qbID) {
                               AsyncStorage.setItem(Constant.QB_USERID, qbID.toString());
                             }

                             if (login) {
                               AsyncStorage.setItem(Constant.USER_FULL_NAME, login);
                             }

                             if (email) {
                               AsyncStorage.setItem(Constant.USER_EMAIL, email);
                             }

                             if(blob_id) {
                                 AsyncStorage.setItem(Constant.USER_BLOBID, blob_id.toString());
                             }

                             //Go to home
                             if (isDataMigrated = "true") {
                               tmp._checkDataMigration(isDataMigrated)
                             } else {
                               tmp.getQB_Token_User_Facebook(accessToken)
                             }

                           } else {
                             tmp._loginWithQuickbloxFacebook(accessToken,result)
                           }
                       })
                     }
                   }

               const infoRequest = new GraphRequest( '/me', {
                 accessToken: accessToken,
                 parameters: {
                   fields: {
                     string: 'email,name,first_name,middle_name,last_name'
                   }
                 }
               },
               responseInfoCallback
             );

             // Start the graph request.
            new GraphRequestManager().addRequest(infoRequest).start();
          }
        )
      }
    },

    function (error) {
           console.log('Login fail with error: ' + error)
         }
       )
     }

    _loginWithQuickbloxNormal = () => {

        console.log("Validating user from Quickblox...");

        let formdata = new FormData()
        formdata.append('login', this.state.name)
        formdata.append('password', this.state.password)

        var REQUEST_URL = Constant.LOGIN_URL

        fetch(REQUEST_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'multipart/form-data',
                'QB-Token': this.state.qb_token
            },
            body:formdata
        })
        .then((response) => response.json())
        .then((responseData) => {
          console.log(responseData);
            this.setState({ loading: false })
            if(responseData.user) {

              console.log("Adding user to firebase");

              //Encrypt password
              var ciphertext = CryptoJS.AES.encrypt(this.state.password, Constant.FIREBASE_PASS_SECRET).toString();

              //Add user to firebase
              var updates = {};
              var newKey = firebase.database().ref().child('users').push().key;
              responseData.user.password = ciphertext
              responseData.user.id = responseData.user.id.toString()
              responseData.user["firid"] = newKey
              updates['/users/' + newKey] = responseData.user;
              firebase.database().ref().update(updates)

              //Save to local storage
              AsyncStorage.setItem(Constant.USER_TABEL_ID, newKey);

              if (responseData.user.id) {
                AsyncStorage.setItem(Constant.QB_USERID, responseData.user.id.toString());
              }

              if (responseData.user.login) {
                AsyncStorage.setItem(Constant.USER_FULL_NAME, responseData.user.login);
              }

              if (responseData.user.email) {
                AsyncStorage.setItem(Constant.USER_EMAIL, responseData.user.email);
              }

              if(responseData.user.blob_id) {
                  AsyncStorage.setItem(Constant.USER_BLOBID, responseData.user.blob_id.toString());
              }

              var isDataMigrated = "false"

              //Go to home
              this.getQB_Token_User(this.state.name,this.state.password)

            } else {
              console.log("Username Not found on Quickblox.")
              alert("Please enter correct username or password.")
            }
        }).catch((e) => {
            console.log(e)
        })
    }

    _loginWithQuickbloxFacebook = (token,result) => {
      console.log("Validating Facebook user from Quickblox...");

      var REQUEST_URL = Constant.LOGIN_URL

      let formdata = new FormData()
            formdata.append('provider', "facebook")
            formdata.append('keys[token]', token)

            fetch(REQUEST_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'QB-Token': this.state.qb_token
                },
                body:formdata
            })
            .then((response) => response.json())
            .then((responseData) => {
              console.log(responseData);
                this.setState({ loading: false })
                if(responseData.user) {

                  console.log("Adding user to firebase");

                  //Encrypt password
                  var ciphertext = CryptoJS.AES.encrypt(this.state.password, Constant.FIREBASE_PASS_SECRET).toString();

                  //Add user to firebase
                  var updates = {};
                  var newKey = firebase.database().ref().child('users').push().key;
                  responseData.user.password = ciphertext
                  responseData.user.id = responseData.user.id.toString()
                  responseData.user["firid"] = newKey
                  updates['/users/' + newKey] = responseData.user;
                  firebase.database().ref().update(updates)

                  //Save to local storage
                  AsyncStorage.setItem(Constant.USER_TABEL_ID, newKey);

                  if (responseData.user.id) {
                    AsyncStorage.setItem(Constant.QB_USERID, responseData.user.id.toString());
                  }

                  if (responseData.user.login) {
                    AsyncStorage.setItem(Constant.USER_FULL_NAME, responseData.user.login);
                  }

                  if (responseData.user.email) {
                    AsyncStorage.setItem(Constant.USER_EMAIL, responseData.user.email);
                  }

                  if(responseData.user.blob_id){
                      AsyncStorage.setItem(Constant.USER_BLOBID, responseData.user.blob_id.toString());
                  }

                  this.getQB_Token_User_Facebook(token)

                } else {
                  console.log("Facebook: User Not found on Firebase. Registering on firebase...")

                  //Get current date
                  let dt = new Date();
                  let dateString =  dt.toISOString();

                  var updates = {};
                  var newKey = firebase.database().ref().child('users').push().key;
                  var qbID = newKey
                  var isDataMigrated = "true"
                  let facebookID = result["id"]
                  let login = "facebook_" + facebookID

                  var user =  {"blob_id": 0,
                                  "created_at":dateString,
                                  "full_name":"",
                                  "id":newKey,
                                  "last_request_at":dateString,
                                  "login":login,
                                  "owner_id":0,
                                  "twitter_id":facebookID,
                                  "updated_at":dateString,
                                  "isDataMigrated":isDataMigrated,
                                  "firid": newKey,
                                }

                  updates['/users/' + newKey] = user;
                  firebase.database().ref().update(updates)

                  //save pref
                  AsyncStorage.setItem(Constant.USER_TABEL_ID, newKey);

                  if (qbID) {
                    AsyncStorage.setItem(Constant.QB_USERID, qbID);
                  }

                  if (login) {
                    AsyncStorage.setItem(Constant.USER_FULL_NAME, login);
                  }

                  console.log("Facebook: Registred on firebase.")

                  //Go to home
                  tmp._checkDataMigration(isDataMigrated)
                }
            }).catch((e) => {
                console.log(e)
            })
    }

    _loginWithQuickbloxTwitter = (token, secret,loginData) => {

      console.log("Validating Twitter user from Quickblox...");

      let formdata = new FormData()
      formdata.append('provider', "twitter")
      formdata.append('keys[token]', token)
      formdata.append('keys[secret]', secret)

      var REQUEST_URL = Constant.LOGIN_URL

      fetch(REQUEST_URL, {
          method: 'POST',
          headers: {
              'Content-Type': 'multipart/form-data',
              'QB-Token': this.state.qb_token
          },
          body:formdata
      })
      .then((response) => response.json())
      .then((responseData) => {
        console.log(responseData);
          this.setState({ loading: false })
          if(responseData.user) {

            console.log("Adding user to firebase");

            //Encrypt password
            var ciphertext = CryptoJS.AES.encrypt(this.state.password, Constant.FIREBASE_PASS_SECRET).toString();

            //Add user to firebase
            var updates = {};
            var newKey = firebase.database().ref().child('users').push().key;
            responseData.user.password = ciphertext
            responseData.user.id = responseData.user.id.toString()
            responseData.user["firid"] = newKey
            updates['/users/' + newKey] = responseData.user;
            firebase.database().ref().update(updates)

            //Save to local storage
            AsyncStorage.setItem(Constant.USER_TABEL_ID, newKey);

            if (responseData.user.id) {
              AsyncStorage.setItem(Constant.QB_USERID, responseData.user.id.toString());
            }

            if (responseData.user.login) {
              AsyncStorage.setItem(Constant.USER_FULL_NAME, responseData.user.login);
            }

            if (responseData.user.email) {
              AsyncStorage.setItem(Constant.USER_EMAIL, responseData.user.email);
            }

            if(responseData.user.blob_id){
                AsyncStorage.setItem(Constant.USER_BLOBID, responseData.user.blob_id.toString());
            }

            this.getQB_Token_User_Twitter(token,secret)

          } else {

            var isDataMigrated = "true"

            //Get current date
            let dt = new Date();
            let dateString =  dt.toISOString();

            var updates = {};
            var newKey = firebase.database().ref().child('users').push().key;
            var qbID = newKey
            var isDataMigrated = "true"
            let twitterId = loginData["userID"]
            let login = loginData["userName"] + "_" + twitterId

            var user =  {
              "blob_id": 0,
              "created_at":dateString,
              "full_name":"",
              "id":newKey,
              "last_request_at":dateString,
              "login":login,
              "owner_id":0,
              "twitter_id":twitterId,
              "updated_at":dateString,
              "isDataMigrated":isDataMigrated,
              "firid": newKey,
            }

            updates['/users/' + newKey] = user;
            firebase.database().ref().update(updates)

            //save pref
            AsyncStorage.setItem(Constant.USER_TABEL_ID, newKey);

            if (qbID) {
              AsyncStorage.setItem(Constant.QB_USERID, qbID);
            }

            if (login) {
              AsyncStorage.setItem(Constant.USER_FULL_NAME, login);
            }

            console.log("Twitter: Registred on firebase.")

            //Go to home
            this._checkDataMigration(isDataMigrated)

          }
      }).catch((e) => {
          console.log(e)
      })
    }

    validateEmail = (email) => {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    };

    _onRegister = () => {
        this.props.navigation.navigate('Register')
    }
    _onForgot = () => {
        this.props.navigation.navigate('Passwordrecovery')
    }

    showLoading(){
        if (this.state.loading) {
			return (
				<View style={styles.loadingView}>
					<ActivityIndicator color={'black'} size={'large'}/>
				</View>
			);
		}
    }

    setUserName(text){
        this.setState({ name: text })
    }
    setPassword(text){
        this.setState({ password: text })
    }
    getNextInput(data) {
		nextInput = data;
	}
   	changeFocus() {
		if (nextInput !== undefined) {
			nextInput.focus();
		}
	}
    render() {
        return (
            <View style = {styles.container}>
                <Image source = {require('../../assets/img/splash.png')} style = {styles.bg}/>
                <KeyboardAwareScrollView
                    contentContainerStyle = {styles.container}
                    scrollEnabled = {false}
                    style = {{backgroundColor: 'transparent'}}
                    resetScrollToCoords = {{x:0, y:0}}
                >
                    <View style = {styles.wrapperView}>
                        <View style = {styles.logoView}>
                            <Text style = {styles.logotitle}>PawPads</Text>
                        </View>
                        <View style = {styles.nameView}>
                            <TextInput
                                style = {styles.nameInput}
                                autoCapitalize= 'none'
                                autoCorrect = {false}
                                spellCheck = {false}
                                returnKeyType = 'next'
                                placeholder = {this.state.isname == true ? 'Login': 'Name is required'}
                                placeholderTextColor = { this.state.isname == true ? 'black': 'red' }
                                underlineColorAndroid = 'transparent'
                                value = {this.state.name}
                                onChangeText = {(text) => this.setUserName(text)}
                                onSubmitEditing={this.changeFocus.bind(this)}
                            />
                        </View>
                        <View style = {styles.passwordView}>
                            <TextInput
                                ref={this.getNextInput.bind(this)}
                                autoCapitalize= 'none'
                                autoCorrect = {false}
                                spellCheck = {false}
                                style = {styles.passwordInput}
                                returnKeyType = 'done'
                                placeholder = {this.state.ispassword == true ? 'Password': 'Passowrd is required'}
                                placeholderTextColor = { this.state.ispassword == true ? 'black': 'red' }
                                secureTextEntry = {true}
                                underlineColorAndroid = 'transparent'
                                value = {this.state.password}
                                onChangeText = {(text) => this.setPassword(text)}
                                onSubmitEditing={this._onLogin}
                            />
                            <TouchableOpacity style = {styles.forgotView} onPress = {this._onForgot}>
                                <Text>?</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style = {styles.loginButton} onPress = {this._onLogin}>
                            <Image source = {require('../../assets/img/transparent_button.png')} style = {styles.loginButtonImg}/>
                            <Text style = {styles.login}>Log In</Text>
                        </TouchableOpacity>

                        <View style = {styles.registerView}>
                            <Text style = {styles.txt1}>Dont have an account? </Text>
                            <TouchableOpacity onPress = {this._onRegister}>
                                <Text style = {styles.register}>  Register </Text>
                            </TouchableOpacity>
                        </View>

                        <Text style = {styles.loginwith}>Login with</Text>

                        <View style = {styles.socialView}>
                            <TouchableOpacity onPress={this.firebaseLoginFacebook}>
                                <Image source = {require('../../assets/img/facebook.png')} style = {{width: 40, height: 40}}/>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={this.firebaseLoginTwitter}>
                                <Image source = {require('../../assets/img/twitter.png')} style = {{width: 40, height: 40, marginLeft: 15}}/>
                            </TouchableOpacity>
                        </View>

                    </View>
                </KeyboardAwareScrollView>

                {this.showLoading()}

            </View>
        );
    }
}

// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    bg: {
        position:'absolute',
        top: 0,
        left: 0,
        width: Constant.WIDTH_SCREEN,
        height: Constant.HEIGHT_SCREEN,
        resizeMode: 'stretch'
    },
    wrapperView:{
        paddingLeft: 50,
        paddingRight: 50,
        flex:1,
        alignItems:'center'
    },
    logoView: {
        width: Constant.WIDTH_SCREEN - 100,
        height: 40,
        marginTop: Constant.HEIGHT_SCREEN*0.3
    },
    logotitle: {
        fontSize: 30,
        color: 'white',
        backgroundColor: 'transparent',
        // fontFamily: 'Bellota_BoldItalic'
    },
    nameView: {
        width: Constant.WIDTH_SCREEN - 100,
        height: 45,
        backgroundColor: 'white',
        justifyContent: 'center',
        paddingLeft: 10,
        paddingRight: 10,
        borderRadius: 3,
        marginTop: 20
    },
    nameInput: {
        width: Constant.WIDTH_SCREEN - 100,
        textAlign:'left',
        fontSize: 14,
        color: 'black'
    },
    passwordInput: {
        // width: Constant.WIDTH_SCREEN - 150,
        flex:1,
        textAlign:'left',
        fontSize: 14,
        color: 'black'
    },
    passwordView:{
        marginTop: 15,
        width: Constant.WIDTH_SCREEN - 100,
        height: 45,
        backgroundColor: 'white',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: 10,
        paddingRight: 10,
        borderRadius: 3,
        flexDirection: 'row',

    },
    loginButton:{
        width: Constant.WIDTH_SCREEN - 100,
        height: 45,
        marginTop: 15,
        borderRadius: 3,
        alignItems: 'center',
        justifyContent: 'center'
    },
    loginButtonImg: {
        width: Constant.WIDTH_SCREEN - 100,
        height: 50,
        position:'absolute',
        top: 0,
        left: 0,
        borderRadius: 3,
    },
    login: {
        color: 'white',
        fontSize: 15,
        backgroundColor: 'transparent'
    },
    txt1: {
        backgroundColor: 'transparent',
        fontSize: 14,
        color: 'white',
        opacity: 0.8
    },
    registerView: {
        marginTop: 50,
        flexDirection: 'row',
        justifyContent:'center',
        alignItems:'center',
        height: 30,

    },
    register: {
        fontWeight: 'bold',
        color: 'white',
        backgroundColor: 'transparent',
        fontSize: 14,
    },
    loginwith: {
        backgroundColor: 'transparent',
        fontSize: 14,
        color: 'white',
        opacity: 0.8,
        marginTop: 15
    },
    socialView: {
        marginTop: 20,
        flexDirection: 'row',
    },
    forgotView: {
        width: 30,
        height: 30,
        backgroundColor: '#dfdfdf',
        borderRadius: 15,
        alignItems:'center',
        justifyContent:'center'
    },
    loadingView: {
        flex: 1,
        position: 'absolute',
        top: Constant.HEIGHT_SCREEN/2
    }
});

//make this component available to the app
// export default Login;

const mapStateToProps = ({auth}) => {
	const {email, password, error, platform, loading} = auth;
	return {email, password, error, platform, loading};
};

export default connect(mapStateToProps)(Login);
