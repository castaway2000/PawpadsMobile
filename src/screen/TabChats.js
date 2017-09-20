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
import {sendRequest} from '../actions/http';

const datas = []
var currentPage = 0

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
        currentPage = 0
        datas = []
        AsyncStorage.getItem(Constant.QB_USERID).then((value) => {
            this.setState({ userID: value })
        })
        this.loadData()     
    }
    loadData(){
        AsyncStorage.getItem(Constant.QB_TOKEN).then((token) => {
            var REQUEST_URL = Constant.RETRIEVE_DIALOGS_URL + '?type[in]=2,3' + '&limit=10' + '&skip=' + currentPage*10
            console.log(REQUEST_URL)
            fetch(REQUEST_URL, {
                method: 'GET',
                headers: { 
                    'Content-Type': 'application/json',
                    'QB-Token': token
                },
            })
            .then((response) => response.json())
            .then((responseData) => {
                if(responseData.limit > 0){
                    console.log(responseData)
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
    downloadLastUser(occupants_ids){
        var last_message_userid = ''
        for(var j=0; j<occupants_ids.length; j++){
            if(occupants_ids[j] != this.state.userID){
                last_message_userid = occupants_ids[j].toString()
            }
        }
        var REQUEST_URL = Constant.USERS_URL + last_message_userid +'.json'
        console.log(REQUEST_URL)
        fetch(REQUEST_URL, {
            method: 'GET',
            headers: { 
                'Content-Type': 'application/json',
                'QB-Token': this.state.token
            },
        })
        .then((response) => response.json())
        .then((responseData) => {
            console.log('====')
            console.log(responseData)

            for(var i = 0;i < this.state.dialogs.length; i++){
                if(this.state.dialogs[i].name == responseData.user.login || this.state.dialogs[i].name == responseData.user.full_name){
                    this.state.dialogs[i]['blob_id'] = responseData.user.blob_id.toString();
                }
            }
            this.setState({
                refresh: true
            });
        }).catch((e) => {
            console.log(e)
        })
    }
    renderChats(){
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
                      <TouchableOpacity style = {styles.tabChannelListCell} onPress={() => this.props.navigation.navigate('Chat', {GroupName: data.name, GroupChatting: true, Dialog: data, Token: this.state.token})} key = {index}>
                        {this.state.refresh == false? this.downloadLastUser(data.occupants_ids) : null}
                        <Image source = {{
                                uri: Constant.BLOB_URL + data.blob_id + '/download.json',
                                method:'GET',
                                headers: { 
                                        'Content-Type': 'application/json',
                                        'QB-Token': this.state.token
                                    },
                                }}
                                defaultSource = {require('../assets/img/user_placeholder.png')}
                                style = {styles.menuIcon} />
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
export default TabChats;
