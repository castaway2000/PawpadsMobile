//import liraries
import React, { Component, PropTypes } from 'react';
import { 
    View, 
    Text, 
    StyleSheet,
    TextInput,
    Image,
    TouchableOpacity,
    Keyboard
 } from 'react-native';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { NavigationActions } from 'react-navigation'
import Constant from '../../common/Constant'

var searchList = []
var filteredData = []

// define your styles
const styles = StyleSheet.create({

    searchView: {
        flexDirection: 'row',
        height: 40,
        width: Constant.WIDTH_SCREEN - 60,
        paddingLeft: 16,
        paddingRight: 16,
        alignItems: 'center',
        justifyContent:'space-around',
    },
    searchImg: {
        width: 16,
        height:  16,
        resizeMode: 'contain'
    },
    cancelImg: {
        width: 17,
        height:  17,
        resizeMode: 'contain'
    },
    searchInput: {
        flex: 1,
        height: 40,
        paddingVertical: 0,
        color: 'white',
    }
});

class SearchQBUserBox extends Component {

    constructor(props){
        super(props)
        this.state = {
            searchText:'',
        }
        // this.set = this.set.bind(this);
    }
    componentDidMount() {
        filteredData = []
    }

    set(text){
        this.setState({
            searchText: text,
        });
        if(this.props.TabName == 'NEARBY'){
            filteredData = this.filterNearBy(text, this.props.users)
            this.props.SearchResult(filteredData)
        }
        if(this.props.TabName == 'CHATS'){
            filteredData = this.filterChats(text, this.props.users)
            this.props.SearchChatsResult(filteredData)
        }
        if(this.props.TabName == 'CHANNELS'){
            filteredData = this.filterChannels(text, this.props.users)
            this.props.SearchChannelsResult(filteredData)
        }
        
    }
    filterNearBy(text, list){
        var query = text.toLowerCase();
        return list.filter(function(el){
            if(el.geo_datum.user.user.full_name){
                return el.geo_datum.user.user.full_name.toLowerCase().indexOf(query) > -1
            }else{
                return el.geo_datum.user.user.login.toLowerCase().indexOf(query) > -1
            }
            
        })
    }

    filterChats(text, list){
        var query = text.toLowerCase();
        return list.filter(function(el){
            return el.name.toLowerCase().indexOf(query) > -1
        })
    }

    filterChannels(text, list){
        var query = text.toLowerCase();
        return list.filter(function(el){
            return el.name.toLowerCase().indexOf(query) > -1
        })
    }

    onClearText = () => {
        this.setState({
            searchText: ''
        })
    }

    render() {
        return (
            <View style = {styles.searchView}>
                <TextInput 
                    style = {styles.searchInput}
                    returnKeyType = 'search'
                    placeholder = 'Search'
                    autoCorrect = {true}
                    underlineColorAndroid = 'transparent'
                    value = {this.state.searchText}
                    onChangeText = {(text) => this.set(text)}
                    onSubmitEditing = {(event) => Keyboard.dismiss()}
                />
                
                <TouchableOpacity onPress = {this.onClearText}>
                    <Image source = {require('../../assets/img/x_white.png')} style = {styles.cancelImg}/>
                </TouchableOpacity>      
            </View>
        )
    }
}



const mapStateToProps = state => ({

});

const mapDispatchToProps = dispatch => ({
    SearchResult: filteredData => dispatch({type: 'Nearby_Search_Result', value: filteredData}),
    SearchChatsResult: filteredData => dispatch({type: 'Chats_Search_Result', value: filteredData}),
    SearchChannelsResult : filteredData => dispatch({type: 'Channels_Search_Result', value: filteredData}),
})

export default connect(mapStateToProps, mapDispatchToProps)(SearchQBUserBox)

