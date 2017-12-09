//import libraries
import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, StatusBar, Platform, ScrollView, Switch,AsyncStorage, ActivityIndicator } from 'react-native';
import { Container, Header, Content, Button, List, ListItem, } from 'native-base';
import Constant from '../common/Constant'
import reactNativeKeyboardAwareScrollView from 'react-native-keyboard-aware-scroll-view';

const participants_datas = []

var isBusy = false;
var groupName = '';
var groupType = '';
var groupParticipants = '';
var adminName = '';
var userPhotoURL = ''

// create a component
class ChatGroupEdit extends Component {
    constructor(props){
        super(props)
        this.state = {
            groupName : '',
            groupType : '',
            groupParticipants : '',
            adminName : '',
            userPhotoURL: '',
            token: '',
            people: [],
            isparticipantsLayout: true,
            isleaveAndDeleteBtn: true,
            isgroundAvatar: true,
            isphotoAvatarIcon: true,
            isgroupTitleText: true,
            isSaveBtn: true,
            blob_id:'',
            qbusername:'',
            loading: false,
        }
    }
    componentWillMount() {
        this.init()
        // StatusBar.setHidden(true);
    }

    init(){
        this.setState({ loading: true })
        var {params} = this.props.navigation.state
        
        AsyncStorage.getItem(Constant.QB_TOKEN).then((token) => {
            AsyncStorage.getItem(Constant.QB_USERID).then((currentUserId) => {
                if(params.Dialog != null && params.Dialog.type == 1){
                    this.setState({ isparticipantsLayout: false, token: token })
                    if(params.Dialog.user_id != currentUserId){
                        this.setState({ isleaveAndDeleteBtn: false,  })
                    }
                }
                if(params.Dialog != null && currentUserId != params.Dialog.user_id){
                    this.setState({
                        isgroundAvatar: false,
                        isphotoAvatarIcon: false,
                        isgroupTitleText: false,
                        isSaveBtn: false,
                        token: token
                    })
                }
                this.loadData()
            })
        })
    }

    loadData(){
        var {params} = this.props.navigation.state
        this.loadQBUserProfile(params.Dialog.user_id)
        if(params.Dialog == null) return null
        isBusy = true
        groupName = params.Dialog.name
        if(params.Dialog.type == 2){
            groupType = 'Private Group'
        }else{
            groupType = 'Channel'
        }
        var ocupantsSize = params.Dialog.occupants_ids.length
        if(ocupantsSize == 0){
            groupParticipants = 'Participants (0)'
        }else{
            groupParticipants = 'Participants (' + (ocupantsSize-1) + ')' 
        }

        this.getUsers(params.Dialog.occupants_ids)
        if(params.Dialog.photo != null){
            userPhotoURL = params.Dialog.photo
        }
        this.setState({
            groupName : groupName,
            groupType : groupType,
            groupParticipants : groupParticipants,
            userPhotoURL: userPhotoURL,
        })

    }

    loadQBUserProfile(userid){
        var REQUEST_URL = Constant.USERS_URL + userid + '.json'
        fetch(REQUEST_URL, {
            method: 'GET',
            headers: { 
                'Content-Type': 'application/json',
                'QB-Token': this.state.token
            },
        })
        .then((response) => response.json())
        .then((responseData) => {
            if(responseData.full_name){
                this.setState({
                    blob_id: responseData.user.blob_id.toString(),
                    qbusername: responseData.user.full_name,
                    loading: false,
                })
            }else{
                this.setState({
                    blob_id: responseData.user.blob_id.toString(),
                    qbusername: responseData.user.login,
                    loading: false ,
                })
            }
            
        }).catch((e) => {
            console.log(e)
        })   
    }

    getUsers(userIdsList){
        participants_datas = []
        var {params} = this.props.navigation.state
        if(userIdsList == null || userIdsList.length == 0){
            return null
        }
        var index = userIdsList.indexOf(params.Dialog.user_id)
        userIdsList.splice(index, 1)
        isBusy = false
        userIdsList.map((item, index) => {
            var REQUEST_URL = Constant.USERS_URL +  item.blob_id + '.json'
            fetch(REQUEST_URL, {
                method: 'GET',
                headers: { 
                    'Content-Type': 'application/json',
                    'QB-Token': this.state.token
                },
            })
            .then((response) => response.json())
            .then((responseData) => {
                participants_datas.push(responseData)
            }).catch((e) => {
                console.log(e)
            })
        })

    }

