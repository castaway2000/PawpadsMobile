//import liraries
import React, { Component } from 'react';
import { StyleSheet, StatusBar, Image, TouchableOpacity, RefreshControl, AsyncStorage,ActivityIndicator, ScrollView} from 'react-native';
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
import {connect} from 'react-redux';
import Constant from '../common/Constant'
import {PullView} from 'react-native-pull';
import {Dialog} from 'react-native-popup-dialog';
import { FlatList } from "react-native";
import RNFirebase from 'react-native-firebase';
const firebase = RNFirebase.initializeApp({ debug: false, persistence: true })

var datas = []
var currentPage = 0
var tmpThis = null

class MyListItem extends React.PureComponent {

  _onPress = () => {
      this.props.onPressItem(this.props.index);
  };

render() {
  const data = this.props.item;

  console.log("data:",data);

  return(
            <TouchableOpacity style = {styles.tabChannelListCell} onPress={() => tmpThis.props.navigation.navigate('ChatGroup', {GroupName: data.name, GroupChatting: true, Dialog: data})} key = {this.props.index}>
              {tmpThis.state.refresh == false? tmpThis.downloadLastUserFirebase(data.last_message_user_id) : null}
              {tmpThis.state.refresh1 == false? tmpThis.downloadGroupPhotoFirebase(data.photo,data._id) : null}
              <View style = {styles.menuIcon} >
              <Image source = {{
                  uri: data.photo
                  }}
                  defaultSource = {require('../assets/img/user_placeholder.png')}
                  style = {styles.menuIcon} />
                  </View>
              <View style = {{flex: 1, marginLeft: 15}}>
                  <Text style = {styles.menuItem}>{data.name}</Text>
                  <View style = {{flexDirection:'row',marginTop: 5}}>

                      <Image source = {{
                          uri: data.blob_id
                          }}
                          defaultSource = {require('../assets/img/user_placeholder.png')}
                          style = {{width: 20, height: 20, borderRadius: 10}} />
                      <Text style = {styles.lastmessage} numberOfLines = {1} ellipsizeMode = 'tail' >{data.last_message}</Text>
                  </View>
              </View>
            </TouchableOpacity>
  )
  }
}


// create a component
class TabChannels extends Component {
    constructor(props){
        super(props)
        this.state = {
            refreshing: false,
            userName: '',
            qb_userid: '',
            loading: true,
            dialogs: [],
            token: '',
            last_message_user_id: 0,
            refresh:false,
            refresh1:false,
            pagekey:null,
            pagetimestamp:null,
        }
        this.onPullRelease = this.onPullRelease.bind(this);
        this.topIndicatorRender = this.topIndicatorRender.bind(this);
    }

    onPullRelease(resolve) {
        console.log('*')
        this.setState({refreshing: true});
        setTimeout(() => {

          this.setState({pagekey: null});
          this.setState({pagetimestamp: null});
          this.setState({dialogs: []});

           this.loadDataFromFirebase(null,null)

           resolve()
        }, 3000)
    }

    componentWillMount() {
        currentPage = 0
        datas = []
        this.loadDataFromFirebase(null,null)
        tmpThis  = this
    }

