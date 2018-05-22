//import libraries
import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, StatusBar, Platform, ScrollView, AsyncStorage } from 'react-native';
import { Container, Header, Title, Button, Icon, Tabs, Tab, Right, Left, Body, TabHeading} from 'native-base'
import Constant from '../common/Constant'
import TabChannels from './TabChannels'
import TabChats from './TabChats'
import TabNearBy from './TabNearBy'

import FCM, {FCMEvent, RemoteNotificationResult, WillPresentNotificationResult, NotificationType, NotificationActionType, NotificationActionOption, NotificationCategoryOption} from "react-native-fcm";
import {registerKilledListener, registerAppListener} from '../common/Listeners'

import RNFirebase from 'react-native-firebase';
const firebase = RNFirebase.initializeApp({ debug: false, persistence: true })

//Type of dialog. Possible values: 1(PUBLIC_GROUP), 2(GROUP), 3(PRIVATE)

registerKilledListener();

// create a component
class Dashboard extends Component {
    static navigationOptions = {
        title:'',
        header: null
    };

    constructor(props) {
        super(props)
        this.state = {
            isNearby: true,
            isChats: false,
            isChannels: false,
            tableId: '',
        }
    }

    componentDidMount() {

        AsyncStorage.getItem(Constant.USER_TABEL_ID).then((value) => {
            this.setState({ tableId: value })
            this.setOnlineOfflineStatus()
        })

        FCM.getInitialNotification().then(notif => {

            console.log("FCM.getInitialNotification", notif);

            if(notif) {

              setTimeout(() => {

                if (notif) {

                    if (notif.data) {

                        let dialog = JSON.parse(notif.data)
                        
                        if  (notif.type === '1') {

                            this.props.navigation.navigate('Chat', {GroupName: dialog.name, IsPriveteGroup: true, Dialog: dialog})
                        
                        } else if  (notif.type === '2')  {
                            
                            this.props.navigation.navigate('ChatGroup', {GroupName: dialog.name, IsPriveteGroup: true, Dialog: dialog, IsPublicGroup: false})
                        
                        }
                    }
                }
              }, 500)
            }
          });

          FCM.on(FCMEvent.Notification, notif => {

            console.log("FCMEvent.Notification", notif);
        
            if(Platform.OS ==='ios' && notif._notificationType === NotificationType.WillPresent && !notif.local_notification){
              // this notification is only to decide if you want to show the notification when user if in foreground.
              // usually you can ignore it. just decide to show or not.
             // notif.finish(WillPresentNotificationResult.All)
              return;
            }
        
            if(notif.opened_from_tray) {

                if (notif) {

                    if (notif.data) {

                        let dialog = JSON.parse(notif.data)
                        
                        if  (notif.type === '1') {
                            this.props.navigation.navigate('Chat', {GroupName: dialog.name, IsPriveteGroup: true, Dialog: dialog})
                        } else if  (notif.type === '2') {
                            this.props.navigation.navigate('ChatGroup', {GroupName: dialog.name, IsPriveteGroup: true, Dialog: dialog, IsPublicGroup: false})
                        }
                    }
                }
            }
        
            if(Platform.OS ==='ios'){
                    //optional
                    //iOS requires developers to call completionHandler to end notification process. If you do not call it your background remote notifications could be throttled, to read more about it see the above documentation link.
                    //This library handles it for you automatically with default behavior (for remote notification, finish with NoData; for WillPresent, finish depend on "show_in_foreground"). However if you want to return different result, follow the following code to override
                    //notif._notificationType is available for iOS platfrom
                    switch(notif._notificationType){
                      case NotificationType.Remote:
                        notif.finish(RemoteNotificationResult.NewData) //other types available: RemoteNotificationResult.NewData, RemoteNotificationResult.ResultFailed
                        break;
                      case NotificationType.NotificationResponse:
                        notif.finish();
                        break;
                      case NotificationType.WillPresent:
                        notif.finish(WillPresentNotificationResult.All) //other types available: WillPresentNotificationResult.None
                        // this type of notificaiton will be called only when you are in foreground.
                        // if it is a remote notification, don't do any app logic here. Another notification callback will be triggered with type NotificationType.Remote
                        break;
                    }
            }
          });
    }

    setOnlineOfflineStatus = () => {

        //Online offline status
        firebase.database().ref('users/' + this.state.tableId).update({"isonline": 1});
        firebase.database().ref('users/' + this.state.tableId).onDisconnect().update({"isonline": 0});
    }

    _onMenu = () => {
        this.props.navigation.navigate('DrawerOpen')
    }

    _onSearch = () => {
        if(this.state.isNearby){
            this.props.navigation.navigate('Search', {TabName: 'NEARBY'})
        }
        if(this.state.isChats){
            this.props.navigation.navigate('Search', {TabName: 'CHATS'})
        }
        if(this.state.isChannels){
            this.props.navigation.navigate('Search', {TabName: 'CHANNELS'})
        }
    }

