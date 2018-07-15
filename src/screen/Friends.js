//import libraries
import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, StatusBar, Platform, ScrollView, AsyncStorage } from 'react-native';
import Constant from '../common/Constant'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import {
    Content,
	List,
	ListItem,
	Icon,
	Container,
	Left,
	Right,
	Badge,
	Button,
	StyleProvider,
	getTheme,
	variables,
} from 'native-base'

import {CachedImage} from 'react-native-img-cache';

import { FlatList } from "react-native";

import RNFirebase from 'react-native-firebase';

const firebase = RNFirebase.initializeApp({ debug: false, persistence: true })

class MyListItem extends React.PureComponent {

  _onPress = () => {
    const data = this.props.item;
    this.props.onPressItem(this.props.index,data);
  };

  render() {
      
    const data = this.props.item;

      return (
          <TouchableOpacity onPress={this._onPress} style={styles.friendsListCell} key={this.props.index}>
              <View style={styles.menuIcon1} >
                  <CachedImage source={{
                      uri: data.profileurl
                  }}
                      defaultSource={require('../assets/img/user_placeholder.png')}
                      style={styles.menuIcon} />

					{data.isonline ? <View style = {styles.onlinestatus}/> : <View style = {styles.offlinestatus}/>} 

              </View>
              <View style={{ flex: 1, justifyContent: 'center' }}>
                  <Text style={styles.menuItem}>{data.full_name ? data.full_name : data.login}</Text></View>
          </TouchableOpacity>
      )
    }
}

// create a component
class Friends extends Component {

  constructor(props) {
      super(props)
      this.state = {
          friendList: [],
          refreshing: false,
          userid:'',
      }
  }

  componentWillMount() {
    AsyncStorage.getItem(Constant.QB_USERID).then((value) => {
        this.setState({ userid: value })
        this.checkAlreadyFriend()
    })
  }

    _onback = () => {
        this.props.navigation.goBack()
    }

    _renderItem = ({ item, index }) => ( <MyListItem
        id = { item.id }
        title = { item.title }
        index = { index }
        item = { item }
        onPressItem = { this._onPressItem }/>
    );

    _onPressItem = (index, item) => {
        console.log("Pressed row: ", index, item);
        this.props.navigation.navigate('Profile', {UserInfo: item})
    };

    _keyExtractor = (item, index) => index;

    handleLoadMore = () => {
      if (!this.state.refreshing) {
        
      }
    }

    checkAlreadyFriend = () => {
      var {params} = this.props.navigation.state

      this.setState({
        refreshing: false
    })
      this.setState({friendList: []})

      firebase.database()
          .ref(`/friendlist`)
          .orderByChild("user_id")
          .equalTo(this.state.userid)
          .once("value")
          .then(snapshot => {
            if (snapshot.val()) {
              let response = snapshot.val()
              var keys = Object.keys(response);
              for (var i = 0; i < keys.length; i++) {

                //console.log("checkAlreadyFriend",response[keys[i]]);

                let friendData = response[keys[i]]

                firebase.database()
                    .ref(`/users`)
                    .orderByChild("id")
                    .equalTo(friendData.friend_id.toString())
                    .once("value")
                    .then(snapshot => {

                      if (snapshot.val()) {
                        var profileObj = snapshot.val();

                        if (profileObj) {
                          let keys = Object.keys(profileObj);

                          var profile = null;
                          if (keys.length > 0) {
                            profile = profileObj[keys[0]]
                          }

                          if (profile) {

                            this.state.friendList.push(profile)

                            this.setState({friendList: this.state.friendList})

                            if (profile["content"]) {

                              for (let item in profile["content"]) {
                                let content = profile["content"][item]
                                let blobid =  content["id"]

                                if (blobid == profile["blob_id"]) {

                                  firebase.storage().ref("content/" + profile["firid"] + "/" + profile["content"][item]["name"]).getDownloadURL().then((url) => {

                                    console.log("profile is:",profile);

                                    for(var i = 0;i < this.state.friendList.length; i++){
                                        if(this.state.friendList[i].id == profile.id){
                                            this.state.friendList[i]['profileurl'] = url;
                                        }
                                    }

                                    this.setState({friendList:JSON.parse(JSON.stringify(this.state.friendList))})
                                  })
                                }
                              }
                            }
                          }
                        }
                      }
                    })
                  }
                }
              })
            }

    onRefresh() {
        if (!this.state.refreshing) {

            this.setState({refreshing: true});

            this.checkAlreadyFriend()
            
          }
        }

    renderFriends() {
        if (this.state.friendList.length > 0) {
        return (
            <FlatList
            data={this.state.friendList}
            renderItem={this._renderItem}
            keyExtractor={this._keyExtractor}
            maxToRenderPerBatch={1}
            removeClippedSubviews={false}
            onRefresh={() => this.onRefresh()}
            refreshing={this.state.refreshing}
            onRefreshItems= {this.props.onRefreshItems}
            onEndReached={this.handleLoadMore}
            onEndReachedThreshold={0}
            />
        )
    } else {
        return(
            <View style={styles.loadingView}>
                <Text style = {styles.placesText}>No friend added yet!</Text>
            </View>
        )
    }
    }

    render() {
         <StatusBar
            barStyle = "light-content"
            backgroundColor = 'blue'/>
        return (
            <View style={styles.container}>
                <View style = {styles.statusbar}/>
                <View style = {styles.tabView}>
                    <TouchableOpacity style = {styles.backButton} onPress = {this._onback}>
                        <Image source = {require('../assets/img/back.png')} style = {{width: 18, height: 18}}/>
                    </TouchableOpacity>
                    <Text style = {styles.title}>Friends</Text>
                </View>

                <Content bounces={false} contentContainerStyle={{ flex: 1, backgroundColor: 'white', alignItems:'center' }}>

                {this.renderFriends()}

                </Content>
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
    friendsListCell: {
        width: Constant.WIDTH_SCREEN,
        height: 70,
        flexDirection:'row',
        padding: 10,
        justifyContent:'center'
    },
    menuIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    menuIcon1: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#f1eff0',
    },
    menuItem:{
      color: 'black',
      opacity: 1,
      fontSize: 18,
      marginLeft: 15,
    },
    loadingView: {
        flex: 1,
        justifyContent:'center',
    },
    placesText: {
        color: 'gray',
        textAlign: 'center'
    },
    onlinestatus: { 
        borderRadius: 7,
        right: 0,
        bottom:0, 
        position: 'absolute',
        backgroundColor: "#00ff00", 
        width:14, 
        height:14,
        borderWidth: 2,
        borderColor: "#ffffff",
    },
    offlinestatus: { 
        borderRadius: 7,
        right: 0,
        bottom:0, 
        position: 'absolute',
        backgroundColor: "#D3D3D3", 
        width:14, 
        height:14,
        borderWidth: 2,
        borderColor: "#ffffff",
    }

});

//make this component available to the app
export default Friends;