    loadData() {
        AsyncStorage.getItem(Constant.QB_TOKEN).then((token) => {
            token = token
            var REQUEST_URL = Constant.RETRIEVE_DIALOGS_URL + '?limit=100' + '&type[in]=1,2' + '&skip=' + currentPage*10

            console.log("Request url - ",REQUEST_URL);

            fetch(REQUEST_URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'QB-Token': "820ed709accdffd4b3fa640c5c1034fc8f0089b4"
                },
            })
            .then((response) => response.json())
            .then((responseData) => {
              console.log("response:",responseData);
                if(responseData.limit > 0){
                    datas.push(responseData.items)
                    console.log(datas)
                    currentPage ++
                    this.setState({
                        dialogs: JSON.parse(JSON.stringify(datas[0])),
                        token: token,
                        loading: false
                    })
                }else{
                    this.setState({ loading: false })
                }
            }).catch((e) => {
                console.log(e)
            })
        })
    }

    loadDataFromFirebase(pagekey,pagetimestamp) {

      console.log("pagekey:",pagekey);
      console.log("pagetimestamp:",pagetimestamp);
      if (pagekey && pagetimestamp) {
        this.loadGroupUsingIDPage(1,pagekey,pagetimestamp)
        .then((result) => {
          console.log("this.state.dialogs2",result);
          if (result) {
            for (key in result) {
              let obj = result[key]
              obj["pagekey"] = key
              this.state.dialogs.push(obj)
            }

            if (this.state.dialogs.length > 0) {
              this.state.dialogs.sort(function(a, b) {
                  var keyA = a.last_message_date_sent,
                      keyB = b.last_message_date_sent;
                  if(keyA > keyB) return -1;
                  if(keyA < keyB) return 1;
                  return 0;
              });

              let obj =  this.state.dialogs[this.state.dialogs.length-1]
              this.setState({ pagekey: obj["pagekey"] })
              this.setState({ pagetimestamp: obj["last_message_date_sent"] })
            }

            this.setState({ loading: false })
            this.setState({dialogs:this.state.dialogs})
          }
        })
      } else {
        this.loadGroupUsingID(1)
        .then((result) => {
          console.log("this.state.dialogs2",result);
          if (result) {
            for (key in result) {
              let obj = result[key]
              obj["pagekey"] = key
              this.state.dialogs.push(obj)
            }

            if (this.state.dialogs.length > 0) {
              this.state.dialogs.sort(function(a, b) {
                  var keyA = a.last_message_date_sent,
                      keyB = b.last_message_date_sent;
                  if(keyA > keyB) return -1;
                  if(keyA < keyB) return 1;
                  return 0;
              });

              let obj =  this.state.dialogs[this.state.dialogs.length-1]
              this.setState({ pagekey: obj["pagekey"] })
              this.setState({ pagetimestamp: obj["last_message_date_sent"] })
            }
            this.setState({ loading: false })
            this.setState({dialogs:this.state.dialogs})
            console.log(z);

          }
        })
      }
    }

    handleLoadMore = () => {
      if (!this.state.loading) {
        this.loadDataFromFirebase(this.state.pagekey,this.state.pagetimestamp);
      }
    }

    // loadGroupUsingID = (groupid) => {
    //   return new Promise((resolve, reject) => {
    //   firebase.database()
    //       .ref(`/dialog`)
    //       .orderByChild("type")
    //       .limitToFirst(20)
    //       .equalTo(groupid)
    //       .once("value")
    //       .then(snapshot => {
    //           if (snapshot.val()) {
    //             resolve(snapshot.val());
    //           } else {
    //             resolve(null);
    //           }s
    //       });
    //     })
    // }

    loadGroupUsingID = (groupid) => {
      return new Promise((resolve, reject) => {
      firebase.database()
          .ref(`/dialog`)
          .orderByChild("last_message_date_sent")

          .limitToLast(15)
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

    loadGroupUsingIDPage = (groupid,pagekey,pagetimestamp) => {
      return new Promise((resolve, reject) => {
      firebase.database()
          .ref(`/dialog`)
          .orderByChild("last_message_date_sent")
          .endAt(pagetimestamp-1, pagekey)
          .limitToLast(20)
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

    downloadGroupPhotoFirebase(photo_id,id) {

      if (photo_id) {
        console.log("downloadGroupPhotoFirebase...");
        firebase.database()
            .ref(`/content`)
            .orderByChild("id")
            .equalTo(parseInt(photo_id))
            .once("value")

            .then(snapshot => {

              if (snapshot.val()) {

                var contentObj = snapshot.val();

                if (contentObj) {
                  let keys = Object.keys(contentObj);

                  var content = null;
                  if (keys.length > 0) {
                    content = contentObj[keys[0]]
                  }

                  if (content) {
                    let imagename = content["name"]

                    firebase.storage().ref("content/" + content["tableId"] + "/" + imagename).getDownloadURL().then((url) => {
                      for(var i = 0;i < this.state.dialogs.length; i++){
                          if(this.state.dialogs[i]._id == id){
                              this.state.dialogs[i]['photo'] = url;
                              console.log("downloadGroupPhotoFirebase:",url);
                          }
                      }
                      this.setState({
                          refresh: true
                      });
                      this.setState({dialogs:this.state.dialogs})
                      this.props.ChannelsUsers(this.state.dialogs)
                    })
                  }
                }

                this.setState({
                    refresh1: true
                });
              }
            })
          }
        }

    downloadLastUserFirebase(last_message_userid) {
      if (last_message_userid) {
        console.log("downloadLastUser...");
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
                              for(var i = 0;i < this.state.dialogs.length; i++){
                                  if(this.state.dialogs[i].last_message_user_id == profile["id"]) {
                                      this.state.dialogs[i]['blob_id'] = url;
                                      console.log("downloadLastUserFirebase:",url);
                                  }
                              }
                              this.setState({refresh: true});
                              this.setState({dialogs:this.state.dialogs})

                              this.props.ChannelsUsers(this.state.dialogs)
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

    downloadLastUser(last_message_userid) {
        var REQUEST_URL = Constant.USERS_URL +  last_message_userid +'.json'
        fetch(REQUEST_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'QB-Token': this.state.token
            },
        })
        .then((response) => response.json())
        .then((responseData) => {
            for(var i = 0;i < this.state.dialogs.length; i++){
                if(this.state.dialogs[i].last_message_user_id == responseData.user.id){
                    this.state.dialogs[i]['profileImageURL'] = responseData.user.blob_id.toString();
                }
            }

            this.setState({
                refresh: true
            });

            this.props.ChannelsUsers(this.state.dialogs)


        }).catch((e) => {
            console.log(e)
        })
    }

    showLoadData() {
        if(this.state.loading){
            return (
        <View style={styles.loadingView}>
          <ActivityIndicator color={'black'} size={'large'}/>
        </View>
      );
        }
        else{
            return(
                this.state.dialogs.map((data, index) => {
                    return(
                      <TouchableOpacity style = {styles.tabChannelListCell} onPress={() => this.props.navigation.navigate('ChatGroup', {GroupName: data.name, GroupChatting: true, Dialog: data})} key = {index}>
                        {this.state.refresh == false? this.downloadLastUserFirebase(data.last_message_user_id) : null}

                        {this.state.refresh1 == false? this.downloadGroupPhotoFirebase(data.photo,data._id) : null}
                        <View style = {styles.menuIcon} >
                        <Image source = {{
                            uri: data.photo
                            }}
                            defaultSource = {require('../assets/img/user_placeholder.png')}
                            style = {styles.menuIcon} />
                            </View>
                        <View style = {{flex: 1, marginLeft: 15}}>
                            <Text style = {styles.menuItem}>{data.name}</Text>
                            <View style = {{flexDirection:'row',marginTop: 5}}>

                                <Image source = {{
                                    uri: data.blob_id
                                    }}
                                    defaultSource = {require('../assets/img/user_placeholder.png')}
                                    style = {{width: 20, height: 20, borderRadius: 10}} />
                                <Text style = {styles.lastmessage} numberOfLines = {1} ellipsizeMode = 'tail' >{data.last_message}</Text>
                            </View>
                        </View>
                      </TouchableOpacity>
                    )
                })
            )
        }
    }

    topIndicatorRender(pulling, pullok, pullrelease) {
        const hide = {position:'absolute', left: 10000};
        const show = {position:'relative', left: 0};
        setTimeout(() =>{
            if(pulling){
                this.txtPulling && this.txtPulling.setNativeProps({style:show});
                this.txtPullok && this.txtPullok.setNativeProps({style:hide});
                this.txtPullrelease && this.txtPullrelease.setNativeProps({style:hide});
            } else if(pullok){
                this.txtPulling && this.txtPulling.setNativeProps({style:hide});
                this.txtPullok && this.txtPullok.setNativeProps({style:show});
                this.txtPullrelease && this.txtPullrelease.setNativeProps({style:hide});
            } else if(pullrelease){
                this.txtPulling && this.txtPulling.setNativeProps({style:hide});
                this.txtPullok && this.txtPullok.setNativeProps({style:hide});
                this.txtPullrelease && this.txtPullrelease.setNativeProps({style:show});
            }
        }, 1);

        return(
            <View style = {{flexDirection:'row', justifyContent:'center', alignItems:'center', height: 60}}>
                <ActivityIndicator size = 'small' color = 'gray'/>
                <Text ref = {(c) => {this.txtPulling = c;}}>Loading...</Text>
                <Text ref = {(c) => {this.txtPullok = c;}}>Release to refresh</Text>
                <Text ref = {(c) => {this.txtPullrelease = c;}}>Loading</Text>
            </View>
        );
    }

    _keyExtractor = (item, index) => index;

    render() {
        return (
            <Container>
                <Content bounces={false} contentContainerStyle={{ flex: 1, backgroundColor: 'white', alignItems:'center' }}>

                <FlatList
                  data={this.state.dialogs}
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

                </Content>
                <TouchableOpacity style = {styles.chatBtn} onPress={() => this.props.navigation.navigate('ChatGroupEdit')}>
                    <Image source = {require('../assets/img/chat_button_new.png')} style = {{width: 70, height: 70}}/>
                </TouchableOpacity>
            </Container>
        );
    }

    onRefresh() {
      this.setState({refreshing: true});
      setTimeout(() => {
          this.setState({
              refreshing: false
          })

      }, 3000)
    }

    _renderItem = ({ item, index }) => ( <MyListItem
        index = { index }
        item = { item }
        onPressItem = { this._onPressItem }/>
    );
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
        width: Constant.WIDTH_SCREEN,
        paddingBottom: 30,
        backgroundColor:'white'
    },
    menuItem:{
        color: 'black',
        opacity: 1,
        fontSize: 15,
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
    lastmessage:{
        fontSize: 12,
        marginLeft: 10,
        color:'gray',
        width: 150,
        fontStyle:'italic'
    },
    tabChannelListCell: {
        width: Constant.WIDTH_SCREEN,
        height: 70,
        flexDirection:'row',
        padding: 10,
        justifyContent:'center'
    }
});

const mapStateToProps = state => ({

});

const mapDispatchToProps = dispatch => ({
    ChannelsUsers: users => dispatch({type: 'Channels_Result', value: users})
})

export default connect(mapStateToProps, mapDispatchToProps)(TabChannels)