    _onNearby = () => {
        this.setState({
            isNearby: true,
            isChats: false,
            isChannels: false,
        })
    }
    _onChats = () => {
        this.setState({
            isNearby: false,
            isChats: true,
            isChannels: false,
        })
    }
    _onChannels = () => {
        this.setState({
            isNearby: false,
            isChats: false,
            isChannels: true,
        })
    }

    showTabView(){
        if(this.state.isNearby){
            return(
                <View style = {{width: Constant.WIDTH_SCREEN, flex: 1, backgroundColor: 'white'}}>
                    <TabNearBy navigation = {this.props.navigation}/>
                </View>
            )
        }
        if(this.state.isChats){
            return(
                <View style = {{width: Constant.WIDTH_SCREEN, flex: 1, backgroundColor: 'white'}}>
                    <TabChats navigation = {this.props.navigation}/>
                </View>
            )
        }
        if(this.state.isChannels){
            return(
                <View style = {{width: Constant.WIDTH_SCREEN, flex: 1, backgroundColor: 'white'}}>
                    <TabChannels navigation = {this.props.navigation}/>
                </View>
            )
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <View style = {styles.menuView}>
                    <TouchableOpacity style = {styles.menuButton} onPress = {this._onMenu}>
                        <Image source = {require('../assets/img/menu.png')} style = {{width: 18, height: 18}}/>
                    </TouchableOpacity>
                    <Text style = {styles.title}>PawPads</Text>
                    <TouchableOpacity style = {styles.searchButton} onPress = {this._onSearch}>
                        <Image source = {require('../assets/img/search.png')} style = {{width: 18, height: 18}}/>
                    </TouchableOpacity>
                </View>
                {/*<Container style = {{backgroundColor:'white'}}>
                    <Tabs initialPage = {0} tabBarUnderlineStyle = {{backgroundColor: 'white'}} locked = {true}>
                        <Tab heading = { <TabHeading style = {{backgroundColor: Constant.APP_COLOR}}><Text style = {{color: 'white'}}>NEARBY</Text></TabHeading> }>
                            <TabNearBy navigation = {this.props.navigation}/>
                        </Tab>
                        <Tab heading = { <TabHeading style = {{backgroundColor: Constant.APP_COLOR}}><Text style = {{color: 'white'}}>CHATS</Text></TabHeading> }>
                            <TabChats navigation = {this.props.navigation}/>
                        </Tab>
                        <Tab heading = { <TabHeading style = {{backgroundColor: Constant.APP_COLOR}}><Text style = {{color: 'white'}}>CHANNELS</Text></TabHeading> }>
                            <TabChannels navigation = {this.props.navigation}/>
                        </Tab>
                    </Tabs>
                </Container>*/}

                <View style = {{width: Constant.WIDTH_SCREEN, height: 50, backgroundColor: Constant.APP_COLOR, flexDirection: 'row'}}>
                    <TouchableOpacity style = {styles.tabItem} onPress = {this._onNearby}>
                        <Text style = {{color: 'white', fontSize: 16}}>NEARBY</Text>
                        <View style = {this.state.isNearby? styles.tabline : null}/>
                    </TouchableOpacity>
                    <TouchableOpacity style = {styles.tabItem} onPress = {this._onChats}>
                        <Text style = {{color: 'white', fontSize: 16}}>CHATS</Text>
                        <View style = {this.state.isChats? styles.tabline : null}/>
                    </TouchableOpacity>
                    <TouchableOpacity style = {styles.tabItem} onPress = {this._onChannels}>
                        <Text style = {{color: 'white', fontSize: 16}}>CHANNELS</Text>
                        <View style = {this.state.isChannels? styles.tabline : null}/>
                    </TouchableOpacity>
                </View>
                {this.showTabView()}
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
    menuView: {
        width: Constant.WIDTH_SCREEN,
        height: 60,
        marginTop: (Platform.OS == 'ios')? 20 : StatusBar.currentHeight,
        flexDirection:'row',
        alignItems:'center',
        backgroundColor: Constant.APP_COLOR
    },
    menuButton: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems:'center',
    },
    title: {
        color: 'white',
        marginLeft: 5,
        fontSize: 20
    },
    searchButton: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        position:'absolute',
        right: 5
    },
    tabline: {
        width: Constant.WIDTH_SCREEN/3,
        height: 3.5,
        backgroundColor: 'white',
        position:'absolute',
        bottom: 0,
        left: 0,
    },
    tabItem: {
        height: 50,
        width: Constant.WIDTH_SCREEN/3,
        justifyContent:'center',
        alignItems:'center'
    }
});

//make this component available to the app
export default Dashboard;
