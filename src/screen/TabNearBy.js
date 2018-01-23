//import liraries
import React, { Component } from 'react';
import { StyleSheet, StatusBar, Image, TouchableOpacity, RefreshControl, AsyncStorage,ActivityIndicator, ScrollView, Navigator} from 'react-native';
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

import RNFirebase from 'react-native-firebase';
const firebase = RNFirebase.initializeApp({ debug: false, persistence: true })
firebase.database().goOnline()

// Geofire
import { initializeApp } from 'firebase'
const geofire = require('geofire');

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

// create a component
class TabNearBy extends Component {
    constructor(props){
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
            tableId: ''
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
          console.log("tableId is:",value);
          this.setState({tableId: value })
        })

        //this.loadData()
        this.loadDataFirebase()
        //this._getUsers()
    }

    loadData() {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                this.setState({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    error: null,
                })

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
                        console.log(e)
                    })
                })
            },
            (error) => this.setState({error: error.message}),
            {
              enableHighAccuracy: true, timeout: 20000, maximumAge: 1000
            }
        );
    }

    loadDataFirebase() {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                this.setState({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    error: null,
                })
                this._saveUserLocation()
                this._queryuser()
            },
            (error) => this.setState({error: error.message}),
            {
              enableHighAccuracy: true, timeout: 20000, maximumAge: 1000
            }
        );
    }

    _queryuser = () => {
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

               if (profile["content"]) {

                 for (let item in profile["content"]) {

                   let content = profile["content"][item]
                   let blobid =  content["id"]

                   if (blobid == profile["blob_id"]) {
                     datamigrationobj.setState({nearByUsers: datamigrationobj.state.nearByUsers});
                     firebase.storage().ref("content/" + profile["firid"] + "/" + profile["content"][item]["name"]).getDownloadURL().then((url) => {
                       profile["profileImageURL"] =  url;
                       console.log("image loaded:",url);
                       datamigrationobj.state.nearByUsers.push(profile)
                       datamigrationobj.setState({nearByUsers: datamigrationobj.state.nearByUsers});
                     })
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

    _saveUserLocation = () => {
      firebase.database().ref('users/' + this.state.tableId).update({
        "latitude":parseFloat(this.state.latitude),
        "longitude":parseFloat(this.state.longitude),
      });

      //Save to geofire
      const geofireRef = new geofire(firebaseApp.database().ref('geofire/'))
      geofireRef.set(this.state.tableId, [this.state.latitude, this.state.longitude]).then(function() {
        console.log("Provided key has been added to GeoFire");
      }, function(error) {
        console.log("Error: " + error);
      });
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
        }
        else{
            if(this.state.nearByUsers){
                return(
                    <List
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={this._onRefresh.bind(this)}
                            />
                        }
                        style = {styles.mList}
                        dataArray={this.state.nearByUsers}
                        renderRow={data =>
                            <ListItem button noBorder onPress={() => this.props.navigation.navigate('Profile', {UserInfo: data})} style = {{height:70}}>
                                <Image  source={{uri: data["profileImageURL"]}}

                                        defaultSource = {require('../assets/img/user_placeholder.png')}
                                        style = {styles.menuIcon}
                                />
                                {data.full_name?
                                    <Text style = {styles.menuItem}>{data.full_name}</Text> :
                                    <Text style = {styles.menuItem}>{data.login}</Text> }
                                {this.state.distance_unit == 'km' ?
                                    <Text style = {styles.distance}>{parseInt(geofire.distance([this.state.latitude, this.state.longitude], [data.latitude,data.longitude]))} {this.state.distance_unit}</Text> :
                                    <Text style = {styles.distance} numberOfLines = {1}>{parseInt((geofire.distance([this.state.latitude, this.state.longitude], [data.latitude,data.longitude]))/1.60934)} {this.state.distance_unit}</Text>}
                            </ListItem>
                        }
                    >
                    </List>
                )
            }else{
                return(
                    <View style={styles.loadingView}>
                        <Text style = {styles.placesText}>There seems to be no one around. Try visiting this screen later or change your Distnace Settings.</Text>
                    </View>
                )
            }

        }
    }

    render() {
        return (
            <Container>
                <Content bounces={false} style={{ flex: 1, backgroundColor: 'white'}}>

                    { this.renderNearBy() }

                </Content>
            </Container>
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
    },
    distance: {
        color: 'gray',
        fontSize: 13,
    },
    loadingView: {
        flex: 1,
        justifyContent:'center',
        top: 200
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
