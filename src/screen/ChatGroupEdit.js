//import libraries
import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, StatusBar, Platform, ScrollView, Switch } from 'react-native';
import { Container, Header, Content, Button, List, ListItem, } from 'native-base';
import Constant from '../common/Constant'
import reactNativeKeyboardAwareScrollView from 'react-native-keyboard-aware-scroll-view';

const chatadmin_datas = [
    {
		name: "Antonie Jirad",
		route: "Settings",
        icon: require('../assets/img/userphotos/user1.jpg'),
	},
    {
		name: "Nathan Cook",
		route: "Friends",
        icon: require('../assets/img/userphotos/user2.jpg'),
	},


]
const participants_datas = [
    {
		name: "Antonie Jirad",
		route: "Settings",
        icon: require('../assets/img/userphotos/user4.jpg'),
	},
    {
		name: "Nathan Cook",
		route: "Friends",
        icon: require('../assets/img/userphotos/user3.jpg'),
	},
    {
		name: "Margaret Caldwell",
		route: "Settings",
        icon: require('../assets/img/userphotos/user6.jpg'),
	},

]

// create a component
class ChatGroupEdit extends Component {
    constructor(props){
        super(props)
        this.state = {
            username:'',
            userage:'',
            usergender:'',
            userhobby: '',
            userdetail: '',
            isShowMeNear: true,
        }
    }
    _onback = () => {
        this.props.navigation.goBack()
    }
    render() {
        return (
            <View style={styles.container}>
                <ScrollView >
                    <View style = {styles.mscrollView}>
                        <View style = {styles.tabView}>
                            <Image source = {require('../assets/img/app_bar_bg.png')} style = {styles.tabViewBg}/>
                            <TouchableOpacity style = {styles.backButton} onPress = {this._onback}>
                                <Image source = {require('../assets/img/back.png')} style = {{width: 18, height: 18}}/>
                            </TouchableOpacity>
                            <View style = {styles.saveView}>
                                <TouchableOpacity style = {styles.backButton} onPress = {this._onback}>
                                    <Text style = {styles.savetxt}>Save</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        
                        <View style = {styles.bodyView}>
                            <TouchableOpacity  style = {{marginTop: 60}}>
                                <Image source = {require('../assets/img/camera_grey_icon.png')} style = {{width: 24, height: 17,}}/>
                            </TouchableOpacity>
                            <View style = {styles.cellView}>
                                <TextInput
                                    style = {[styles.inputText, {color:Constant.APP_COLOR}]}
                                    placeholder = 'Group name'
                                    onChangeText = {(text) => this.setState({username:text})}
                                    keyboardType = 'default'
                                    placeholderTextColor = '#515151'
                                    value = {this.state.username}
                                    underlineColorAndroid = 'transparent'
                                />
                                <Image source = {require('../assets/img/pencil_icon.png')} style = {styles.icon}/>
                            </View>
                            <View style = {styles.cellView}>
                                <Text style = {{fontSize: 18, color:'#515151'}}>Private Group</Text>
                                <Switch
                                    style = {{marginRight: 0}}
                                    onValueChange={(value) => this.setState({isShowMeNear: value})}
                                    onTintColor="#62DCFB"
                                    thumbTintColor="white"
                                    tintColor="lightgray"
                                    value={this.state.isShowMeNear}
                                />
                            </View>
                            <View style = {styles.cellCategoryView}>
                                <Text style = {styles.chatText}>Chat admin</Text>
                                <TouchableOpacity>
                                    <Text style= {{color: Constant.APP_COLOR}}>Add</Text>
                                </TouchableOpacity>
                            </View>
                            <List
                                scrollEnabled = {false}
                                style = {styles.mList} 
                                dataArray={chatadmin_datas}
                                renderRow={data =>
                                    <ListItem button noBorder onPress={() => this.props.navigation.navigate('Profile', {GroupName: data.name})} style = {styles.cellItem}>
                                        <Image source = {data.icon} style = {styles.menuIcon}/>
                                        <Text style = {styles.menuItem}>{data.name}</Text>
                                    </ListItem>
                                }
                            >
                            </List>
                            <View style = {styles.cellCategoryView}>
                                <Text style = {styles.chatText}>Participants(2)</Text>
                                <TouchableOpacity>
                                    <Text style= {{color: Constant.APP_COLOR}}>Add</Text>
                                </TouchableOpacity>
                            </View>
                            <List
                                scrollEnabled = {false}
                                style = {styles.mList} 
                                dataArray={participants_datas}
                                renderRow={data =>
                                    <ListItem button noBorder onPress={() => this.props.navigation.navigate('Profile', {GroupName: data.name})} style = {styles.cellItem}>
                                        <Image source = {data.icon} style = {styles.menuIcon}/>
                                        <Text style = {styles.menuItem}>{data.name}</Text>
                                    </ListItem>
                                }
                            >
                            </List>
                        </View>
                        
                        <Image source = {require('../assets/img/userphotos/user0.jpg')} style = {styles.userphoto}/>
                    </View>
                </ScrollView>
            </View>
        );
    }
}

// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: Constant.APP_COLOR,
    },
    mscrollView:{
        flex:1,
        backgroundColor: 'transparent',
        alignItems:'center'
       
    },
    tabView: {
        width: Constant.WIDTH_SCREEN,
        height: 60,
        paddingLeft: 5,
        marginTop: (Platform.OS == 'ios')? 20 : StatusBar.currentHeight,
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between'
    },
    tabViewBg: {
        flex: 1,
        height: 60,
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
        color: Constant.APP_COLOR
    },
    chatText: {
        fontSize: 14,
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
    }
});

//make this component available to the app
export default ChatGroupEdit;
