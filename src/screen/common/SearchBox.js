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

var wordList = [
    'Albania', 'Argentina','Brazil','Beligium','Cananda','China','Denmark','Egypt','France','Germany','Greece','Italy','Japan','Nethelands','Norway','Spain','Sweden','Ukraine','United State','Uruguay',
]
var filteredData = []

// define your styles
const styles = StyleSheet.create({

    searchView: {
        flexDirection: 'row',
        height: 40,
        width: Constant.WIDTH_SCREEN,
        paddingLeft: 16,
        paddingRight: 16,
        alignItems: 'center',
        justifyContent:'space-around',
        borderBottomWidth: 1,
        borderColor:'#F2F2F9'
    },
    searchImg: {
        width: 16,
        height:  16,
        resizeMode: 'contain'
    },
    micImg: {
        width: 20,
        height:  20,
        resizeMode: 'contain'
    },
    searchInput: {
        flex: 1,
        height: 40,
        marginLeft: 10,
        paddingVertical: 0,
    }
});

class SearchBox extends Component {

    constructor(props){
        super(props)
        this.state = {
            searchText:'',
        }
        // this.set = this.set.bind(this);
    }
    componentWillMount() {
        filteredData = []
    }

    set(text){
        this.setState({
            searchText: text,
        });
        filteredData = this.filterNotes(text, wordList)

        var { SearchResult } = this.props;
        SearchResult(filteredData);
    }
    filterNotes(text, wordList){
        var query = text.toLowerCase();
        return wordList.filter(function(el){
            return el.toLowerCase().indexOf(query) > -1
        })
    }

    render() {
        return (
            <View style = {styles.searchView}>
                <Image source = {require('../../assets/img/search_grey.png')} style = {styles.searchImg}/>
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
                <Image source = {require('../../assets/img/mic_grey.png')} style = {styles.micImg}/>
                
            </View>
        )
    }
}



const mapStateToProps = state => ({

});

const mapDispatchToProps = dispatch => ({
    SearchResult: (filteredData) => dispatch({type: 'Search_Result', value: filteredData})
})

export default connect(mapStateToProps, mapDispatchToProps)(SearchBox)

// export default SearchBox;
