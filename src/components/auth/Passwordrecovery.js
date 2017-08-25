//import libraries
import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, StatusBar, Platform, ScrollView } from 'react-native';
import Constant from '../../common/Constant'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

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
            isEmail: false
        }
    }
    _onback = () => {
        this.props.navigation.goBack()
    }
    _onRecover = () => {
        isEmail = false
        if(this.state.email.length == 0){
            isEmail = true
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
                    <Text style = {styles.title}>Password Recovery</Text>
                </View>
                <ScrollView style = {styles.mScrollView}>
                    <View style = {styles.mainView}>
                        <Text style = {styles.detail}>Send us your email and we will send you a code to reset your password</Text>
                        <View style = {styles.emailView}>
                            <TextInput
                                style = {styles.emailInput}
                                returnKeyType = 'done'
                                placeholder = {this.state.isEmail == false? 'Email': 'Email is required'}
                                placeholderTextColor = {this.state.isEmail == false? 'black': '#f94746'}
                                autoCorrect = {true}
                                underlineColorAndroid = 'transparent'
                                value = {this.state.email}
                                onChangeText = {(text) => {this.setState({ email: text })}}
                            />
                        </View>
          
                        <TouchableOpacity style = {styles.recoveryButton} onPress = {this._onRecover}>
                            <Text style = {styles.recover}>Recover</Text>
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
    }
});

//make this component available to the app
export default Passwordrecovery;
