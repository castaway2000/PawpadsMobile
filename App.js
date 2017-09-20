import React from 'react';
import { StyleSheet, Text, View, StatusBar } from 'react-native';
import { Provider } from 'react-redux'
import { Expo } from 'expo'
import { createStore, combineReducers } from 'redux'
import Login from './src/components/auth/Login'
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
    
    async componentWillMount() {
        Expo.Font.loadAsync({
            // 'Bellota_BoldItalic': require('./src/assets/fonts/Bellota_BoldItalic.otf'),
        });

        this.setState({ isReady: true })
    }

    render() {
        console.disableYellowBox = true;
        <StatusBar
            barStyle = "light-content"
            backgroundColor = '#24A2B1'
        />
        
        // if(!this.state.isReady){
        //     return <Expo.Font.AppLoading/>
        // }
        return (
            <Provider store = {store}>
                <PPNavigator />
            </Provider>
        );
    }
}

