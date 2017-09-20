//import libraries
import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, StatusBar, Platform, ScrollView,AsyncStorage,RefreshControl, ActivityIndicator } from 'react-native';
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

const datas = []

// create a component
class CreateGroupChat extends Component {
    constructor(props){
        super(props)
        this.state = {
            email: '',
            isEmail: false,
            isKilometerSelected: false,
            dialogs: [],
            token: '',
            refresh: false,
            userID: '',
            refreshing: false,
            loading: true,
        }
    }
    componentWillMount() {
        currentPage = 0
        datas = []
        AsyncStorage.getItem(Constant.QB_USERID).then((value) => {
            this.setState({ userID: value })
        })
        this.loadData()     
    }
    loadData(){
        AsyncStorage.getItem(Constant.QB_TOKEN).then((token) => {
            var REQUEST_URL = Constant.RETRIEVE_DIALOGS_URL + '?type[in]=2,3' + '&limit=10' + '&skip=' + currentPage*10
            console.log(REQUEST_URL)
            fetch(REQUEST_URL, {
                method: 'GET',
                headers: { 
                    'Content-Type': 'application/json',
                    'QB-Token': token
                },
            })
            .then((response) => response.json())
            .then((responseData) => {
                if(responseData.limit > 0){
                    console.log(responseData)
                    datas.push(responseData.items)
                    console.log(datas)
                    currentPage ++
                    this.setState({ 
                        dialogs: JSON.parse(JSON.stringify(datas[0])),
                        token: token,
                        loading: false 
                    })
                }else{
                    this.setState({ loading: false })
                }
                
            }).catch((e) => {
                console.log(e)
            })   
        })
    }
    _onback = () => {
        this.props.navigation.goBack()
    }
    _onRefresh() {
        this.loadData() 
        this.setState({refreshing: true});
        setTimeout(() => {
            this.loadData() 
            this.setState({
                refreshing: false
            })
        }, 2000)
    }
    handleSelectedKilometers = (checked) => {
        this.setState({
            isKilometerSelected: true,
        });
    }
    downloadLastUser(occupants_ids){
        var last_message_userid = ''
        for(var j=0; j<occupants_ids.length; j++){
            if(occupants_ids[j] != this.state.userID){
                last_message_userid = occupants_ids[j].toString()
            }
        }
        var REQUEST_URL = Constant.USERS_URL + last_message_userid +'.json'
        console.log(REQUEST_URL)
        fetch(REQUEST_URL, {
            method: 'GET',
            headers: { 
                'Content-Type': 'application/json',
                'QB-Token': this.state.token
            },
        })
        .then((response) => response.json())
        .then((responseData) => {
            console.log('====')
            console.log(responseData)
            console.log('--')
            console.log(responseData.user.custom_data)

            for(var i = 0;i < this.state.dialogs.length; i++){
                if(this.state.dialogs[i].name == responseData.user.login || this.state.dialogs[i].name == responseData.user.full_name){
                    this.state.dialogs[i]['blob_id'] = responseData.user.blob_id.toString();
                    this.state.dialogs[i]['custom_data'] = responseData.user.custom_data;
                }
            }
            this.setState({
                refresh: true
            });
        }).catch((e) => {
            console.log(e)
        })
    }
    renderCreateChats(){
        if(this.state.loading){
            return (
				<View style={styles.loadingView}>
					<ActivityIndicator color={'black'} size={'large'}/>
				</View>
			);
        }
        else{
            return(
                this.state.dialogs.map((data, index) => {
                    console.log(data)
                    return(
                      <TouchableOpacity style = {styles.tabChannelListCell} key = {index} onPress={() => this.props.navigation.navigate('Profile', {UserInfo: data})}>
                        {this.state.refresh == false? this.downloadLastUser(data.occupants_ids) : null}
                        <CheckBox
                            size={25}
                            checked={this.state.isKilometerSelected}
                            onPress={this.handleSelectedKilometers}
                            uncheckedIconName="radio-button-unchecked"
                            checkedIconName="radio-button-checked"
                            iconStyle = {{color: Constant.APP_COLOR}}
                        />
                        <Image source = {{
                            uri: Constant.BLOB_URL + data.blob_id + '/download.json',
                            method:'GET',
                            headers: { 
                                    'Content-Type': 'application/json',
                                    'QB-Token': this.state.token
                                },
                            }}
                            defaultSource = {require('../assets/img/user_placeholder.png')}
                            style = {styles.menuIcon} 
                        />
                        <Text style = {styles.customerName}>{data.name}</Text>
                      </TouchableOpacity>
                    )    
                })
            )
        }   
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
                    <Content bounces={false} contentContainerStyle={{ flex: 1, backgroundColor: 'white',alignItems:'center'}}>
                        <ScrollView
                            refreshControl={
                                <RefreshControl
                                    refreshing={this.state.refreshing}
                                    onRefresh={this._onRefresh.bind(this)}
                                />
                            }
                        >
                            {this.renderCreateChats()}
                        </ScrollView>
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
    loadingView: {
        flex: 1,
        justifyContent:'center',
        top: 200
    },
    tabChannelListCell: {
        width: Constant.WIDTH_SCREEN, 
        height: 70, 
        flexDirection:'row', 
        padding: 10, 
        paddingLeft: 20,
        alignItems:'center',
    }
});

//make this component available to the app

const mapStateToProps = state => ({
    filteredData: state.Search.searchResult
});

const mapDispatchToProps = dispatch => ({

})

export default connect(mapStateToProps, mapDispatchToProps)(CreateGroupChat);