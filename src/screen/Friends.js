//import libraries
import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, StatusBar, Platform, ScrollView } from 'react-native';
import Constant from '../common/Constant'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
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
	StyleProvider,
	getTheme,
	variables,
} from 'native-base'

import { FlatList } from "react-native";

class MyListItem extends React.PureComponent {

  _onPress = () => {
    this.props.onPressItem(this.props.index);
  };

  render() {
    const data = this.props.item;

    console.log("data:",data);

    return (
      <TouchableOpacity style = {styles.friendsListCell} key = {this.props.index}>
      <View style = {styles.menuIcon} >
      <Image source = {{
        uri: data.photo
      }}
      defaultSource = {require('../assets/img/user_placeholder.png')}
      style = {styles.menuIcon} />
      </View>
      <View style = {{flex: 1}}>
      <Text style = {styles.menuItem}>{data}</Text>
      </View>
      </TouchableOpacity>
    )
  }
}

// create a component
class Friends extends Component {

  constructor(props) {
      super(props)
      this.state = {
          friendList: ['Testuser1','Testuser2','Testuser3'],
          refreshing: false,
      }
  }

    _onback = () => {
        this.props.navigation.goBack()
    }

    _renderItem = ({ item, index }) => ( <MyListItem
        index = { index }
        item = { item }
        onPressItem = { this._onPressItem }/>
    );

    _keyExtractor = (item, index) => index;

    handleLoadMore = () => {
      if (!this.state.loading) {
        //this.loadDataFromFirebase(this.state.pagekey,this.state.pagetimestamp);
      }
    }

    onRefresh() {
      this.setState({refreshing: true});
      setTimeout(() => {
          this.setState({
              refreshing: false
          })

      }, 3000)
    }

    render() {
         <StatusBar
            barStyle = "light-content"
            backgroundColor = 'blue'/>
        return (
            <View style={styles.container}>
                <View style = {styles.statusbar}/>
                <View style = {styles.tabView}>
                    <TouchableOpacity style = {styles.backButton} onPress = {this._onback}>
                        <Image source = {require('../assets/img/back.png')} style = {{width: 18, height: 18}}/>
                    </TouchableOpacity>
                    <Text style = {styles.title}>Friends</Text>
                </View>

                <Content bounces={false} contentContainerStyle={{ flex: 1, backgroundColor: 'white', alignItems:'center' }}>

                <FlatList
                  data={this.state.friendList}
                  renderItem={this._renderItem}
                  keyExtractor={this._keyExtractor}
                  maxToRenderPerBatch={1}
                  removeClippedSubviews={false}
                  onRefresh={() => this.onRefresh()}
                  refreshing={this.state.refreshing}
                  onRefreshItems= {this.props.onRefreshItems}
                  onEndReached={this.handleLoadMore}
                  onEndReachedThreshold={0}
                  />

                </Content>
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
    friendsListCell: {
        width: Constant.WIDTH_SCREEN,
        height: 70,
        flexDirection:'row',
        padding: 10,
        justifyContent:'center'
    },
    menuIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#f1eff0',
    },
    menuItem:{
      color: 'black',
      opacity: 1,
      fontSize: 18,
      marginLeft: 15,
      flex: 1,

    },
});

//make this component available to the app
export default Friends;
