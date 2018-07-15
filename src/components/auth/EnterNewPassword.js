//import libraries
import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, StatusBar,ActivityIndicator, Platform, ScrollView ,Alert} from 'react-native';
import Constant from '../../common/Constant'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import RNFirebase from 'react-native-firebase';
import hmacSHA1 from 'crypto-js/hmac-sha1'

const firebase = RNFirebase.initializeApp({ debug: false, persistence: true })

var CryptoJS = require("crypto-js");

var isAlert = false
var isName = false
var isEmail = false
var isPassword = false
var isConfirm = false
var isEmail = false

// create a component
class Passwordrecovery extends Component {
    constructor(props) {
        super(props)
        this.state = {
            password: '',
            conpassword: '',
            ispassword: false,
            isconfirm: true,
            loading: false,
        }
    }

    _onback = () => {
        this.props.navigation.goBack()
    }

    _onRecover = () => {
        ispassword = false
        isconfirm = true

        if (this.state.password.length == 0) {

            ispassword = true

        } else {

          if (this.state.conpassword.length == 0) {

            isConfirm = false

          } else {

            if (this.state.password == this.state.conpassword ) {

                if(this.state.password.length < 8) {

                    Alert.alert("Pawpads", 'Password is too short (Minimum 8 characters).');

                } else {

                  this.setState({loading:true})
                  const {state} = this.props.navigation;
                  var name = state.params ? state.params.tableId : "";

                  var ciphertext = CryptoJS.AES.encrypt(this.state.password, Constant.FIREBASE_PASS_SECRET).toString();

                  firebase.database().ref('users/'+name).update({password:ciphertext});
                  this.props.navigation.navigate('Login')

                  Alert.alert("Pawpads", "Your password has been change successfully.\nNow login using your new password");

                  this.setState({loading:false})
                }
                
            } else {

              Alert.alert("Pawpads", 'Password does not match');
              
            }
        }
      }
        this.setState({ ispassword: ispassword, isConfirm: isConfirm })
    }

    render() {
        <StatusBar
            barStyle = "light-content"
            backgroundColor = 'blue'
        />
        return (

            <View style={styles.container}>
                <View style = {styles.statusbar}/>
                <View style = {styles.tabView}>
                    <TouchableOpacity style = {styles.backButton} onPress = {this._onback}>
                        <Image source = {require('../../assets/img/back.png')} style = {{width: 18, height: 18}}/>
                    </TouchableOpacity>
                    <Text style = {styles.title}>New Password</Text>
                </View>
                <ScrollView style = {styles.mScrollView}>
                    <View style = {styles.mainView}>
                        <Text style = {styles.detail}>Create a new password</Text>
                        <Text style = {styles.detail_below}>Password are case sensitive and must be at least 8 charecters.</Text>

                        <View style = {styles.emailView}>
                            <TextInput
                                style = {styles.emailInput}
                                returnKeyType = 'done'
                                placeholder = {this.state.ispassword == false? 'Enter new password': 'Password is required'}
                                placeholderTextColor = {this.state.ispassword == false? 'black': '#f94746'}
                                secureTextEntry = {true}
                                autoCorrect = {true}
                                underlineColorAndroid = 'transparent'
                                value = {this.state.password}
                                onChangeText = {(text) => {this.setState({ password: text })}}
                            />
                        </View>

                        <View style = {styles.emailView}>
                            <TextInput
                                style = {styles.emailInput}
                                returnKeyType = 'done'
                                placeholder = {this.state.isConfirm == false? 'Confirm password is required' : 'Confirm password'}
                                placeholderTextColor = {this.state.isConfirm == false? '#f94746':'black'}
                                autoCorrect = {true}
                                secureTextEntry = {true}
                                underlineColorAndroid = 'transparent'
                                value = {this.state.conpassword}
                                onChangeText = {(text) => {this.setState({ conpassword: text })}}
                            />
                        </View>

                        <TouchableOpacity style = {styles.recoveryButton} onPress = {this._onRecover}>
                            <Text style = {styles.recover}>RESET</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>

                {this.state.loading &&
                  <View style={styles.loadingView}>
                    <ActivityIndicator color={'black'} size={'large'}/>
                  </View>
                }

            </View>
        );
    }
}


// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: 'white',
    },
    statusbar:{
        width: Constant.WIDTH_SCREEN,
        height: (Platform.OS == 'ios')? 20 : StatusBar.currentHeight,
        backgroundColor: Constant.APP_COLOR,
        position: 'absolute',
        top: 0,
        left: 0,
    },
    tabView: {
        width: Constant.WIDTH_SCREEN,
        height: 60,
        paddingLeft: 5,
        marginTop: (Platform.OS == 'ios')? 20 : StatusBar.currentHeight,
        flexDirection:'row',
        alignItems:'center',
        backgroundColor: Constant.APP_COLOR,
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
    emailView: {
        width: Constant.WIDTH_SCREEN - 100,
        height: 45,
        justifyContent: 'center',
        paddingLeft: 10,
        paddingRight: 10,
        borderRadius: 3,
        marginTop: 40,
        backgroundColor:'#e7e7e7'
    },
    emailInput: {
        width: Constant.WIDTH_SCREEN - 100,
        textAlign:'left',
        fontSize: 14,
        color: 'black',

    },

    recoveryButton:{
        width: Constant.WIDTH_SCREEN - 100,
        height: 45,
        marginTop: 30,
        borderRadius: 3,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Constant.APP_COLOR,
    },
    recover: {
        color: 'white',
        fontSize: 15,
        backgroundColor: 'transparent'
    },
    detail: {
        textAlign: 'center',
        color: 'gray',
        marginTop: 30
    },
    detail_below: {
        textAlign: 'center',
        color: 'gray',
        marginTop: 10,
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
    }
});

//make this component available to the app
export default Passwordrecovery;