    showLoading(){
        if (this.state.loading) {
			return (
				<View style={styles.loadingView}>
					<ActivityIndicator color={'black'} size={'large'}/>
				</View>
			);
		}
    }

    _onback = () => {
        this.props.navigation.goBack()
    }
    render() {
        return (
            <View style={styles.container}>
                <ScrollView style = {styles.mscrollView}>
                    <View style = {{alignItems:'center'}}>
                        <View style = {styles.tabView}>
                            <Image source = {require('../assets/img/app_bar_bg.png')} style = {styles.tabViewBg}/>
                            <TouchableOpacity style = {styles.backButton} onPress = {this._onback}>
                                <Image source = {require('../assets/img/back.png')} style = {{width: 18, height: 18}}/>
                            </TouchableOpacity>
                            {this.state.isSaveBtn?
                                <View style = {styles.saveView}>
                                    <TouchableOpacity style = {styles.backButton} onPress = {this._onback}>
                                        <Text style = {styles.savetxt}>Save</Text>
                                    </TouchableOpacity>
                                </View> :
                                null
                            }
                        </View>
                        
                        <View style = {styles.bodyView}>
                            {this.state.isphotoAvatarIcon?
                                <TouchableOpacity  style = {{marginTop: 60}}>
                                    <Image source = {require('../assets/img/camera_grey_icon.png')} style = {{width: 24, height: 17,}}/>
                                </TouchableOpacity>:
                                <Image source = {require('../assets/img/camera_grey_icon.png')} style = {{width: 24, height: 17,marginTop: 60}}/>
                            }
                            
                            <View style = {styles.cellView}>
                                <TextInput
                                    editable = {this.state.isphotoAvatarIcon? true: false}
                                    style = {styles.inputText}
                                    placeholder = 'Group name'
                                    onChangeText = {(text) => this.setState({groupName:text})}
                                    keyboardType = 'default'
                                    placeholderTextColor = '#515151'
                                    value = {this.state.groupName}
                                    underlineColorAndroid = 'transparent'
                                    onSubmitEditing={() => {Keyboard.dismiss()}}
                                />

                                {this.state.isphotoAvatarIcon?
                                    <Image source = {require('../assets/img/pencil_icon.png')} style = {styles.icon}/>:
                                    null
                                }
                                
                            </View>
                            <View style = {styles.cellView}>
                                <Text style = {{fontSize: 18, color:'#515151'}}>{this.state.groupType}</Text>
                                {/*<Switch
                                    style = {{marginRight: 0}}
                                    onValueChange={(value) => this.setState({isShowMeNear: value})}
                                    onTintColor="#62DCFB"
                                    thumbTintColor="white"
                                    tintColor="lightgray"
                                    value={this.state.isShowMeNear}
                                />*/}
                            </View>
                            <View style = {styles.cellView}>
                                 <Text style = {styles.chatText}>Chat admin</Text>
                            </View>

                            <View style = {styles.chatadminView}>
                                <Image source = {{
                                    uri: Constant.BLOB_URL + this.state.blob_id + '/download.json',
                                    method:'GET',
                                    headers: { 
                                            'Content-Type': 'application/json',
                                            'QB-Token': this.state.token
                                        },
                                    }}
                                    defaultSource = {require('../assets/img/user_placeholder.png')}
                                    style = {styles.menuIcon} />
                                <Text style = {styles.menuItem}>{this.state.qbusername}</Text>
                            </View>

                            
                            {this.state.isparticipantsLayout? 
                                <View style = {styles.cellCategoryView}>
                                    <Text style = {styles.chatText}>{this.state.groupParticipants}</Text>
                                </View>:
                                null
                            }
                            
                            <List
                                scrollEnabled = {false}
                                style = {styles.mList} 
                                dataArray={participants_datas}
                                renderRow={data =>
                                    <ListItem button noBorder onPress={() => this.props.navigation.navigate('Profile', { GroupName: data.login})} style = {styles.cellItem}>
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
                                        <Text style = {styles.menuItem}>{data.full_name? data.full_name: data.login}</Text>
                                    </ListItem>
                                }
                            >
                            </List>
                        </View>
                        
                        <Image source = {{
                            uri: Constant.BLOB_URL + this.state.userPhotoURL + '/download.json',
                            method:'GET',
                            headers: { 
                                    'Content-Type': 'application/json',
                                    'QB-Token': this.state.token
                                },
                            }}
                            defaultSource = {require('../assets/img/user_placeholder.png')}
                            style = {styles.userphoto} />
                    </View>
                </ScrollView>
                {this.showLoading()}
            </View>
        );
    }
}

