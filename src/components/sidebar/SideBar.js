//import libraries
import React, { Component } from 'react';
import { StyleSheet, StatusBar, Image, TouchableOpacity } from 'react-native';
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
import { Actions } from 'react-native-router-flux';
import Constant from '../../common/Constant'

const datas = [
	{
		name: "Friends",
		route: "",
        icon: require('../../assets/img/two-men.png'),
	},
    {
		name: "Settings",
		route: "Settings",
        icon: require('../../assets/img/settings_icon.png'),
	},
    {
		name: "About",
		route: "About",
        icon: require('../../assets/img/about_icon.png'),
	},
    {
		name: "Logout",
		route: "Logout",
        icon: require('../../assets/img/logout_icon.png'),
	},
]
// create a component
class SideBar extends Component {
    constructor(props) {
		super(props);
		this.state = {
			shadowOffsetWidth: 1,
			shadowRadius: 4,
		};
	}
    _onEdit = () => {
        this.props.navigation.navigate('ProfileEdit')
    }

    render() {
        return (
            <Container>
                <Content bounces={false} style={{ flex: 1, backgroundColor: 'white'}}>
                    <Content>
                        <View style = {styles.drawer}>
                            <Image source = {require('../../assets/img/app_bar_bg.png')} style = {styles.drawerCover} /> 
                            <Image source = {require('../../assets/img/userphotos/user0.jpg')} style = {styles.userPhoto} />
                            <Text style = {styles.name}>Ihor Dzjuba</Text>
                            <TouchableOpacity style = {styles.editBtn} onPress = {this._onEdit}>
                                <Text style = {styles.edit}>Edit</Text>
                            </TouchableOpacity>
                        </View>
                    </Content>
                    <Content>
                        <List
                            style = {{marginTop:15, paddingBottom: 100, backgroundColor:'white', height: 400}} 
                            dataArray={datas}
                            renderRow={data =>
                                <ListItem button noBorder onPress={() => this.props.navigation.navigate(data.route)} style = {{height:50, padding:10}}>
                                    <Image source = {data.icon} style = {styles.menuIcon}/>
                                    <Text style = {styles.menuItem}>{data.name}</Text>
                                </ListItem>
                            }
                        >
                        </List>
                    </Content>
                </Content>
            </Container>
        );
    }
}

// define your styles
const styles = StyleSheet.create({
    sidebar: {
        paddingTop: 30,
        flex: 1,
        backgroundColor: '#0074aa',
    },
    title:{
        color: 'red',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 15,
    },
    drawer:{
        flex: 1,
        height: 150,
        padding: 20,
        justifyContent: 'center',
        // alignItems: 'center',
    },
    drawerCover: {
        height: 150,
        position: 'absolute',
        top: 0,
        left: 0,
    },
    line: {
        height: 1,
        width: 400,
        backgroundColor:'white',
        position: 'absolute',
        top: 79,
        left: 0,
        opacity:0.3,
    },
    menuItem:{
        color: 'black',
        opacity: 1,
        fontSize: 15,
        marginLeft: 15,
    },
    menuIcon: {
        width: 18,
        height: 18,
    },
    userPhoto: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginTop: 20,
    },
    name: {
        color: 'white',
        fontSize: 18,
        marginTop: 10
    },
    edit: {
        color: 'white'
    },
    editBtn: {
        position: 'absolute',
        top: 40,
        right: 20,
    },
});

//make this component available to the app
export default SideBar;
