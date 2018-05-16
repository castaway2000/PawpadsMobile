//import liraries
import React, { Component } from 'react';
import { StyleSheet, StatusBar, Image, TouchableOpacity, Platform,  RefreshControl, AsyncStorage,ActivityIndicator, ScrollView, Navigator} from 'react-native';
import {
    Content,
	Text,
	List,
	ListItem,
	Icon,
	Container,
	Left,
	Right,
	Badge,
	Button,
	View,
	StyleProvider,
	getTheme,
	variables,
} from 'native-base'
import Constant from '../common/Constant'
import { connect } from 'react-redux'

import {
    DrawerNavigator,
    StackNavigator } from 'react-navigation'
var { Router, Scene } = require('react-native-router-flux');

import SideBar from '../components/sidebar/SideBar'

import RNFirebase from 'react-native-firebase';
const firebase = RNFirebase.initializeApp({ debug: false, persistence: true })
firebase.database().goOnline()

// import FCM, {FCMEvent, RemoteNotificationResult, WillPresentNotificationResult, NotificationType, NotificationActionType, NotificationActionOption, NotificationCategoryOption} from "react-native-fcm";
// import {registerKilledListener, registerAppListener} from '../common/Listeners'

//Type of dialog. Possible values: 1(PUBLIC_GROUP), 2(GROUP), 3(PRIVATE)

// Geofire
import { initializeApp } from 'firebase'
const geofire = require('geofire');

import {CachedImage} from "react-native-img-cache";

const firebaseApp = initializeApp({
  apiKey: Constant.FIREBASE_API_KEY,
  authDomain: Constant.FIREBASE_AUTH_DOMAIN,
  databaseURL: Constant.FIREBASE_DATABASE_URL,
  storageBucket: Constant.FIREBASE_STORAGE_BUCKET
},"App2")

var datas = []
var distance_unit = ''
var range = ''
var gps_accuracy = ''
var datamigrationobj = null

// registerKilledListener();

// create a component
class TabNearBy extends Component {

    constructor(props) {
        super(props)
        this.state = {
            loading: true,
            token : '',
            refreshing: false,
            error: null,
            latitude: null,
            longitude: null,
            distance_unit: 'km',
            search_range: '60',
            gps_accuracy: 'medium',
            nearByUsers: [],
            tableId: '',
            isLocationServiceEnabled: true
        }
    }

    componentWillMount() {

      datamigrationobj = this

        AsyncStorage.getItem(Constant.SETTINGS_DISTANCE_UNIT).then((value) => {
            if(value){
                this.setState({ distance_unit: value })
            }
        })

        AsyncStorage.getItem(Constant.SETTINGS_RANGE).then((value) => {
            if(value){
               this.setState({ search_range: value })
            }
        })

        AsyncStorage.getItem(Constant.SETTINGS_GPS_ACCURACY).then((value) => {
            if(value){
                this.setState({ gps_accuracy: value })
            }
        })

        AsyncStorage.getItem(Constant.USER_TABEL_ID).then((value) => {

          this.setState({tableId: value})
          
          this.loadDataFirebase()

          AsyncStorage.getItem(Constant.FCM_TOKEN).then((value) => {
              if(value){
                this.updateFCMTokenFirebase(value)
              }
          })
        })
        
        /*
        FCM.getInitialNotification().then(notif => {

            console.log("FCM.getInitialNotification", notif);

            if(notif){
              setTimeout(()=>{

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
              }, 500)
            }
          });

          FCM.on(FCMEvent.Notification, notif => {

            console.log("FCMEvent.Notification", notif);
        
            if(Platform.OS ==='ios' && notif._notificationType === NotificationType.WillPresent && !notif.local_notification){
              // this notification is only to decide if you want to show the notification when user if in foreground.
              // usually you can ignore it. just decide to show or not.
              notif.finish(WillPresentNotificationResult.All)
              return;
            }
        
            if(notif.opened_from_tray){

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
          */
        
        //this.loadData()

        //this._getUsers()
    }

    updateFCMTokenFirebase = (value) => {

      //Update full name
      var updatefullname = {};
      updatefullname['/users/' + this.state.tableId  + '/FCMToken'] = value;
      updatefullname['/users/' + this.state.tableId  + '/Platform'] = Platform.OS;

      firebase.database().ref().update(updatefullname)
    }

