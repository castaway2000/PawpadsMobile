//import libraries
import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, StatusBar, Platform, ScrollView, AsyncStorage } from 'react-native';
import Constant from '../common/Constant'
import hmacSHA1 from 'crypto-js/hmac-sha1'
import RNFirebase from 'react-native-firebase';

const firebase = RNFirebase.initializeApp({ debug: false, persistence: true })

// create a component
class DataMigration extends Component {
    constructor(props) {
        super(props);
        this.state = {
          qb_token: '',
          userid:'',
        };
    }
    componentWillMount() {
      AsyncStorage.getItem(Constant.QB_USERID).then((value) => {
        console.log("user id is:",value);
          this.setState({userid: value })
      })
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
                'Content-Type': 'multipart/form-data',
            },
            body:formdata
        })
        .then((response) => response.json())
        .then((responseData) => {
          console.log("token responce:",responseData);

            var token = responseData.session.token
            this.setState({
                qb_token: token
            })
            this._loginWithQuickblox()
        }).catch((e) => {
            console.log(e)
        })
    }

    _loginWithQuickblox = () => {

        console.log("Quickblox: Getting... Location data");

        var REQUEST_URL = Constant.GET_USER_LOCATION + "?user.id=" + this.state.userid

        fetch(REQUEST_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'QB-Token': this.state.qb_token
            }
        })
        .then((response) => response.json())
        .then((responseData) => {
          console.log("Quickblox: Responce:",responseData);
            if(responseData.items) {
              let items = responseData["items"]
              console.log("Quickblox: items:",items);

              var geodata = {}
              if (items.length > 0) {
                geodata =  items[0]["geo_datum"]

                console.log("Quickblox: latitude:",geodata["latitude"]);
                console.log("Quickblox: longitude:",geodata["longitude"]);

                var rootRef = firebase.database().ref(`/users`);
                let user = {};
                user[tableId + "/location"] = {
                                            "latitude":geodata["latitude"],
                                            "longitude":geodata["longitude"]
                                            }
                rootRef.update(user);

              } else {

              }
            } else {

            }
        }).catch((e) => {
            console.log(e)
        })
    }

    render() {
        return (
            <View style={styles.container}>
            <View style = {styles.tabView}>
                <Text style = {styles.title}>Data Migration</Text>
            </View>
            <View style={styles.container}>
            <Text style = {styles.detailLabel}>Migrating your data...</Text>
            </View>
            </View>
        );
    }

    _onback = () => {
        this.props.navigation.goBack()
    }
}

// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: Constant.APP_COLOR,
        justifyContent: 'center',
      },
      tabView: {
            width: Constant.WIDTH_SCREEN,
            height: 60,
            paddingLeft: 5,
            marginTop: (Platform.OS == 'ios')? 20 : StatusBar.currentHeight,
            flexDirection:'row',
            alignItems:'center',
            justifyContent: 'center',
        },
        title: {
            color: 'white',
            marginLeft: 10,
            fontSize: 20,
            justifyContent: 'center',
        },
        detailLabel: {
            color: 'white',
            fontSize: 20,
            justifyContent: 'center',
            alignItems:'center',
        },
});

//make this component available to the app
export default DataMigration;
