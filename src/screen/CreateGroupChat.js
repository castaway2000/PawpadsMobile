//import libraries
import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, StatusBar, Platform, ScrollView } from 'react-native';
import {
    Content,
	List,
	ListItem,
	Icon,
	Container,
	Left,
	Right,
	Badge,
	Button,
} from 'native-base'
import Constant from '../common/Constant'
import { connect } from 'react-redux'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import SearchBox from './common/SearchBox'
import CheckBox from 'react-native-icon-checkbox';

var isAlert = false
var isName = false
var isEmail = false
var isPassword = false
var isConfirm = false
var isEmail = false

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
class CreateGroupChat extends Component {
    constructor(props){
        super(props)
        this.state = {
            email: '',
            isEmail: false,
            isKilometerSelected: false,
        }
    }
    _onback = () => {
        this.props.navigation.goBack()
    }
    handleSelectedKilometers = (checked) => {
        this.setState({
            isKilometerSelected: true,
        });
    }
    render() {
        <StatusBar
            barStyle = "light-content"
            backgroundColor = 'blue'
        />
        return (
            <View style={styles.container}>
                <View style = {styles.statusbar}/>
                <View style = {styles.tabView}>
                    <TouchableOpacity style = {styles.backButton} onPress = {this._onback}>
                        <Image source = {require('../assets/img/back.png')} style = {{width: 18, height: 18}}/>
                    </TouchableOpacity>
                    <Text style = {styles.title}>Create group</Text>
                    <TouchableOpacity style = {styles.doneBtn} onPress = {this._onback}>
                        <Text style = {{color: 'white', fontSize: 15}}>Done</Text>
                    </TouchableOpacity>
                </View>
                <View style = {styles.bodyView}>
                    <View style = {styles.serarchView}>
                        <SearchBox />
                    </View>
                    <Content bounces={false} style={{ flex: 1, backgroundColor: 'white'}}>
                        <List
                            style = {styles.mList} 
                            dataArray={datas}
                            renderRow={data =>
                                <ListItem button noBorder onPress={() => this.props.navigation.navigate('Profile')} style = {{height:70, padding:10}}>
                                    <CheckBox
                                        size={25}
                                        checked={this.state.isKilometerSelected}
                                        onPress={this.handleSelectedKilometers}
                                        uncheckedIconName="radio-button-unchecked"
                                        checkedIconName="radio-button-checked"
                                        iconStyle = {{color: Constant.APP_COLOR}}
                                    />
                                    <Image source = {data.icon} style = {styles.menuIcon}/>
                                    <Text style = {styles.customerName}>{data.name}</Text>
                                </ListItem>
                            }
                        >
                        </List>
                    </Content>
                    
                </View>
            </View>
        );
    }
}

// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: 'white',
    },
    statusbar:{
        width: Constant.WIDTH_SCREEN,
        height: (Platform.OS == 'ios')? 20 : StatusBar.currentHeight,
        backgroundColor: Constant.APP_COLOR,
        position: 'absolute',
        top: 0,
        left: 0,
    },
    tabView: {
        width: Constant.WIDTH_SCREEN,
        height: 60,
        paddingLeft: 5,
        marginTop: (Platform.OS == 'ios')? 20 : StatusBar.currentHeight,
        flexDirection:'row',
        alignItems:'center',
        backgroundColor: Constant.APP_COLOR,
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
        fontSize: 20
    },
    doneBtn:{
        position:'absolute',
        right: 15
    },
     bodyView: {
        flex: 1,
        width: Constant.WIDTH_SCREEN,
        backgroundColor: 'white',
        alignItems: 'center'
    },
    serarchView: {
        width: Constant.WIDTH_SCREEN,
        height: 80,
        justifyContent:'center',
        alignItems:'center'
    },
    mList: {
        // flex:1,
        height: 500,
        width: Constant.WIDTH_SCREEN,
        paddingBottom: 30, 
        backgroundColor:'white'
    },
    customerName:{
        color: 'black',
        opacity: 1,
        fontSize: 18,
        marginLeft: 15
    },
    menuIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
});

//make this component available to the app

const mapStateToProps = state => ({
    filteredData: state.Search.searchResult
});

const mapDispatchToProps = dispatch => ({

})

export default connect(mapStateToProps, mapDispatchToProps)(CreateGroupChat);