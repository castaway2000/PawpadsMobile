//import liraries
import React, { Component } from 'react';
import { StyleSheet, StatusBar, Image, TouchableOpacity, RefreshControl } from 'react-native';
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

const datas = [
    {
		name: "Antonie Jirad",
		route: "Settings",
        icon: require('../assets/img/userphotos/user6.jpg'),
	},
    {
		name: "Nathan Cook",
		route: "Friends",
        icon: require('../assets/img/userphotos/user1.jpg'),
	},
    {
		name: "Margaret Caldwell",
		route: "Settings",
        icon: require('../assets/img/userphotos/user2.jpg'),
	},

]

// create a component
class TabChannels extends Component {
    constructor(props){
        super(props)
        this.state = {
            refreshing: false,
            userName: ''
        }
    }
    _onRefresh() {
        this.setState({refreshing: true});
        setTimeout(() => {
            this.setState({
                refreshing: false
            })
        }, 2000)
    }
    render() {
        return (
            <Container>
                <Content bounces={false} style={{ flex: 1, backgroundColor: 'white'}}>
                    <List
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={this._onRefresh.bind(this)}
                            />
                        }
                        style = {styles.mList} 
                        dataArray={datas}
                        renderRow={data =>
                            <ListItem button noBorder onPress={() => this.props.navigation.navigate('Chat', {GroupName: data.name, GroupChatting: true})} style = {{height:70, padding:10}}>
                                <Image source = {data.icon} style = {styles.menuIcon}/>
                                <Text style = {styles.menuItem}>{data.name}</Text>
                            </ListItem>
                        }
                    >
                    </List>

                </Content>
                <TouchableOpacity style = {styles.chatBtn} onPress = {() => this.props.navigation.navigate('Chat', {GroupName: 'Channel', GroupChatting: true})}>
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
        paddingBottom: 30, 
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
    chatBtn: {
        position:'absolute',
        bottom: 20,
        right: 20,
    }
});

//make this component available to the app
export default TabChannels;