    /*
    loadData() {
        navigator.geolocation.getCurrentPosition (
            (position) => {

                this.setState({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    error: null,
                })

                console.log("position.coords.latitude",position.coords.latitude)
                console.log("position.coords.longitude",position.coords.longitude)

                AsyncStorage.getItem(Constant.QB_TOKEN).then((value) => {
                    if(this.state.distance_unit == 'km'){
                        var REQUEST_URL = Constant.NEARBY_FIND_USER_URL + '?radius=' + this.state.search_range + '&current_position=' + this.state.latitude + '%3B' + this.state.longitude + '&sort_by=distance' + '&per_page=100'
                    } else {
                        var REQUEST_URL = Constant.NEARBY_FIND_USER_URL + '?radius=' + parseInt(this.state.search_range)*1.60934 + '&current_position=' + this.state.latitude + '%3B' + this.state.longitude + '&sort_by=distance' + '&per_page=100'
                    }
                    fetch(REQUEST_URL, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'QB-Token': value
                        },
                    })
                    .then((response) => response.json())
                    .then((responseData) => {
                        console.log(responseData)
                        this.setState({
                            nearByUsers: responseData.items,
                            token: value,
                            loading: false
                        })

                        this.props.NearByUsers(responseData.items)

                    }).catch((e) => {

                        alert("Location services is turned off!")
                    })
                })
            },
            (error) => {
                alert("Location services is turned off!")
            },
            {
              enableHighAccuracy: true, timeout: 1000, maximumAge: 1000
            }
        );
    }*/

     isNumeric(n) {
       return !isNaN(parseFloat(n)) && isFinite(n);
     }

    loadDataFirebase() {

        console.log("getting position...")

        navigator.geolocation.getCurrentPosition(
            (position) => {

                console.log("position.coords.latitude",position.coords.latitude)
                console.log("position.coords.longitude",position.coords.longitude)

              if (position.coords.latitude && position.coords.longitude) {
                if (this.isNumeric(position.coords.latitude) && this.isNumeric(position.coords.longitude)) {

                  AsyncStorage.setItem(Constant.USER_LATITUDE, position.coords.latitude.toString())
                  AsyncStorage.setItem(Constant.USER_LONGITUDE, position.coords.longitude.toString())

                  this.setState({
                      latitude: position.coords.latitude,
                      longitude: position.coords.longitude,
                      error: null,
                  })
                  this._saveUserLocation()
                  this._queryuser()
                }
              }
            },
            (error) => {
                this.setState({loading: false,isLocationServiceEnabled: false})
                alert("Location services is turned off! Please turn on from setting.")
            },
            {
              enableHighAccuracy: false, timeout: 500000, maximumAge: 1000000
            }
        );
    }

    _queryuser = () => {

      if (this.state.latitude && this.state.longitude) {
        const geofireRef = new geofire(firebaseApp.database().ref('geofire/'))

        var radious = 0
        if (this.state.distance_unit == 'km') {
          radious = parseInt(this.state.search_range)
        } else {
          radious = parseInt(this.state.search_range)*1.60934
        }

        var geoQuery = geofireRef.query({
          center: [this.state.latitude, this.state.longitude],
          radius: radious
        });

        var onKeyEnteredRegistration = geoQuery.on("key_entered", function(key, location) {
           console.log(key + " entered the query. Hi " + key + "!");

           //Get all data
           firebase.database()
           .ref('users/' + key)
           .once("value")
           .then(snapshot => {
             if (snapshot.val()) {

               console.log("snapshot is:",snapshot.val());

               var profile = snapshot.val();

               if (profile["firid"] != datamigrationobj.state.tableId) {

                 let index =  datamigrationobj.state.nearByUsers.indexOf(profile)

                 if (profile["content"]) {

                   for (let item in profile["content"]) {

                     let content = profile["content"][item]
                     let blobid =  content["id"]

                     //datamigrationobj.setState({nearByUsers: datamigrationobj.state.nearByUsers});

                     if (blobid == profile["blob_id"]) {

                       firebase.storage().ref("content/" + profile["firid"] + "/" + profile["content"][item]["name"]).getDownloadURL().then((url) => {

                         profile["profileurl"] =  url; //profileurl

                         console.log("image loaded:",url);

                         datamigrationobj.state.nearByUsers.push(profile)
                         datamigrationobj.setState({nearByUsers: datamigrationobj.state.nearByUsers});
                         datamigrationobj.props.NearByUsers(datamigrationobj.state.nearByUsers)

                       })
                     }

                     if(profile.custom_data) {
                       var json = JSON.parse(profile.custom_data)

                       if (blobid == json["backgroundId"]) {
                         let path = "content/" + profile["firid"] + "/" + profile["content"][item]["name"]
                         console.log('path:', path);

                         firebase.storage().ref(path).getDownloadURL().then((url) => {
                           console.log("url IS a a:",url);

                            profile["coverPictureURL"] =  url; //profileurl
                         })
                       }
                     }
                   }
                 } else {
                   datamigrationobj.state.nearByUsers.push(profile)
                   datamigrationobj.setState({nearByUsers: datamigrationobj.state.nearByUsers});
                 }
               }
             }
           })
         });

         var onKeyExitedRegistration = geoQuery.on("key_exited", function(key, location) {
           console.log(key + " migrated out of the query. Bye bye :(");
         });

         var onKeyMovedRegistration = geoQuery.on("key_moved", function(key, location) {
           console.log(key + " moved to somewere else within the query.");
         });

         var onKeyMovedRegistration = geoQuery.on("ready", function(key, location) {
           console.log("ready!!");
           console.log("datamigrationobj.state.nearByUsers",datamigrationobj.state.nearByUsers);
           datamigrationobj.setState({nearByUsers: datamigrationobj.state.nearByUsers,loading: false});
         });
      }
    }

