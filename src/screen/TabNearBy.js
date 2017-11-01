//import liraries
import React, { Component } from 'react';
import { StyleSheet, StatusBar, Image, TouchableOpacity, RefreshControl, AsyncStorage,ActivityIndicator, ScrollView, Navigator} from 'react-native';
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
import { connect } from 'react-redux'

var datas = []
var distance_unit = ''
var range = ''
var gps_accuracy = ''

// create a component
class TabNearBy extends Component {
    constructor(props){
        super(props)
        this.state = {
            loading: true,
            token : '',
            refreshing: false,
            error: null,
            latitude: null,
            longitude: null,
            distance_unit: 'km',
            search_range: '60',
            gps_accuracy: 'medium',
            nearByUsers: []
        }
    }
    componentWillMount() {
        AsyncStorage.getItem(Constant.SETTINGS_DISTANCE_UNIT).then((value) => {
            if(value){
                this.setState({ distance_unit: value })
            }
        })
        AsyncStorage.getItem(Constant.SETTINGS_RANGE).then((value) => {
            if(value){
               this.setState({ search_range: value })
            }
            
        })
        AsyncStorage.getItem(Constant.SETTINGS_GPS_ACCURACY).then((value) => {
            if(value){
                this.setState({ gps_accuracy: value })
            }
        })
        this.loadData()     
    }

    loadData(){
        navigator.geolocation.getCurrentPosition(
            (position) => {
                this.setState({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    error: null,
                })
                AsyncStorage.getItem(Constant.QB_TOKEN).then((value) => {
                    if(this.state.distance_unit == 'km'){
                        var REQUEST_URL = Constant.NEARBY_FIND_USER_URL + '?radius=' + this.state.search_range + '&current_position=' + this.state.latitude + '%3B' + this.state.longitude + '&sort_by=distance' + '&per_page=100'
                    }else{
                        var REQUEST_URL = Constant.NEARBY_FIND_USER_URL + '?radius=' + parseInt(this.state.search_range)*1.60934 + '&current_position=' + this.state.latitude + '%3B' + this.state.longitude + '&sort_by=distance' + '&per_page=100'
                    }
                    console.log(REQUEST_URL)
                    fetch(REQUEST_URL, {
                        method: 'GET',
                        headers: { 
                            'Content-Type': 'application/json',
                            'QB-Token': value
                        },
                    })
                    .then((response) => response.json())
                    .then((responseData) => {
                        console.log(responseData.items)    
                        this.setState({ 
                            nearByUsers: responseData.items,
                            token: value,
                            loading: false 
                        })

                        this.props.NearByUsers(responseData.items)

                    }).catch((e) => {
                        console.log(e)
                    })   
                })
            },
            (error) => this.setState({error: error.message}),
            {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
        );
    }
    _onRefresh() {
        this.setState({refreshing: true});
        setTimeout(() => {
            this.setState({
                refreshing: false
            })
        }, 2000)
    }
    renderNearBy(){
        if(this.state.loading){
            return (
				<View style={styles.loadingView}>
					<ActivityIndicator color={'black'} size={'large'}/>
				</View>
			);
        }
        else{
            if(this.state.nearByUsers){
                return(
                    <List
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={this._onRefresh.bind(this)}
                            />
                        }
                        style = {styles.mList} 
                        dataArray={this.state.nearByUsers}
                        renderRow={data =>
                            <ListItem button noBorder onPress={() => this.props.navigation.navigate('Profile', {UserInfo: data.geo_datum.user.user})} style = {{height:70}}>
                                <Image source = {{
                                        uri: Constant.BLOB_URL + data.geo_datum.user.user.blob_id + '/download.json',
                                        method:'GET',
                                        headers: { 
                                                'Content-Type': 'application/json',
                                                'QB-Token': this.state.token
                                            },
                                        }}
                                        defaultSource = {require('../assets/img/user_placeholder.png')}
                                        style = {styles.menuIcon} 
                                />
                                {data.geo_datum.user.user.full_name?
                                    <Text style = {styles.menuItem}>{data.geo_datum.user.user.full_name}</Text> : 
                                    <Text style = {styles.menuItem}>{data.geo_datum.user.user.login}</Text> }
                                {this.state.distance_unit == 'km' ?
                                    <Text style = {styles.distance}>{parseInt(data.geo_datum.distance)} {this.state.distance_unit}</Text> :
                                    <Text style = {styles.distance} numberOfLines = {1}>{parseInt((data.geo_datum.distance)/1.60934)} {this.state.distance_unit}</Text>}
                            </ListItem>
                        }
                    >
                    </List>
                )
            }else{
                return(
                    <View style={styles.loadingView}>
                        <Text style = {styles.placesText}>There seems to be no one around. Try visiting this screen later or change your Distnace Settings.</Text>
                    </View>
                )
            }
            
        }
    }

    render() {
        return (
            <Container>
                <Content bounces={false} style={{ flex: 1, backgroundColor: 'white'}}>

                    { this.renderNearBy() }
                    
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
        height: Constant.HEIGHT_SCREEN - 140,
        paddingBottom: 30, 
        backgroundColor:'white'
    },
    menuItem:{
        color: 'black',
        opacity: 1,
        fontSize: 18,
        marginLeft: 15,
        flex: 1,
    },
    menuIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    distance: {
        color: 'gray',
        fontSize: 13,
    },
    loadingView: {
        flex: 1,
        justifyContent:'center',
        top: 200
    },
    placesText: {
        color: 'gray',
        textAlign: 'center'
    }
});


const mapStateToProps = state => ({

});

const mapDispatchToProps = dispatch => ({
    NearByUsers: users => dispatch({type: 'Nearby_Result', value: users})
})

export default connect(mapStateToProps, mapDispatchToProps)(TabNearBy)
