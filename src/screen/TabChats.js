//import libraries
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
		name: "Mabelle Baldwin",
		route: "Friends",
        icon: require('../assets/img/userphotos/user5.png'),
	},
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
class TabChats extends Component {
    constructor(props){
        super(props)
        this.state = {
            refreshing: false,
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
                            <ListItem button noBorder onPress={() => this.props.navigation.navigate('Profile')} style = {{height:70, padding:10}}>
                                <Image source = {data.icon} style = {styles.menuIcon}/>
                                <View style = {{marginLeft: 15,  flex: 1}}>
                                    <Text style = {styles.customerName}>{data.name}</Text>
                                    <Text style = {styles.customerMessage}>hi</Text>
                                </View>
                                <Text style = {styles.customerMessage}>18:12</Text>
                            </ListItem>
                        }
                    >
                    </List>
                </Content>
                <TouchableOpacity style = {styles.chatBtn}>
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
        // flex:1,
        height: 500,
        // marginTop:10, 
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
export default TabChats;
