//import libraries
import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, StatusBar, Platform, ScrollView,Keyboard,AsyncStorage } from 'react-native';
import Constant from '../../common/Constant'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import hmacSHA1 from 'crypto-js/hmac-sha1'
import RNFirebase from 'react-native-firebase';

var isAlert = false
var isName = false
var isEmail = false
var isPassword = false
var isConfirm = false
let nextInput1;
let nextInput2;
let nextInput3;

const firebase = RNFirebase.initializeApp({ debug: false, persistence: true })
var CryptoJS = require("crypto-js");

// create a component
class Register extends Component {
    constructor(props){
        super(props)
        this.state = {
            name: '',
            email: '',
            password: '',
            confirm: '',
            isAlert: false,
            isName: false,
            isEmail: false,
            isPassword: false,
            isConfirm: false,
            qb_token: '',
        }
    }
    componentWillMount() {
        var time = parseInt(Date.now()/1000)
        var signatureParams = 'application_id='+ Constant.QB_APPID + '&auth_key=' + Constant.QB_AUTH_KEY + '&nonce=' + time + '&timestamp=' + time
        var signature = ''
        signature = hmacSHA1(signatureParams, Constant.QB_AUTH_SECRET).toString()
        this.getQB_Token(time, signature)
    }

    getQB_Token(time, signature){
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
          console.log("token responce:",responseData);

            var token = responseData.session.token
            this.setState({
                qb_token: token
            })
        }).catch((e) => {
            console.log(e)
        })
    }

    getNextInput1(data) {
		nextInput1 = data;
	}
    getNextInput2(data) {
		nextInput2 = data;
	}
    getNextInput3(data) {
		nextInput3 = data;
	}

	changeFocus1() {
		if (nextInput1 !== undefined) {
			nextInput1.focus();
		}
	}
    changeFocus2() {
		nextInput2.focus();
	}
    changeFocus3() {
		nextInput3.focus();
	}

    _onback = () => {
        this.props.navigation.goBack()
    }

    _onSignup = () => {

        isAlert = false
        isName = false
        isEmail = false
        isPassword = false
        isConfirm = false

        if(this.state.name.length == 0 ){
            isAlert = true
            isName = true
        }
        if(this.state.email.length == 0 ){
            isAlert = true
            isEmail = true
        }
        if(this.state.password.length == 0 ){
            isAlert = true
            isPassword = true
        }
        if(this.state.confirm.length == 0 ){
            isAlert = true
            isConfirm = true
        }

        if (this.state.email.length > 0) {

          if (!this.validateEmail(this.state.email)) {
            alert('Wrong email format')
          } else {

            if ((this.state.password.length > 0)) {
              if (this.state.password.length < 8) {
                  alert('Password is to short (mimimum 8 characters).')
              } else {
                  if(this.state.password == this.state.confirm){
                      // const { navigate } = this.props.navigation
                      // navigate ('Register')
                      this._signupWithFirebase()
                  } else {
                      alert('Passwords do not match')
                  }
              }
            }
          }
        }

        if(isAlert == true){
            this.setState({
                isAlert: isAlert,
                isName: isName,
                isEmail: isEmail,
                isPassword: isPassword,
                isConfirm: isConfirm,
            })
        }

        Keyboard.dismiss();

    }

    _signupWithFirebase = () => {

      var rootRef = firebase.database().ref().child('users').push().key;

      //Check username regestred
      firebase.database()
          .ref(`/users`)
          .orderByChild("login")
          .equalTo(this.state.name)
          .once("value")
          .then(snapshot => {
            this.setState({ loading: false })
              if (snapshot.val()) {
                alert("Username already registred.")
              } else {
                console.log("Username not registred.")

                //Check email regestred
                firebase.database()
                    .ref(`/users`)
                    .orderByChild("email")
                    .equalTo(this.state.email)
                    .once("value")
                    .then(snapshot => {
                      this.setState({ loading: false })
                        if (snapshot.val()) {
                          alert("Email already registred.")
                        } else {
                          console.log("Email not registred.");
                          //Register on Firebase as new user

                          //Get current date
                          let dt = new Date();
                          let dateString =  dt.toISOString();

                          //Encrypt password
                          var ciphertext = CryptoJS.AES.encrypt(this.state.password, Constant.FIREBASE_PASS_SECRET).toString();

                          var updates = {};
                          var newKey = firebase.database().ref().child('users').push().key;

                          var user =  {"blob_id": 0,
                                          "created_at":dateString,
                                          "full_name":"",
                                          "id":newKey,
                                          "last_request_at":dateString,
                                          "login":this.state.name,
                                          "owner_id":0,
                                          "twitter_id":"",
                                          "updated_at":dateString,
                                          "password":ciphertext,
                                          "email": this.state.email,
                                          "isDataMigrated":"true",
                                          "isTogglepushSelected":"true"}

                          updates['/users/' + newKey] = user;
                          firebase.database().ref().update(updates)

                          //Save to local storage
                          //AsyncStorage.setItem(Constant.USER_TABEL_ID, newKey);
                          //AsyncStorage.setItem(Constant.QB_USERID, newKey);
                          //AsyncStorage.setItem(Constant.USER_FULL_NAME, this.state.name);
                          //AsyncStorage.setItem(Constant.USER_LOGIN, this.state.name);
                          //AsyncStorage.setItem(Constant.USER_EMAIL, this.state.email);

                          alert('Registration Successful.')

                          this.props.navigation.goBack()
                        }
                    })
              }
          })
    }

    signup() {
        let formdata = new FormData()
        formdata.append('user[login]', this.state.name)
        formdata.append('user[password]', this.state.password)
        formdata.append('user[email]', this.state.email)

        var REQUEST_URL = Constant.REGISTER_URL
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
          console.log("register responce:",responseData);
            if(responseData.errors){
                alert(responseData.errors.email[0])
            } else {
                this.props.navigation.goBack()
            }
        }).catch((e) => {
            console.log(e)
        })
    }

    validateEmail = (email) => {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    };

    render() {
        return (
            <View style={styles.container}>
                <View style = {styles.tabView}>
                    <TouchableOpacity style = {styles.backButton} onPress = {this._onback}>
                        <Image source = {require('../../assets/img/back.png')} style = {{width: 18, height: 18}}/>
                    </TouchableOpacity>
                    <Text style = {styles.title}>Registration</Text>
                </View>
                <KeyboardAwareScrollView style = {styles.mScrollView}>
                    <View style = {styles.mainView}>
                        <View style = {styles.nameView}>
                            <TextInput
                                style = {styles.nameInput}
                                autoCapitalize= 'none'
                                autoCorrect = {false}
                                spellCheck = {false}
                                returnKeyType = 'next'
                                placeholder = {this.state.isName == false? 'Username': 'Username is required.'}
                                placeholderTextColor = {this.state.isName == false? 'black': '#f94746'}
                                underlineColorAndroid = 'transparent'
                                value = {this.state.name}
                                onChangeText = {(text) => {this.setState({ name: text })}}
                                onSubmitEditing={this.changeFocus1.bind(this)}
                            />
                        </View>
                        <View style = {styles.nameView}>
                            <TextInput
                                ref={this.getNextInput1.bind(this)}
                                style = {styles.nameInput}
                                autoCapitalize= 'none'
                                autoCorrect = {false}
                                spellCheck = {false}
                                returnKeyType = 'next'
                                placeholder = {this.state.isEmail == false? 'Email': 'Email is required.'}
                                keyboardType = 'email-address'
                                placeholderTextColor = {this.state.isEmail == false? 'black': '#f94746'}
                                underlineColorAndroid = 'transparent'
                                value = {this.state.email}
                                onChangeText = {(text) => {this.setState({ email: text })}}
                                onSubmitEditing={this.changeFocus2.bind(this)}
                            />
                        </View>
                        <View style = {styles.nameView}>
                            <TextInput
                                ref={this.getNextInput2.bind(this)}
                                style = {styles.nameInput}
                                autoCapitalize= 'none'
                                autoCorrect = {false}
                                spellCheck = {false}
                                returnKeyType = 'next'
                                placeholder = {this.state.isPassword == false? 'Password': 'Password is required.'}
                                placeholderTextColor = {this.state.isPassword == false? 'black': '#f94746'}
                                secureTextEntry = {true}
                                underlineColorAndroid = 'transparent'
                                value = {this.state.password}
                                onChangeText = {(text) => {this.setState({ password: text })}}
                                onSubmitEditing={this.changeFocus3.bind(this)}
                            />
                        </View>
                        <View style = {styles.nameView}>
                            <TextInput
                                ref={this.getNextInput3.bind(this)}
                                style = {styles.nameInput}
                                autoCapitalize= 'none'
                                autoCorrect = {false}
                                spellCheck = {false}
                                returnKeyType = 'go'
                                placeholder = {this.state.isConfirm == false? 'Confirm password': 'Confirm password is required.'}
                                placeholderTextColor = {this.state.isConfirm == false? 'black': '#f94746'}
                                secureTextEntry = {true}
                                underlineColorAndroid = 'transparent'
                                value = {this.state.confirm}
                                onChangeText = {(text) => {this.setState({ confirm: text })}}
                                onSubmitEditing={this._onSignup}
                            />
                        </View>
                        {this.state.isAlert == true?
                            <Text style = {styles.alert}>All fields are required</Text>:
                            <Text style = {styles.alert}></Text>
                        }

                        <TouchableOpacity style = {styles.signupButton} onPress = {this._onSignup}>
                            <Image source = {require('../../assets/img/transparent_button.png')} style = {styles.signupButtonImg}/>
                            <Text style = {styles.signup}>Sign up</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAwareScrollView>
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
        height: 60,
        paddingLeft: 5,
        marginTop: (Platform.OS == 'ios')? 20 : StatusBar.currentHeight,
        flexDirection:'row',
        alignItems:'center',
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
        fontSize: 20
    },
    mScrollView: {
        flex: 1,
        width: Constant.WIDTH_SCREEN,
        paddingLeft: 50,
        paddingRight: 50,
    },
    mainView: {
        flex: 1,
        alignItems:'center',
        justifyContent: 'center',
        paddingTop: 100
    },
    nameView: {
        width: Constant.WIDTH_SCREEN - 100,
        height: 45,
        backgroundColor: 'white',
        justifyContent: 'center',
        paddingLeft: 10,
        paddingRight: 10,
        borderRadius: 3,
        marginTop: 15
    },
    nameInput: {
        width: Constant.WIDTH_SCREEN - 100,
        textAlign:'left',
        fontSize: 14,
        color: 'black'
    },
    alert:{
        color: 'white',
        opacity: 0.8,
        fontSize: 14,
        marginTop: 15
    },
    signupButton:{
        width: Constant.WIDTH_SCREEN - 100,
        height: 45,
        marginTop: 30,
        borderRadius: 3,
        alignItems: 'center',
        justifyContent: 'center'
    },
    signupButtonImg: {
        width: Constant.WIDTH_SCREEN - 100,
        height: 45,
        position:'absolute',
        top: 0,
        left: 0,
        borderRadius: 3,
    },
    signup: {
        color: 'white',
        fontSize: 15,
        backgroundColor: 'transparent'
    },
});

//make this component available to the app
export default Register;