    _saveUserLocation = () => {

      if (this.state.latitude && this.state.latitude && this.state.longitude) {
        firebase.database().ref('users/' + this.state.tableId).update({
          "latitude":parseFloat(this.state.latitude),
          "longitude":parseFloat(this.state.longitude),
        });

        //Save to geofire
        const geofireRef = new geofire(firebaseApp.database().ref('geofire/'))

        console.log("this.state.tableId",this.state.tableId);
        console.log("this.state.latitude",this.state.latitude);
        console.log("this.state.longitude",this.state.longitude);

        geofireRef.set(this.state.tableId, [this.state.latitude, this.state.longitude]).then(function() {
          console.log("Provided key has been added to GeoFire");
        }, function(error) {
          console.log("Error: " + error);
        });
      }
    }

    _onRefresh() {
        this.setState({refreshing: true});
        setTimeout(() => {
            this.setState({
                refreshing: false
            })
        }, 2000)
    }

    renderNearBy() {
        if(this.state.loading) {
            return (
				<View style={styles.loadingView}>
					<ActivityIndicator color={'black'} size={'large'}/>
				</View>
			);
        } else {
            if(this.state.nearByUsers.length > 0){
                return(
                    <List
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={this._onRefresh.bind(this)}/>
                        }
                        style = {styles.mList}
                        dataArray={this.state.nearByUsers}
                        renderRow={data =>
                            <ListItem button noBorder onPress={() => this.props.navigation.navigate('Profile', {UserInfo: data})} style = {{height:70}}>
                            <View style = {styles.menuIcon} >
                               <CachedImage source={{uri: data["profileurl"]}}
                                defaultSource = {require('../assets/img/user_placeholder.png')}
                                style = {styles.menuIcon1}/>
                            </View>
                                {data.full_name?
                                    <Text style = {styles.menuItem}>{data.full_name}</Text> :
                                    <Text style = {styles.menuItem}>{data.login}</Text> }
                                {this.state.distance_unit == 'km' ?
                                    <Text style = {styles.distance}>{this.calculateDistance(data)} {this.state.distance_unit}</Text> :
                                    <Text style = {styles.distance} numberOfLines = {1}>{(this.calculateDistance(data)/1.60934).toFixed(2)} {this.state.distance_unit}</Text>}
                            </ListItem>
                        }
                    >
                    </List>
                )
            }else{
                return(
                    <View style={styles.loadingView}>
                        <Text style = {styles.placesText}>{this.state.isLocationServiceEnabled ? "There seems to be no one around. Try visiting this screen later or change your Distnace Settings." : "Location services is turned off! Please turn on from setting." }</Text>
                    </View>
                )
            }
        }
    }

    calculateDistance(data) {
      let distance = parseInt(geofire.distance([this.state.latitude, this.state.longitude], [data.latitude,data.longitude]))
      data.distance = distance
      return distance
    }

    render() {
        return (
            this.renderNearBy() 
        );
    }
}

// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2c3e50',
    },
    mList: {
        height: Constant.HEIGHT_SCREEN - 140,
        paddingBottom: 30,
        backgroundColor:'white'
    },
    menuItem:{
        color: 'black',
        opacity: 1,
        fontSize: 18,
        marginLeft: 15,
        flex: 1,
    },
    menuIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#f1eff0',
    },
    menuIcon1: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'transparent',
        overlayColor: 'white',
    },
    distance: {
        color: 'gray',
        fontSize: 13,
    },
    loadingView: {
        flex: 1,
        justifyContent:'center',

    },
    placesText: {
        color: 'gray',
        textAlign: 'center'
    }
});


const mapStateToProps = state => ({

});

const mapDispatchToProps = dispatch => ({
    NearByUsers: users => dispatch({type: 'Nearby_Result', value: users})
})

export default connect(mapStateToProps, mapDispatchToProps)(TabNearBy)
