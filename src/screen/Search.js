//import libraries
import React, { Component } from 'react';
import { Alert,StyleSheet, Image, TextInput, TouchableOpacity, StatusBar, Platform, ScrollView, RefreshControl, AsyncStorage } from 'react-native';
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
import SearchQBUserBox from './common/SearchQBUserBox'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import {CachedImage} from 'react-native-img-cache';

var isAlert = false
var isName = false
var isEmail = false
var isPassword = false
var isConfirm = false

var nearbyusers = []
var nearbySearchUsers = []
var distance_unit = ''

var isEmail = false

// create a component
class Search extends Component {
    constructor(props){
        super(props)
        this.state = {
            email: '',
            isEmail: false,
            searchResults:[],
            refreshing: false,
            token : '',
            distance_unit: 'km',
            refresh: false,
        }
    }

    componentWillMount() {
        var { nearbyusers } = this.props;

        AsyncStorage.getItem(Constant.SETTINGS_DISTANCE_UNIT).then((value) => {
            if(value){
                this.setState({ distance_unit: value })
            }
        })
        AsyncStorage.getItem(Constant.QB_TOKEN).then((value) => {
            this.setState({
                searchResults: nearbyusers,
                token: value,
            })
        })
    }

    _onRefresh() {
        this.setState({refreshing: true});
        setTimeout(() => {
            this.setState({
                refreshing: false
            })
        }, 2000)
    }

    _onback = () => {
        this.props.navigation.goBack()
    }

