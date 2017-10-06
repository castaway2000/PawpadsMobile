//import libraries
import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, StatusBar, Platform, ScrollView, TouchableHighlight, AsyncStorage } from 'react-native';
import Constant from '../common/Constant'
import CheckBox from 'react-native-icon-checkbox';
import PopupDialog, { SlideAnimation, DialogTitle } from 'react-native-popup-dialog';
import {Button} from 'native-base';
import {colors} from '../actions/const';

// create a component
class Settings extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isChecked: false,
            isRadioSelected: true,
            isKilometerSelected: false,
            isMilesSelected: true,
            isHighSelected: false,
            isMediumSelected: true,
            isLowSelected: false,
            isTogglepushSelected: false,
            isToggleMessagingSelected: true,
            searchRange: '60',
        };
    }
    componentWillMount() {
        AsyncStorage.getItem(Constant.SETTINGS_DISTANCE_UNIT).then((value) => {
            if(value == 'km'){
                this.setState({ 
                    isKilometerSelected: true,
                    isMilesSelected: false
                })
            }else{
                this.setState({ 
                    isKilometerSelected: false,
                    isMilesSelected: true
                })
            }
        })
        AsyncStorage.getItem(Constant.SETTINGS_RANGE).then((value) => {
            if(value){
                this.setState({ searchRange: value })
            }
        })
        AsyncStorage.getItem(Constant.SETTINGS_GPS_ACCURACY).then((value) => {
            if(value == 'High'){
                this.setState({ 
                    isHighSelected: true,
                    isMediumSelected: false,
                    isLowSelected: false,
                })
            }else if(value == 'Medium'){
                this.setState({ 
                    isHighSelected: false,
                    isMediumSelected: true,
                    isLowSelected: false,
                })
            }else{
                this.setState({ 
                    isHighSelected: false,
                    isMediumSelected: false,
                    isLowSelected: true,
                })
            }
        })
    }
    handleSelectedKilometers = (checked) => {
        this.setState({
            isKilometerSelected: true,
            isMilesSelected: false
        });
    }
    handleSelectedMiles = (checked) => {
        this.setState({
            isKilometerSelected: false,
            isMilesSelected: true
        });
    }
    handleSelectedHigh = (checked) => {
        this.setState({
            isHighSelected: true,
            isMediumSelected: false,
            isLowSelected: false
        })
    }
    handleSelectedMedium = (checked) => {
        this.setState({
            isHighSelected: false,
            isMediumSelected: true,
            isLowSelected: false
        })
    }
    handleSelectedLow = (checked) => {
        this.setState({
            isHighSelected: false,
            isMediumSelected: false,
            isLowSelected: true
        })
    }
    handleSelectedPush = (checked) => {
        this.setState({
            isTogglepushSelected: checked,
        })
    }
    handleSelectedMessaging = (checked) => {
        this.setState({
            isToggleMessagingSelected: checked
        })
    }

    _onback = () => {
        if(this.state.isKilometerSelected){
            AsyncStorage.setItem(Constant.SETTINGS_DISTANCE_UNIT, 'km');
        }
        if(this.state.isMilesSelected){
            AsyncStorage.setItem(Constant.SETTINGS_DISTANCE_UNIT, 'miles');
        }
        AsyncStorage.setItem(Constant.SETTINGS_RANGE, this.state.searchRange);
        if(this.state.isHighSelected){
            AsyncStorage.setItem(Constant.SETTINGS_GPS_ACCURACY, 'High');
        }
        if(this.state.isMediumSelected){
            AsyncStorage.setItem(Constant.SETTINGS_GPS_ACCURACY, 'Medium');
        }
        if(this.state.isLowSelected){
            AsyncStorage.setItem(Constant.SETTINGS_GPS_ACCURACY, 'Low');
        }
        if(this.state.isTogglepushSelected){
            AsyncStorage.setItem(Constant.SETTINGS_TOGGLE_PUSH_NOTIFICATIONS, 'push_notification');
        }
        if(this.state.isToggleMessagingSelected){
            AsyncStorage.setItem(Constant.SETTINGS_TOGGLE_MESSAGING_POPUPS, 'messaging_popups')
        }

        this.props.navigation.goBack()
    }
    render() {
        console.log('search distance ->  ' + this.state.searchRange)
        return (
            <View style={styles.container}>
                <View style = {styles.tabView}>
                    <TouchableOpacity style = {styles.backButton} onPress = {this._onback}>
                        <Image source = {require('../assets/img/back.png')} style = {{width: 18, height: 18}}/>
                    </TouchableOpacity>
                    <Text style = {styles.title}>Settings</Text>
                </View>
                <View style = {styles.bodyView}>
                    <ScrollView style = {styles.mscrollView}>
                        <View style = {{padding: 20}}>
                            <Text style = {styles.settingTxt}>Distance Units</Text>
                            <CheckBox
                                label="Kilometrs"
                                size={25}
                                checked={this.state.isKilometerSelected}
                                onPress={this.handleSelectedKilometers}
                                uncheckedIconName="radio-button-unchecked"
                                checkedIconName="radio-button-checked"
                                iconStyle = {{color: Constant.APP_COLOR}}
                            />
                            <CheckBox
                                label="Miles"
                                size={25}
                                checked={this.state.isMilesSelected}
                                onPress={this.handleSelectedMiles}
                                uncheckedIconName="radio-button-unchecked"
                                checkedIconName="radio-button-checked"
                                iconStyle = {{color: Constant.APP_COLOR}}
                            />
                            <Text style = {[styles.settingTxt, {marginTop: 10}]}>Range</Text>
                            <View style = {styles.cellView}>
                                <View style = {styles.lineTop}/>
                                <TextInput
                                    style = {styles.inputText}
                                    onChangeText = {(text) => this.setState({searchRange:text})}
                                    value = {this.state.searchRange}
                                    placeholderTextColor = {Constant.APP_COLOR}
                                    keyboardType = 'numeric'
                                    underlineColorAndroid = 'transparent'
                                />
                                <Image source = {require('../assets/img/pencil_icon.png')} style = {styles.icon}/>
                                <View style = {styles.lineBottom}/>
                            </View>
                            <Text style = {[styles.settingTxt, {marginTop: 10}]}>GPS Accurancy</Text>
                            <CheckBox
                                label="High"
                                size={25}
                                checked={this.state.isHighSelected}
                                onPress={this.handleSelectedHigh}
                                uncheckedIconName="radio-button-unchecked"
                                checkedIconName="radio-button-checked"
                                iconStyle = {{color: Constant.APP_COLOR}}
                            />
                            <CheckBox
                                label="Medium"
                                size={25}
                                checked={this.state.isMediumSelected}
                                onPress={this.handleSelectedMedium}
                                uncheckedIconName="radio-button-unchecked"
                                checkedIconName="radio-button-checked"
                                iconStyle = {{color: Constant.APP_COLOR}}
                            />
                            <CheckBox
                                label="Low"
                                size={25}
                                checked={this.state.isLowSelected}
                                onPress={this.handleSelectedLow}
                                uncheckedIconName="radio-button-unchecked"
                                checkedIconName="radio-button-checked"
                                iconStyle = {{color: Constant.APP_COLOR}}
                            />
                            <Text style = {[styles.settingTxt, {marginTop: 10}]}>Notification Settings</Text>
                            <CheckBox
                                label="Toggle push notifications"
                                checked={this.state.isTogglepushSelected}
                                onPress={this.handleSelectedPush}
                                iconStyle = {{color: Constant.APP_COLOR}}
                            />
                            <CheckBox
                                label="Toggle Messaging Popups"
                                checked={this.state.isToggleMessagingSelected}
                                onPress={this.handleSelectedMessaging}
                                iconStyle = {{color: Constant.APP_COLOR}}
                            />

                            <View style = {{alignItems:'center', marginTop: 20}}>
                                <Text style = {[styles.settingTxt, {marginTop: 10}]}>Account Settings</Text>
                                <Text style = {{marginTop: 10}}>Permanently delete account</Text>
                                <TouchableOpacity style = {styles.settingsBtn} onPress={() => { this.popupDialog.show(); }}>
                                    <Text style = {{color: 'white'}}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                            
                        </View>
                    </ScrollView>
                </View>
                <PopupDialog
                    ref={(popupDialog) => { this.popupDialog = popupDialog; }}
                    dialogAnimation = { new SlideAnimation({ slideFrom: 'bottom' })}
                    dialogStyle = {styles.dialogView}
                    overlayBackgroundColor = {Constant.APP_COLOR}
                    overlayOpacity = {0.9}
                >
                    <View style = {{alignItems:'center', backgroundColor:'white', padding: 10}}>
                        <Text style = {{textAlign:'center', fontWeight:'bold', marginTop: 10}}>Are you sure you want to delete your account?</Text>
                        <Text style = {{textAlign:'center', color:'#545454', fontSize: 13, marginTop: 10}}>if you delete your account you will permanently loose your profile, photos and messages.</Text>
                        <View style = {{width:Constant.WIDTH_SCREEN*0.7, height:1, backgroundColor:'#e4e4e4', marginTop: 15}}/>
                        <TouchableOpacity style = {{marginTop: 12}}>
                            <Text style = {{textAlign:'center', color:'#fb5e33'}}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                    <View style = {{backgroundColor:'transparent', marginTop: 5}}/>
                    <TouchableHighlight style = {styles.cancelBtn} onPress = {() => this.popupDialog.dismiss()}>
                        <Text style = {{textAlign:'center', color:'white', fontWeight:'bold'}}>Cancel</Text>
                    </TouchableHighlight>
                </PopupDialog>
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
    bodyView: {
        flex: 1,
        width: Constant.WIDTH_SCREEN,
        backgroundColor: 'white',
        // paddingBottom: 20
    },
    mscrollView: {
        flex: 1,
    },
    settingTxt: {
        color: 'black',
        fontSize: 18,
        fontWeight: 'bold',
        paddingTop: 5,
        paddingBottom: 5,
    },
    cellView: {
        flexDirection: 'row',
        height: 50,
        width: Constant.WIDTH_SCREEN,
        paddingLeft: 20,
        paddingRight: 20,
        justifyContent:'space-between',
        alignItems: 'center',
        marginTop: 10,
        marginLeft: -20
    },
    lineTop: {
        width: Constant.WIDTH_SCREEN,
        height: 1,
        backgroundColor: '#f4f4f4',
        position: 'absolute',
        top: 0,
        left: 0,
    },
    lineBottom: {
        width: Constant.WIDTH_SCREEN,
        height: 1,
        backgroundColor: '#f4f4f4',
        position: 'absolute',
        bottom: 0,
        left: 0,
    },
    icon: {
        width: 16,
        height: 16,
        resizeMode: 'contain',
        marginLeft: 20
    },
    settingsBtn: {
        width: 200,
        height: 40,
        backgroundColor: Constant.APP_COLOR,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10
    },
    dialogView: {
        width: Constant.WIDTH_SCREEN*0.7,
        backgroundColor: 'transparent',
        justifyContent:'center',
        alignItems:'center',
        
    },
    cancelBtn: {
        backgroundColor: '#fb5e33', 
        width: Constant.WIDTH_SCREEN*0.75, 
        height: 40, 
        alignItems:'center', 
        justifyContent:'center'
    },
    inputText: {
        backgroundColor: 'transparent',
        flex: 1,
        color: Constant.APP_COLOR,
    }
});

//make this component available to the app
export default Settings;
