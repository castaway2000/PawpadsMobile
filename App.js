import React from 'react';
import { StyleSheet, Text, View, StatusBar } from 'react-native';
import { Provider } from 'react-redux'
import { createStore, combineReducers } from 'redux'
import PPNavigator from './src/PPNavigator'
import userReducers from './src/reducers/'

let store = createStore(userReducers)

export default class App extends React.Component {
    constructor(){
        super()
        this.state = {
            isReady: false
        }
    }

    render() {
        console.disableYellowBox = true;
        <StatusBar
            barStyle = "light-content"
            backgroundColor = '#24A2B1'
        />

        return (
            <Provider store = {store}>
                <PPNavigator />
            </Provider>
        );
    }
}

