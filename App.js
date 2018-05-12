import React from 'react';
import { StyleSheet, Text, View, StatusBar, AsyncStorage } from 'react-native';
import { Provider } from 'react-redux'
import { createStore, combineReducers } from 'redux'
import PPNavigator from './src/PPNavigator'
import PPNavigatorHome from './src/PPNavigatorHome'
import userReducers from './src/reducers/'
import Constant from './src/common/Constant'

let store = createStore(userReducers)

export default class App extends React.Component {
    constructor(){
        super()
        this.state = {
            isReady: false,
            loggedInStatus:'loading'
        }
    }

    componentDidMount() {
      AsyncStorage.getItem(Constant.QB_USERID).then((value) => {
        if (value) {
          this.setState({loggedInStatus:'loggedIn' })
        } else {
          this.setState({loggedInStatus:'loggedOut' })
        }
      })
    }

    render() {
        console.disableYellowBox = true;
        <StatusBar
            barStyle = "light-content"
            backgroundColor = '#24A2B1'
        />

        if (this.state.loggedInStatus === 'loggedIn') {
           return (
             <Provider store = {store}>
                 <PPNavigatorHome />
             </Provider>
           )
         }
         else if (this.state.loggedInStatus === 'loggedOut') {
           return (
             <Provider store = {store}>
                 <PPNavigator />
             </Provider>
           )         }

        return (
          <View><Text>Loading...</Text></View>
        );
    }
}
