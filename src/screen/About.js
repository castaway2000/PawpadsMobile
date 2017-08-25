//import libraries
import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, StatusBar, Platform, ScrollView } from 'react-native';
import Constant from '../common/Constant'

// create a component
class About extends Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }
    render() {
        return (
            <View style={styles.container}>
                <View style = {styles.tabView}>
                    <TouchableOpacity style = {styles.backButton} onPress = {() => this.props.navigation.goBack()}>
                        <Image source = {require('../assets/img/back.png')} style = {{width: 18, height: 18}}/>
                    </TouchableOpacity>
                </View>
                <View style = {styles.bodyView}>
                    <View style = {{alignItems: 'center'}}>
                        <Text style = {styles.pawpads}>PawPads</Text>
                        <Text style = {styles.version}>Version 1.1.9</Text>
                    </View>
                    <View style = {{justifyContent: 'center', alignItems: 'center', paddingBottom: 20}}>
                        <Text style = {[styles.lead, {marginTop: 20}]}>Lead Project Manager:</Text>
                        <Text style = {styles.lead}>Blazecollie</Text>
                        <View style = {{flexDirection: 'row', marginTop: 20, alignItems:'center'}}>
                            <Image source = {require('../assets/img/fa_logo.png')} style = {{width: 50, height: 28, resizeMode:'contain'}}/>
                            <Image source = {require('../assets/img/twitter_square_logo.png')} style = {{width: 32, height: 32, resizeMode:'contain', marginLeft: 30}}/>
                        </View>
                        <Text style = {styles.icondesign}>Icon design: Riverbreak</Text>
                        <Image source = {require('../assets/img/fa_logo.png')} style = {{width: 50, height: 28, resizeMode:'contain', marginTop: 20}}/>
                        <TouchableOpacity style = {styles.sendBtn}>
                            <Image source = {require('../assets/img/transparent_button.png')} style = {styles.loginButtonImg}/>
                            <Text style = {{color: 'white',backgroundColor: 'transparent'}}>Send feedback</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style = {styles.privacy}>@2016 PawPads<Text style = {{fontWeight:'bold'}}>  Privacy Policy</Text></Text>

                </View>
                
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
    pawpads: {
        color: 'white',
        fontSize: 25,
    },
    bodyView: {
        flex: 1,
        flexDirection: 'column',
        width: Constant.WIDTH_SCREEN,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 50
    },
    version: {
        marginTop: 15,
        color: 'white',
    },
    sendBtn: {
        width: 200,
        height: 40,
        marginTop: 60,
        borderRadius: 3,
        alignItems: 'center',
        justifyContent: 'center'
    },
    loginButtonImg: {
        width: 200,
        height: 40,
        position:'absolute',
        top: 0,
        left: 0,
        borderRadius: 3,
    },
    lead: {
        color: 'white',
        fontSize: 14
    },
    icondesign: {
        color: 'white',
        fontSize: 14,
        marginTop: 50,
    },
    privacy: {
        color: 'white',
        fontSize: 13
    }
});

//make this component available to the app
export default About;
