//import libraries
import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, StatusBar, ActivityIndicator, Platform, ScrollView ,Alert} from 'react-native';
import Constant from '../../common/Constant'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import RNFirebase from 'react-native-firebase';

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
    constructor(props){
        super(props)
        this.state = {
            passcode: '',
            isEmail: false,
            loading : false,
        }
    }

    _onback = () => {
        this.props.navigation.goBack()
    }

    _onRecover = () => {
        isEmail = false
        if(this.state.passcode.length == 0){
            isEmail = true
        }else {
          this.setState({loading:true})
          firebase.database().ref('users')
            .once('value').then((snapshot) => {

              const {state} = this.props.navigation;
              var name = state.params ? state.params.tableId : "";

              var passcode = snapshot.child(name).child('passcode').val() +"";
              var enterpasscode = this.state.passcode +"";

              if (enterpasscode ==  passcode) {
                this.setState({loading:false})

                this.props.navigation.navigate('EnterNewPassword', {tableId:name})
              }else {
                this.setState({loading:false})

                Alert.alert('Code not match ! Please try again')
              }
          })
        }
        this.setState({ isEmail: isEmail })
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
                    <Text style = {styles.title}>Passcode</Text>
                </View>
                <ScrollView style = {styles.mScrollView}>
                    <View style = {styles.mainView}>
                        <Text style = {styles.detail}>Enter your Passcode for reset your Password.</Text>
                        <Text style = {styles.title_}>Email has been send to your email account.</Text>
                        <View style = {styles.emailView}>
                            <TextInput
                                style = {styles.emailInput}
                                returnKeyType = 'done'
                                placeholder = {this.state.isEmail == false? 'Pass code': 'Passcode is required!'}
                                placeholderTextColor = {this.state.isEmail == false? 'black': '#f94746'}
                                autoCorrect = {true}
                                underlineColorAndroid = 'transparent'
                                value = {this.state.passcode}
                                onChangeText = {(text) => {this.setState({ passcode: text })}}
                            />
                        </View>

                        <TouchableOpacity style = {styles.recoveryButton} onPress = {this._onRecover}>
                            <Text style = {styles.recover}>CONFIRM</Text>
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
        marginTop: 50,
    },
    title_: {
        textAlign: 'center',
        color: 'gray',
        marginTop: 10,
        color:Constant.APP_COLOR,
        fontWeight: 'bold',
    },
    loadingView: {
        flex: 1,
        position: 'absolute',
        top: Constant.HEIGHT_SCREEN/2
    }
});

//make this component available to the app
export default Passwordrecovery;