    showSearchResultView(){
        var { nearbyusers } = this.props;
        var { nearbySearchUsers } = this.props;
        var { chatsUsers } = this.props;
        var { chatsSearchUsers } = this.props;
        var { channelsUsers } = this.props;
        var { channelsSearchUsers } = this.props;
        var {params} = this.props.navigation.state

        if(params.TabName == 'NEARBY') {
            return(
                <List
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.refreshing}
                            onRefresh={this._onRefresh.bind(this)}
                        />
                    }
                    style = {styles.mList}
                    dataArray={ nearbySearchUsers == undefined ? this.state.searchResults : nearbySearchUsers}
                    renderRow={data =>
                        <ListItem button noBorder onPress={() => this.props.navigation.navigate('Profile', {UserInfo: data})} style = {{height:70}}>
                            <CachedImage source = {{
                                    uri: data.profileurl,
                                    }}
                                    defaultSource = {require('../assets/img/user_placeholder.png')}
                                    style = {styles.menuIcon}
                            />
                            {data.full_name?
                                <Text style = {styles.menuItem}>{data.full_name}</Text> :
                                <Text style = {styles.menuItem}>{data.login}</Text> }
                            {this.state.distance_unit == 'km' ?
                                <Text style = {styles.distance}>{data.distance} {this.state.distance_unit}</Text> :
                                <Text style = {styles.distance} numberOfLines = {1}>{parseInt(data.distance/1.60934)} {this.state.distance_unit}</Text>}
                        </ListItem>
                    }
                >
                </List>
            )
        }

        if(params.TabName == 'CHATS') {
            if(chatsSearchUsers == undefined) {
                return(
                    chatsUsers.map((data, index) => {
                        return(
                        <TouchableOpacity style = {styles.tabChannelListCell} onPress={() => this.props.navigation.navigate('Chat', {GroupName: data.name, GroupChatting: true, Dialog: data, Token: this.state.token})} key = {index}>
                            {/*{this.state.refresh == false? this.downloadLastUser(data.occupants_ids) : null}*/}
                            <CachedImage source = {{
                                    uri: data.profileurl,
                                    }}
                                    defaultSource = {require('../assets/img/user_placeholder.png')}
                                    style = {styles.menuIcon} />
                            <View style = {{flex: 1, marginLeft: 15, justifyContent:'center'}}>
                                <Text style = {styles.menuItem1}>{data.name}</Text>
                                <Text style = {styles.lastmessage} numberOfLines = {1} ellipsizeMode = 'tail' >{data.last_message}</Text>
                            </View>
                        </TouchableOpacity>
                        )
                    })
                )
            } else {
                return(
                    chatsSearchUsers.map((data, index) => {
                        return(
                        <TouchableOpacity style = {styles.tabChannelListCell} onPress={() => this.props.navigation.navigate('Chat', {GroupName: data.name, GroupChatting: true, Dialog: data, Token: this.state.token})} key = {index}>
                            <CachedImage source = {{
                                    uri: data.profileurl,
                                    }}
                                    defaultSource = {require('../assets/img/user_placeholder.png')}
                                    style = {styles.menuIcon} />
                            <View style = {{flex: 1, marginLeft: 15, justifyContent:'center'}}>
                                <Text style = {styles.menuItem1}>{data.name}</Text>
                                <Text style = {styles.lastmessage} numberOfLines = {1} ellipsizeMode = 'tail' >{data.last_message}</Text>
                            </View>
                        </TouchableOpacity>
                        )
                    })
                )
            }
        }

        if(params.TabName == 'CHANNELS'){
            if(channelsSearchUsers == undefined){
                return(
                    channelsUsers.map((data, index) => {
                        return(
                        <TouchableOpacity style = {styles.tabChannelListCell} onPress={() => this.props.navigation.navigate('ChatGroup', {GroupName: data.name, GroupChatting: true, Dialog: data})} key = {index}>
                            <Image source = {{
                                uri: Constant.BLOB_URL + data.photo + '/download.json',
                                method:'GET',
                                headers: {
                                        'Content-Type': 'application/json',
                                        'QB-Token': this.state.token
                                    },
                                }}

                                defaultSource = {require('../assets/img/user_placeholder.png')}
                                style = {styles.menuIcon} />
                            <View style = {{flex: 1, marginLeft: 15}}>
                                <Text style = {styles.menuItem1}>{data.name}</Text>
                                <View style = {{flexDirection:'row',marginTop: 5, alignItems:'center'}}>

                                    <Image source = {{
                                        uri: Constant.BLOB_URL + data.blob_id + '/download.json',
                                        method:'GET',
                                        headers: {
                                                'Content-Type': 'application/json',
                                                'QB-Token': this.state.token
                                            },
                                        }}
                                        defaultSource = {require('../assets/img/user_placeholder.png')}
                                        style = {{width: 20, height: 20, borderRadius: 10}} />
                                    <Text style = {styles.lastmessage1} numberOfLines = {1} ellipsizeMode = 'tail' >{data.last_message}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                        )
                    })
                )
            }else{
                return(
                    channelsSearchUsers.map((data, index) => {
                        return(
                        <TouchableOpacity style = {styles.tabChannelListCell} onPress={() => this.props.navigation.navigate('ChatGroup', {GroupName: data.name, GroupChatting: true, Dialog: data})} key = {index}>
                            {/*{this.state.refresh == false? this.downloadLastUser(data.last_message_user_id) : null}*/}
                            <Image source = {{
                                uri: Constant.BLOB_URL + data.photo + '/download.json',
                                method:'GET',
                                headers: {
                                        'Content-Type': 'application/json',
                                        'QB-Token': this.state.token
                                    },
                                }}
                                defaultSource = {require('../assets/img/user_placeholder.png')}
                                style = {styles.menuIcon} />
                            <View style = {{flex: 1, marginLeft: 15}}>
                                <Text style = {styles.menuItem1}>{data.name}</Text>
                                <View style = {{flexDirection:'row',marginTop: 5}}>

                                    <Image source = {{
                                        uri: Constant.BLOB_URL + data.blob_id + '/download.json',
                                        method:'GET',
                                        headers: {
                                                'Content-Type': 'application/json',
                                                'QB-Token': this.state.token
                                            },
                                        }}
                                        defaultSource = {require('../assets/img/user_placeholder.png')}
                                        style = {{width: 20, height: 20, borderRadius: 10}} />
                                    <Text style = {styles.lastmessage1} numberOfLines = {1} ellipsizeMode = 'tail' >{data.last_message}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                        )
                    })
                )
            }
        }
    }

    showSearchUserBox(){
        var { nearbyusers } = this.props;
        var { chatsUsers } = this.props;
        var { channelsUsers } = this.props;

        var {params} = this.props.navigation.state
        if(params.TabName == 'NEARBY'){
            return(
                <SearchQBUserBox  users = {nearbyusers} TabName = 'NEARBY'/>
            )
        }
        if(params.TabName == 'CHATS'){
            return(
                <SearchQBUserBox  users = {chatsUsers} TabName = 'CHATS'/>
            )
        }

        if(params.TabName == 'CHANNELS'){
            return(
                <SearchQBUserBox  users = {channelsUsers} TabName = 'CHANNELS'/>
            )
        }
    }

    render() {
        var { nearbyusers } = this.props;
        var { nearbySearchUsers } = this.props;

        var { chatsUsers } = this.props;

        <StatusBar
            barStyle = "light-content"
            backgroundColor = 'blue'
        />

        return (
            <View style={styles.container}>
                <View style = {styles.statusbar}/>
                <View style = {styles.tabView}>
                    <TouchableOpacity style = {styles.backButton} onPress = {this._onback}>
                        <Image source = {require('../assets/img/back.png')} style = {{width: 18, height: 18}}/>
                    </TouchableOpacity>
                    {this.showSearchUserBox()}
                </View>
                <View style = {styles.bodyView}>
                  <ScrollView>
                    <Content bounces={false} contentContainerStyle={{ flex: 1, backgroundColor: 'white',alignItems:'center'}}>
                      {this.showSearchResultView()}
                    </Content>
                  </ScrollView>
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
    mScrollView: {
        flex: 1,
        width: Constant.WIDTH_SCREEN,
        paddingLeft: 50,
        paddingRight: 50,
    },
    mainView: {
        flex: 1,
        alignItems:'center',
        justifyContent: 'center',
        paddingTop: 100
    },
    emailView: {
        width: Constant.WIDTH_SCREEN - 100,
        height: 45,
        justifyContent: 'center',
        paddingLeft: 10,
        paddingRight: 10,
        borderRadius: 3,
        marginTop: 40,
        backgroundColor:'#e7e7e7'
    },
    emailInput: {
        width: Constant.WIDTH_SCREEN - 100,
        textAlign:'left',
        fontSize: 14,
        color: 'black',

    },
    bodyView: {
        flex: 1,
        width: Constant.WIDTH_SCREEN,
        backgroundColor: 'white',
        alignItems: 'center'
    },
    mList: {
        width: Constant.WIDTH_SCREEN,
        height: Constant.HEIGHT_SCREEN - 80,
        backgroundColor:'white'
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
    menuItem:{
        color: 'black',
        opacity: 1,
        fontSize: 18,
        marginLeft: 15,
        flex: 1,
    },
    tabChannelListCell: {
        width: Constant.WIDTH_SCREEN,
        height: 70,
        flexDirection:'row',
        padding: 10,
        justifyContent:'center',
    },
    lastmessage:{
        fontSize: 12,
        color:'gray',
        width: 200,
        fontStyle:'italic',
        marginTop: 5,
    },
    lastmessage1:{
        fontSize: 12,
        color:'gray',
        width: 200,
        fontStyle:'italic',
        marginLeft: 10,
    },
    menuItem1:{
        color: 'black',
        opacity: 1,
        fontSize: 15,
    },
});


const mapStateToProps = state => ({
    nearbyusers: state.NearByUsersSearch.nearbyusers,
    nearbySearchUsers: state.NearByUsersSearch.nearbySearchUsers,

    chatsUsers: state.Search.chatsUsers,
    chatsSearchUsers: state.Search.chatsSearchUsers,

    channelsUsers: state.Search.channelsUsers,
    channelsSearchUsers: state.Search.channelsSearchUsers,

});

const mapDispatchToProps = dispatch => ({
    SearchResult: emptyArry => dispatch({type: 'Search_ClearResult'})
})

export default connect(mapStateToProps, mapDispatchToProps)(Search);
