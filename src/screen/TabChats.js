//import libraries
import React, { Component } from 'react';
import { StyleSheet, StatusBar, Image, TouchableOpacity, RefreshControl, AsyncStorage, ActivityIndicator, ScrollView} from 'react-native';
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
import {sendRequest} from '../actions/http';
import RNFirebase from 'react-native-firebase';

import {CachedImage} from 'react-native-img-cache';

const datas = []
var currentPage = 0
const firebase = RNFirebase.initializeApp({ debug: false, persistence: true })


// create a component
class TabChats extends Component {
    constructor(props){
        super(props)
        this.state = {
            refreshing: false,
            loading: true,
            dialogs: [],
            token: '',
            refresh: false,
            userID: '',
        }
    }

    componentWillMount() {
      console.log("Personal chat.");
        currentPage = 0
        datas = []
        AsyncStorage.getItem(Constant.QB_USERID).then((value) => {
            this.setState({ userID: value })
        })
        //this.loadData()
        this.loadDataFromFirebase()
    }

    loadDataFromFirebase() {

      this.loadGroupUsingID(2)
      .then((result) => {
        console.log("this.state.dialogs2",result);
        if (result) {
          for (key in result) {
            this.state.dialogs.push(result[key])
            this.setState({dialogs:this.state.dialogs})
          }
        }

        this.loadGroupUsingID(3)
        .then((result1) => {
          console.log("this.state.dialogs3",result1);
          this.setState({ loading: false })
          if (result1) {
            for (key in result1) {
              this.state.dialogs.push(result1[key])
              this.setState({dialogs:this.state.dialogs})
            }
          }
        })
      })
    }

    loadGroupUsingID = (groupid) => {
      return new Promise((resolve, reject) => {
      firebase.database()
          .ref(`/dialog`)
          .orderByChild("type")
          .equalTo(groupid)
          .once("value")
          .then(snapshot => {
              if (snapshot.val()) {
                resolve(snapshot.val());
              } else {
                resolve(null);
              }
          });
        })
    }

