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

var datas = []
var currentPage = 0

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
        }
        this.onPullRelease = this.onPullRelease.bind(this);
        this.topIndicatorRender = this.topIndicatorRender.bind(this);
    }
    onPullRelease(resolve){
        this.setState({refreshing: true});
        setTimeout(() => {
           this.loadData() 
           resolve()
        }, 3000)
    }

    componentWillMount() {
        currentPage = 0
        datas = []
        this.loadData()     
    }

    loadData(){
        AsyncStorage.getItem(Constant.QB_TOKEN).then((token) => {
            token = token
            var REQUEST_URL = Constant.RETRIEVE_DIALOGS_URL + '?limit=50' + '&type[in]=1,2' + '&skip=' + currentPage*10 
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
    
    downloadLastUser(last_message_userid){
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
                    this.state.dialogs[i]['blob_id'] = responseData.user.blob_id.toString();
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


    _onRefresh() {
        // this.loadData()   
        this.setState({refreshing: true});
        setTimeout(() => {
            this.setState({
                refreshing: false
            })

        }, 3000)

    }
    showLoadData(){
        if(this.state.loading){
            return (
				<View style={styles.loadingView}>
					<ActivityIndicator color={'black'} size={'large'}/>
				</View>
			);
        }
        else{
            console.log(this.state.token)
            console.log(this.state.dialogs)
            return(
                this.state.dialogs.map((data, index) => {
                    return(
                      <TouchableOpacity style = {styles.tabChannelListCell} onPress={() => this.props.navigation.navigate('ChatGroup', {GroupName: data.name, GroupChatting: true, Dialog: data})} key = {index}>
                        {this.state.refresh == false? this.downloadLastUser(data.last_message_user_id) : null}
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
                            <Text style = {styles.menuItem}>{data.name}</Text>
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
                                <Text style = {styles.lastmessage} numberOfLines = {1} ellipsizeMode = 'tail' >{data.last_message}</Text>
                            </View>
                        </View>
                      </TouchableOpacity>
                    )    
                })
            )
           
        }
        
    }

    topIndicatorRender(pulling, pullok, pullrelease){
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
    render() {
        return (
            <Container>
                <Content bounces={false} contentContainerStyle={{ flex: 1, backgroundColor: 'white', alignItems:'center' }}>
                    <PullView 
                        style = {{flex: 1, width:Constant.WIDTH_SCREEN}} 
                        onPullRelease = {this.onPullRelease}
                        topIndicatorRender = {this.topIndicatorRender}
                        onRefresh={this._onRefresh.bind(this)}
                        >
                        {/*<ScrollView
                            refreshControl={
                                <RefreshControl
                                    refreshing={this.state.refreshing}
                                    onRefresh={this._onRefresh.bind(this)}
                                />
                            }
                        >*/}
                            {this.showLoadData()}
                        {/*</ScrollView>*/}
                    </PullView>
                </Content>
                <TouchableOpacity style = {styles.chatBtn} onPress={() => this.props.navigation.navigate('ChatGroupEdit')}>
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

