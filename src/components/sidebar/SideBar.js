//import liraries
import React, { Component } from 'react';
import { StyleSheet, StatusBar, Image } from 'react-native';
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
		name: "Edit",
		route: "Edit",
	},
	{
		name: "Friends",
		route: "Friends",
	},
    {
		name: "Settings",
		route: "Settings",
	},
    {
		name: "About",
		route: "About",
	},
    {
		name: "Logout",
		route: "Logout",
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

    render() {
        return (
            <Container>
                <Content bounces={false} style={{ flex: 1, backgroundColor: Constant.APP_COLOR}}>
                    {/*<Content style = {styles.drawer}>
                        <Image source = {require('../../assets/img/zahironline-white.png')} style = {styles.drawerCover} /> 
                    </Content>*/}
                    <View style = {styles.line}/>
                    <List 
                        dataArray={datas}
                        renderRow={data =>
                            <ListItem button noBorder onPress={() => this.props.navigation.navigate(data.route)} style = {{height:50, padding:10}}>
                                <Text style = {styles.menuItem}>{data.name}</Text>
                            </ListItem>
                        }
                        style = {{marginTop:15}}>
                    </List>
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
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    drawerCover: {
        alignSelf: "stretch",
        height: 47*0.7,
        width: 218*0.7,
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
        color: 'white',
        opacity: 1,
        fontSize: 13,
    }
});

//make this component available to the app
export default SideBar;