    loadData(){
        AsyncStorage.getItem(Constant.QB_TOKEN).then((token) => {
            var REQUEST_URL = Constant.RETRIEVE_DIALOGS_URL + '?type[in]=2,3' + '&limit=50' + '&skip=' + currentPage*10
            fetch(REQUEST_URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'QB-Token': "be2598a63b4fbd3cbffd5cab6c140c4d5d0089b4"
                },
            })
            .then((response) => response.json())
            .then((responseData) => {
              console.log("Dialogs:",responseData);
                if(responseData.limit > 0){
                  console.log("Dialogs:",responseData.items);

                    datas.push(responseData.items)
                    currentPage ++
                    this.setState({
                        dialogs: JSON.parse(JSON.stringify(datas[0])),
                        token: token,
                        loading: false
                    })
                } else {
                    this.setState({ loading: false })
                }

            }).catch((e) => {
                console.log(e)
            })
        })
    }

    _onRefresh() {
        this.loadData()
        this.setState({refreshing: true});
        setTimeout(() => {
            this.loadData()
            this.setState({
                refreshing: false
            })
        }, 2000)
    }

    downloadLastUserFirebase(data) {

      //Type of dialog. Possible values: 1(PUBLIC_GROUP), 2(GROUP), 3(PRIVATE)
      if (data.type == 2) {
        //GROUP
        firebase.database()
            .ref(`/users`)
            .orderByChild("id")
            .equalTo(data.user_id.toString())
            .once("value")
            .then(snapshot => {

              if (snapshot.val()) {
                var profileObj = snapshot.val();

                if (profileObj) {
                  let keys = Object.keys(profileObj);

                  console.log("profileObj IS a a:",profileObj);

                  var profile = null;
                  if (keys.length > 0) {
                    profile = profileObj[keys[0]]
                  }

                  if (profile) {
                    if (profile["content"]) {

                      for (let item in profile["content"]) {
                        let content = profile["content"][item]
                        let blobid =  content["id"]

                        if (blobid == data.photo) {

                          firebase.storage().ref("content/" + profile["firid"] + "/" + profile["content"][item]["name"]).getDownloadURL().then((url) => {
                            console.log("url IS a a:",url);
                            for(var i = 0;i < this.state.dialogs.length; i++){
                                if(this.state.dialogs[i].user_id == data.user_id){
                                    this.state.dialogs[i]['profileurl'] = url;
                                    console.log("url IS a a:",url);
                                }
                            }

                            this.setState({
                                refresh: true
                            });

                            this.props.ChatsUsers(this.state.dialogs)

                          })
                        }
                      }
                    }
                  }
                }
              }
            })
      } else if (data.type == 3) {
        //PRIVATE

              let occupants_ids = data.occupants_ids

                var last_message_userid = ''
                for(var j=0; j<occupants_ids.length; j++){
                    if(occupants_ids[j] != this.state.userID){
                        last_message_userid = occupants_ids[j].toString()
                    }
                }

                firebase.database()
                    .ref(`/users`)
                    .orderByChild("id")
                    .equalTo(last_message_userid)
                    .once("value")
                    .then(snapshot => {

                      if (snapshot.val()) {
                        var profileObj = snapshot.val();

                        if (profileObj) {
                          let keys = Object.keys(profileObj);

                          console.log("profileObj IS a a:",profileObj);

                          var profile = null;
                          if (keys.length > 0) {
                            profile = profileObj[keys[0]]
                          }

                          if (profile) {
                            if (profile["content"]) {

                              for (let item in profile["content"]) {
                                let content = profile["content"][item]
                                let blobid =  content["id"]

                                if (blobid == profile["blob_id"]) {

                                  firebase.storage().ref("content/" + profile["firid"] + "/" + profile["content"][item]["name"]).getDownloadURL().then((url) => {
                                    console.log("url IS a a:",url);
                                    for(var i = 0;i < this.state.dialogs.length; i++){
                                        if(this.state.dialogs[i].last_message_user_id == profile["id"]){
                                            this.state.dialogs[i]['profileurl'] = url;
                                            console.log("url IS a a:",url);
                                        }
                                    }

                                    this.setState({
                                        refresh: true
                                    });

                                    this.props.ChatsUsers(this.state.dialogs)

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

    downloadLastUser(occupants_ids) {

      console.log("occupants_ids:",occupants_ids);

        var last_message_userid = ''
        for(var j=0; j<occupants_ids.length; j++){
            if(occupants_ids[j] != this.state.userID){
                last_message_userid = occupants_ids[j].toString()
            }
        }
        var REQUEST_URL = Constant.USERS_URL + last_message_userid +'.json'

        fetch(REQUEST_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'QB-Token': this.state.token
            },
        })
        .then((response) => response.json())
        .then((responseData) => {

            for(var i = 0; i < this.state.dialogs.length; i++) {
                if(this.state.dialogs[i].name == responseData.user.login || this.state.dialogs[i].name == responseData.user.full_name) {
                    this.state.dialogs[i]['blob_id'] = responseData.user.blob_id;
                }
            }

            this.setState({
                refresh: true
            });

            this.props.ChatsUsers(this.state.dialogs)

        }).catch((e) => {
            console.log(e)
        })
    }

    checkAndNavigate(data) {

      //Type of dialog. Possible values: 1(PUBLIC_GROUP), 2(GROUP), 3(PRIVATE)
      if (data.type == 2) {
        //GROUP
        this.props.navigation.navigate('ChatGroup', {GroupName: data.name, GroupChatting: true, Dialog: data})
      } else if (data.type == 3) {
        //PRIVATE
        this.props.navigation.navigate('Chat', {GroupName: data.name, GroupChatting: true, Dialog: data, Token: this.state.token})
      }
    }




    renderChats() {
        if(this.state.loading) {
            return (
				<View style={styles.loadingView}>
					<ActivityIndicator color={'black'} size={'large'}/>
				</View>
			);
    } else {
            return(
                this.state.dialogs.map((data, index) => {
                    return(
                      <TouchableOpacity style = {styles.tabChannelListCell} onPress={() => this.checkAndNavigate(data)} key = {index}>
                        {this.state.refresh == false? this.downloadLastUserFirebase(data) : null}
                        <View style = {styles.menuIcon} >
                          <CachedImage source = {{ uri: data.profileurl }}
                          defaultSource = {require('../assets/img/user_placeholder.png')}
                          style = {styles.menuIcon} />
                        </View>
                        <View style = {{flex: 1, marginLeft: 15, justifyContent:'center'}}>
                          <Text style = {styles.menuItem}>{data.name}</Text>
                          <Text style = {styles.lastmessage} numberOfLines = {1} ellipsizeMode = 'tail' >{data.last_message}</Text>
                        </View>
                        </TouchableOpacity>
                    )
                })
            )
        }
    }
    render() {
        return (
            <Container>
                <Content bounces={false} contentContainerStyle={{ flex: 1, backgroundColor: 'white', alignItems:'center'}}>
                    <ScrollView
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={this._onRefresh.bind(this)}
                            />
                        }
                    >
                        {this.renderChats()}
                    </ScrollView>
                </Content>
                <TouchableOpacity style = {styles.chatBtn} onPress = {() => this.props.navigation.navigate('CreateGroupChat')}>
                    <Image source = {require('../assets/img/chat_button_new.png')} style = {{width: 70, height: 70}}/>
                </TouchableOpacity>
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
        height: 500,
        paddingBottom: 30,
        backgroundColor:'white'
    },
    customerName:{
        color: 'black',
        opacity: 1,
        fontSize: 18,
    },
    customerMessage:{
        color: 'lightgray',
        fontSize: 13,
    },
    menuIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#f1eff0',

    },
    chatBtn: {
        position:'absolute',
        bottom: 20,
        right: 20,
    },
    loadingView: {
        flex: 1,
        justifyContent:'center',
        top: 200
    },
    placesText: {
        color: 'gray',
        textAlign: 'center'
    },
    menuItem:{
        color: 'black',
        opacity: 1,
        fontSize: 15,
    },
    lastmessage:{
        fontSize: 12,
        color:'gray',
        width: 200,
        fontStyle:'italic',
        marginTop: 5,
    },
    tabChannelListCell: {
        width: Constant.WIDTH_SCREEN,
        height: 70,
        flexDirection:'row',
        padding: 10,
        justifyContent:'center',
    }
});

//make this component available to the app
const mapStateToProps = state => ({

});

const mapDispatchToProps = dispatch => ({
    ChatsUsers: users => dispatch({type: 'Chats_Result', value: users})
})

export default connect(mapStateToProps, mapDispatchToProps)(TabChats)
