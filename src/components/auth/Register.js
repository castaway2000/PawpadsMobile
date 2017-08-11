//import liraries
import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, StatusBar, Platform, ScrollView } from 'react-native';
import Constant from '../../common/Constant'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

var isAlert = false
var isName = false
var isEmail = false
var isPassword = false
var isConfirm = false

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
        }
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

        if(!this.validateEmail(this.state.email)){
            alert('The email address is not a valid format')
        }else{
            if(this.state.password.length < 6){
                alert('The password must be at least 6 letters.')
            }else{
                // const { navigate } = this.props.navigation
                // navigate ('Register')
            }
        }

        validateEmail = (email) => {
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        };
        if(isAlert == true){
            this.setState({ 
                isAlert: isAlert, 
                isName: isName,
                isEmail: isEmail,
                isPassword: isPassword,
                isConfirm: isConfirm,
            })
        }
    }
    render() {
        return (
            <View style={styles.container}>
                <View style = {styles.tabView}>
                    <TouchableOpacity style = {styles.backButton} onPress = {this._onback}>
                        <Image source = {require('../../assets/img/back.png')} style = {{width: 18, height: 18}}/>
                    </TouchableOpacity>
                    <Text style = {styles.title}>Registration</Text>
                </View>
                <ScrollView style = {styles.mScrollView}>
                    <View style = {styles.mainView}>
                        <View style = {styles.nameView}>
                            <TextInput
                                style = {styles.nameInput}
                                returnKeyType = 'next'
                                placeholder = 'Name'
                                placeholderTextColor = {this.state.isName == false? 'black': '#f94746'}
                                autoCorrect = {true}
                                underlineColorAndroid = 'transparent'
                                value = {this.state.name}
                                onChangeText = {(text) => {this.setState({ name: text })}}
                            />
                        </View>
                        <View style = {styles.nameView}>
                            <TextInput
                                style = {styles.nameInput}
                                returnKeyType = 'next'
                                placeholder = 'Email'
                                placeholderTextColor = {this.state.isEmail == false? 'black': '#f94746'}
                                autoCorrect = {true}
                                underlineColorAndroid = 'transparent'
                                value = {this.state.email}
                                onChangeText = {(text) => {this.setState({ email: text })}}
                            />
                        </View>
                        <View style = {styles.nameView}>
                            <TextInput
                                style = {styles.nameInput}
                                returnKeyType = 'next'
                                placeholder = 'Password'
                                placeholderTextColor = {this.state.isPassword == false? 'black': '#f94746'}
                                secureTextEntry = {true}
                                autoCorrect = {true}
                                underlineColorAndroid = 'transparent'
                                value = {this.state.password}
                                onChangeText = {(text) => {this.setState({ password: text })}}
                            />
                        </View>
                        <View style = {styles.nameView}>
                            <TextInput
                                style = {styles.nameInput}
                                returnKeyType = 'next'
                                placeholder = 'Confirm password'
                                placeholderTextColor = {this.state.isConfirm == false? 'black': '#f94746'}
                                secureTextEntry = {true}
                                autoCorrect = {true}
                                underlineColorAndroid = 'transparent'
                                value = {this.state.confirm}
                                onChangeText = {(text) => {this.setState({ confirm: text })}}
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
                </ScrollView>
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