// define your styles
const styles = StyleSheet.create({
    container: {
        // flex: 1,
        alignItems: 'center',
        backgroundColor: 'white',
    },
    mscrollView:{
        // flex:1,
        backgroundColor: 'white',
        width: Constant.WIDTH_SCREEN,
        height: Constant.HEIGHT_SCREEN,
    },
    tabView: {
        width: Constant.WIDTH_SCREEN,
        height: 80,
        paddingLeft: 5,
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between'
    },
    tabViewBg: {
        flex: 1,
        height: 80,
        position: 'absolute',
        top: 0,
        left: 0,
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
        fontSize: 20,
        backgroundColor: 'transparent'
    },
    saveView: {
        flexDirection: 'row',
        paddingRight: 10,
    },
    savetxt: {
        color: 'white',
        fontSize: 15,
        backgroundColor:'transparent'
    },
    bodyView: {
        flex: 1,
        // height: (Platform.OS == 'ios')?Constant.HEIGHT_SCREEN - 80:Constant.HEIGHT_SCREEN - 83,
        width: Constant.WIDTH_SCREEN,
        backgroundColor: 'white',
        alignItems: 'center'
    },
    userphoto: {
        width: 100, 
        height: 100, 
        borderRadius: 50, 
        position: 'absolute',
        top: 30
    },
    cellView: {
        flexDirection: 'row',
        height: 50,
        width: Constant.WIDTH_SCREEN,
        paddingLeft: 20,
        paddingRight: 20,
        justifyContent:'space-between',
        alignItems: 'center',
        marginTop: 30,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#f4f4f4'
    },
    cellCategoryView: {
        flexDirection: 'row',
        height: 50,
        width: Constant.WIDTH_SCREEN,
        paddingLeft: 20,
        paddingRight: 20,
        justifyContent:'space-between',
        alignItems: 'center',
        marginTop: 15,
    },
    cellChatView: {
        flexDirection: 'row',
        height:60,
        width: Constant.WIDTH_SCREEN,
        paddingLeft: 20,
        paddingRight: 20,
        alignItems: 'center',
        marginTop: 20,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#f4f4f4'
    },
    lineTop: {
        width: Constant.WIDTH_SCREEN,
        height: 1,
        backgroundColor: '#f4f4f4',
        position: 'absolute',
        top: 0,
        left: 0,
    },
    lineBottom: {
        width: Constant.WIDTH_SCREEN,
        height: 1,
        backgroundColor: '#f4f4f4',
        position: 'absolute',
        bottom: 0,
        left: 0,
    },
    icon: {
        width: 16,
        height: 16,
        resizeMode: 'contain',
        marginLeft: 20
    },
    inputText: {
        flex: 1,
        fontSize: 18,
        color: Constant.APP_COLOR,
    },
    chatText: {
        fontSize: 18,
        color: '#515151'
    },
    mList: {
        flex: 1, 
        width: Constant.WIDTH_SCREEN, 
        backgroundColor:'white'
    },
    menuItem:{
        color: 'black',
        opacity: 1,
        fontSize: 18,
        marginLeft: 15,
    },
    menuIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    cellItem: {
        height:70, 
        padding:10,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#f4f4f4'
    },
    chatadminView: {
        flexDirection: 'row',
        height: 50,
        width: Constant.WIDTH_SCREEN,
        paddingLeft: 20,
        alignItems: 'center',
        marginTop: 15,
    },
    loadingView: {
        flex: 1,
        position: 'absolute',
        top: Constant.HEIGHT_SCREEN/2
    }
});

//make this component available to the app
export default ChatGroupEdit;
