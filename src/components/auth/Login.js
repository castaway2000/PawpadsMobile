//import libraries
import React, { Component } from 'react';
import { View,  StyleSheet,Text, Image, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView } from 'react-native';
import { KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view'
import Constant from '../../common/Constant'
import { Font } from 'expo'

// create a component
class Login extends Component {
    static navigationOptions = {
        title:'',
        header: null
    };

    constructor(props){
        super(props)
        this.state = {
            name: '',
            password: '',    
        }
    }
    _onLogin = () => {
        // if(!this.validateEmail(this.state.name)){
        //     alert('The email address is not a valid format')
        // }else{
        //     if(this.state.password.length < 6){
        //         alert('The password must be at least 6 letters.')
        //     }else{
                const { navigate } = this.props.navigation
                navigate ('Drawer')
        //     }
        // }

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



    setUserName(text){
        this.setState({ name: text })
    }
    setPassword(text){
        this.setState({ password: text })
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
                                returnKeyType = 'next'
                                placeholder = 'Login'
                                placeholderTextColor = 'black'
                                autoCorrect = {true}
                                underlineColorAndroid = 'transparent'
                                value = {this.state.name}
                                onChangeText = {(text) => this.setUserName(text)}
                            />
                        </View>
                        <View style = {styles.passwordView}>
                            <TextInput
                                style = {styles.passwordInput}
                                returnKeyType = 'done'
                                placeholder = 'Password'
                                placeholderTextColor = 'black'
                                autoCorrect = {true}
                                secureTextEntry = {true}
                                underlineColorAndroid = 'transparent'
                                value = {this.state.password}
                                onChangeText = {(text) => this.setPassword(text)}
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
                            <Text style = {styles.txt1}>Don't have an account? </Text>
                            <TouchableOpacity onPress = {this._onRegister}>
                                <Text style = {styles.register}>  Register </Text>
                            </TouchableOpacity>
                        </View>

                        <Text style = {styles.loginwith}>Login with</Text>
                        
                        <View style = {styles.socialView}>
                            <TouchableOpacity>
                                <Image source = {require('../../assets/img/facebook.png')} style = {{width: 40, height: 40}}/>
                            </TouchableOpacity>
                            <TouchableOpacity>
                                <Image source = {require('../../assets/img/twitter.png')} style = {{width: 40, height: 40, marginLeft: 15}}/>
                            </TouchableOpacity>
                        </View>
                        
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
        fontSize: 20,
        color: 'white',
        backgroundColor: 'transparent',
        // fontFamily: 'Roboto'
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
    }
});

//make this component available to the app
export default Login;
