//import libraries
import React, { Component } from 'react';
import { View,  StyleSheet,Text, Image, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, ActivityIndicator, Keyboard, AsyncStorage } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { connect } from 'react-redux';
import { loginUser, passwordChanged } from '../../actions';
import Constant from '../../common/Constant'
var CryptoJS = require("crypto-js")
import hmacSHA1 from 'crypto-js/hmac-sha1'
import {formatDate} from '../../actions/const';
import {
    EMAIL_CHANGED,
    PASSWORD_CHANGED,
    LOGIN_USER_SUCCESS ,
    LOGIN_USER_FAIL,
    LOGIN_USER,
} from '../../actions/types'

let nextInput;

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
            qb_token: '',
            loading: this.props.loading,
            isname: true,
            ispassword: true
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
                'Content-Type': 'application/json',
            },
            body:formdata
        })
        .then((response) => response.json())
        .then((responseData) => {
            console.log(responseData)
            var token = responseData.session.token
            AsyncStorage.setItem(Constant.QB_TOKEN, token);
            this.setState({
                qb_token: token
            })
        }).catch((e) => {
            console.log(e)
        })   
    }
    
    _onLogin = () => {
        if(this.state.name.length < 1){
            this.setState({ isname: false })
        }else{
            if(this.state.password.length < 1){
                this.setState({ ispassword: false })
            }else{
                this.Login()
		        Keyboard.dismiss();
            }
        }
    }
    Login(){
        this.setState({ loading: true })
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
            this.setState({ loading: false })
            if(responseData.user){
                var id = responseData.user.id

                AsyncStorage.setItem(Constant.QB_USERID, id.toString());
                AsyncStorage.setItem(Constant.USER_FULL_NAME, responseData.user.login);
                AsyncStorage.setItem(Constant.USER_EMAIL, responseData.user.email);
                if(responseData.user.blob_id){
                    AsyncStorage.setItem(Constant.USER_BLOBID, responseData.user.blob_id.toString());
                }
                
                const { navigate } = this.props.navigation
                navigate ('Drawer')
            }
            else{
                alert(responseData.errors)
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
                                returnKeyType = 'next'
                                placeholder = {this.state.isname == true ? 'Login': 'Name is required'}
                                placeholderTextColor = { this.state.isname == true ? 'black': 'red' }
                                autoCorrect = {true}
                                underlineColorAndroid = 'transparent'
                                value = {this.state.name}
                                onChangeText = {(text) => this.setUserName(text)}
                                onSubmitEditing={this.changeFocus.bind(this)}
                            />
                        </View>
                        <View style = {styles.passwordView}>
                            <TextInput
                                ref={this.getNextInput.bind(this)}
                                style = {styles.passwordInput}
                                returnKeyType = 'done'
                                placeholder = {this.state.ispassword == true ? 'Password': 'Passowrd is required'}
                                placeholderTextColor = { this.state.ispassword == true ? 'black': 'red' }
                                autoCorrect = {true}
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

