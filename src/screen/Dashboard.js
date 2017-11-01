//import libraries
import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, StatusBar, Platform, ScrollView, AsyncStorage } from 'react-native';
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

    constructor(props){
        super(props)
        this.state = {
            isNearby: true,
            isChats: false,
            isChannels: false,
        }
    }

    _onMenu = () => {
        this.props.navigation.navigate('DrawerOpen')
    }
    _onSearch = () => {
        if(this.state.isNearby){
            this.props.navigation.navigate('Search', {TabName: 'NEARBY'})
        }
        if(this.state.isChats){
            this.props.navigation.navigate('Search', {TabName: 'CHATS'})
        }
        if(this.state.isChannels){
            this.props.navigation.navigate('Search', {TabName: 'CHANNELS'})
        }
    }
    
    _onNearby = () => {
        this.setState({
            isNearby: true,
            isChats: false,
            isChannels: false,
        })
    }
    _onChats = () => {
        this.setState({
            isNearby: false,
            isChats: true,
            isChannels: false,
        })
    }
    _onChannels = () => {
        this.setState({
            isNearby: false,
            isChats: false,
            isChannels: true,
        })
    }

    showTabView(){
        if(this.state.isNearby){
            return(
                <View style = {{width: Constant.WIDTH_SCREEN, flex: 1, backgroundColor: 'white'}}>
                    <TabNearBy navigation = {this.props.navigation}/>
                </View>
            )
        }
        if(this.state.isChats){
            return(
                <View style = {{width: Constant.WIDTH_SCREEN, flex: 1, backgroundColor: 'white'}}>
                    <TabChats navigation = {this.props.navigation}/>
                </View>
            )
        }
        if(this.state.isChannels){
            return(
                <View style = {{width: Constant.WIDTH_SCREEN, flex: 1, backgroundColor: 'white'}}>
                    <TabChannels navigation = {this.props.navigation}/>
                </View>
            )
        }
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
                {/*<Container style = {{backgroundColor:'white'}}>
                    <Tabs initialPage = {0} tabBarUnderlineStyle = {{backgroundColor: 'white'}} locked = {true}>
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
                </Container>*/}

                <View style = {{width: Constant.WIDTH_SCREEN, height: 50, backgroundColor: Constant.APP_COLOR, flexDirection: 'row'}}>
                    <TouchableOpacity style = {styles.tabItem} onPress = {this._onNearby}>
                        <Text style = {{color: 'white', fontSize: 16}}>NEARBY</Text>
                        <View style = {this.state.isNearby? styles.tabline : null}/>
                    </TouchableOpacity>
                    <TouchableOpacity style = {styles.tabItem} onPress = {this._onChats}>
                        <Text style = {{color: 'white', fontSize: 16}}>CHATS</Text>
                        <View style = {this.state.isChats? styles.tabline : null}/>
                    </TouchableOpacity>
                    <TouchableOpacity style = {styles.tabItem} onPress = {this._onChannels}>
                        <Text style = {{color: 'white', fontSize: 16}}>CHANNELS</Text>
                        <View style = {this.state.isChannels? styles.tabline : null}/>
                    </TouchableOpacity>
                </View>
                {this.showTabView()}
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
    },
    tabline: {
        width: Constant.WIDTH_SCREEN/3,
        height: 3.5,
        backgroundColor: 'white',
        position:'absolute',
        bottom: 0,
        left: 0,
    },
    tabItem: {
        height: 50, 
        width: Constant.WIDTH_SCREEN/3, 
        justifyContent:'center', 
        alignItems:'center'
    }

});

//make this component available to the app
export default Dashboard;
