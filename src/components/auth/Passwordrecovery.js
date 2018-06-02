//import libraries
import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity,ActivityIndicator, StatusBar, Platform, ScrollView,Alert,ToastAndroid } from 'react-native';
import Constant from '../../common/Constant'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import RNFirebase from 'react-native-firebase';

const firebase = RNFirebase.initializeApp({ debug: false, persistence: true })
var CryptoJS = require("crypto-js");

var RandomNumber = Math.floor(Math.random() * 1000000) + 1 ;

var isAlert = false
var isName = false
var isEmail = false
var isPassword = false
var isConfirm = false
var isEmail = false

// create a component
class Passwordrecovery extends Component {
    constructor(props){
        super(props)
        this.state = {
            email: '',
            isEmail: false,
            tableId:'',
            loading:false,
        }
    }

    _onback = () => {
        this.props.navigation.goBack()
        this.setState({ loading: false })
    }

    _emailSend = () => {
      // https://api.sendgrid.com/api/mail.send.json
         fetch("https://api.sendgrid.com/api/mail.send.json?api_user=nirav.k&api_key=nirav$14*1.&to="+this.state.email+" &subject=Reset your Pawpads password&text=Hey there,\n Recently you have requested to reset Pawpads app password. Passcode is: "+RandomNumber+" \n\n Thanks, \n Pawpads Team &from=noreply@pawpadsapp.com"
       ).then((response) => response.text())
        .then((responseText) => {
          this.props.navigation.navigate('EnterPasscode', {tableId:this.state.tableId})
          this.setState({ loading: false })

        })
        .catch((error) => {
            console.error(error);
            this.setState({ loading: false })
        });
    }

    _onRecover = () => {

        isEmail = false
        if(this.state.email.length == 0){
            isEmail = true
        } else {
            this.setState({ isEmail: isEmail,loading: true  })

          firebase.database()
              .ref('users')
              .orderByChild('email')
              .equalTo(this.state.email.toLowerCase())
              .once("value")
              .then(snapshot => {
                  if (snapshot.val()) {

                      let response = snapshot.val()
                      var keys = Object.keys(response);
                      var tableId =  keys[keys.length-1]

                      this.setState({tableId : tableId})

                      firebase.database().ref('users/'+tableId).update({passcode:RandomNumber});
                      
                      this._emailSend()

                  }else {
                    this.setState({ loading: false })

                    Alert.alert("Pawpads", 'Email address not found!');
                  }
              })

        }
       
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
                    <Text style = {styles.title}>Password Recovery</Text>
                </View>
                <ScrollView style = {styles.mScrollView}>
                    <View style = {styles.mainView}>
                        <Text style = {styles.detail}>Enter email adderss below to reset your password. We will send the passcode to this email address.</Text>
                        <View style = {styles.emailView}>
                            <TextInput
                                style = {styles.emailInput}
                                returnKeyType = 'done'
                                placeholder = {this.state.isEmail == false? 'Email': 'Email is required'}
                                placeholderTextColor = {this.state.isEmail == false? 'black': '#f94746'}
                                autoCorrect = {false}
                                underlineColorAndroid = 'transparent'
                                autoCapitalize= 'none'
                                value = {this.state.email}
                                onChangeText = {(text) => {this.setState({ email: text })}}
                            />
                        </View>

                        <TouchableOpacity style = {styles.recoveryButton} onPress = {this._onRecover}>
                            <Text style = {styles.recover}>Recover</Text>
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
        marginTop: 70
    },
    loadingView: {
        flex: 1,
        position: 'absolute',
        top: Constant.HEIGHT_SCREEN/2
    }
});

//make this component available to the app
export default Passwordrecovery;
