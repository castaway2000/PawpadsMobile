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
    {
		name: "Elizabeth Luna",
		route: "About",
        icon: require('../assets/img/userphotos/user3.jpg'),
	},
    {
		name: "Derek Banks",
		route: "Logout",
        icon: require('../assets/img/userphotos/user4.jpg'),
	},
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
    {
		name: "Elizabeth Luna",
		route: "About",
        icon: require('../assets/img/userphotos/user3.jpg'),
	},
    {
		name: "Derek Banks",
		route: "Logout",
        icon: require('../assets/img/userphotos/user4.jpg'),
	},
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
]

// create a component
class TabNearBy extends Component {
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
                                <Text style = {styles.menuItem}>{data.name}</Text>
                            </ListItem>
                        }
                    >
                    </List>

                </Content>
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
        // marginTop:10, 
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
});

//make this component available to the app
export default TabNearBy;