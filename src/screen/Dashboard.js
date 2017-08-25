//import libraries
import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, StatusBar, Platform, ScrollView } from 'react-native';
import { Container, Header, Title, Button, Icon, Tabs, Tab, Right, Left, Body, TabHeading} from 'native-base'
import Constant from '../common/Constant'
import TabChannels from './TabChannels'
import TabChats from './TabChats'
import TabNearBy from './TabNearBy'

// create a component
class Dashboard extends Component {
    static navigationOptions = {
        title:'',
        header: null
    };
    _onMenu = () =>{
        this.props.navigation.navigate('DrawerOpen')
    }
    render() {
        return (
            <View style={styles.container}>
                <View style = {styles.menuView}>
                    <TouchableOpacity style = {styles.menuButton} onPress = {this._onMenu}>
                        <Image source = {require('../assets/img/menu.png')} style = {{width: 18, height: 18}}/>
                    </TouchableOpacity>
                    <Text style = {styles.title}>PawPads</Text>
                    <TouchableOpacity style = {styles.searchButton} onPress = {this._onSearch}>
                        <Image source = {require('../assets/img/search.png')} style = {{width: 18, height: 18}}/>
                    </TouchableOpacity>
                </View>
                <Container style = {{backgroundColor:'white'}}>
                    <Tabs initialPage = {0} tabBarUnderlineStyle = {{backgroundColor: 'white'}}>
                        <Tab heading = { <TabHeading style = {{backgroundColor: Constant.APP_COLOR}}><Text style = {{color: 'white'}}>NEARBY</Text></TabHeading> }>
                            <TabNearBy navigation = {this.props.navigation}/>
                        </Tab>
                        <Tab heading = { <TabHeading style = {{backgroundColor: Constant.APP_COLOR}}><Text style = {{color: 'white'}}>CHATS</Text></TabHeading> }>
                            <TabChats navigation = {this.props.navigation}/>
                        </Tab>
                        <Tab heading = { <TabHeading style = {{backgroundColor: Constant.APP_COLOR}}><Text style = {{color: 'white'}}>CHANNELS</Text></TabHeading> }>
                            <TabChannels navigation = {this.props.navigation}/>
                        </Tab>
                    </Tabs>
                </Container>
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
    menuView: {
        width: Constant.WIDTH_SCREEN,
        height: 60,
        marginTop: (Platform.OS == 'ios')? 20 : StatusBar.currentHeight,
        flexDirection:'row',
        alignItems:'center',
        backgroundColor: Constant.APP_COLOR
    },
    menuButton: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems:'center',
    },
    title: {
        color: 'white',
        marginLeft: 5,
        fontSize: 20
    },
    searchButton: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        position:'absolute',
        right: 5
    }
});

//make this component available to the app
export default Dashboard;
