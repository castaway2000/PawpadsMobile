//import liraries
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux'
import { 
    addNavigationHelpers, 
    StackNavigator } from 'react-navigation'
var { Router, Scene } = require('react-native-router-flux');
import { Root } from 'native-base'    

import Login from './components/auth/Login'
import Register from './components/auth/Register'
import Passwordrecovery from './components/auth/Passwordrecovery'
import Drawer from './Drawer'

const AppNavigators = StackNavigator(
    {   
        Login: { screen: Login },
        Drawer: { screen: Drawer},
        Register: { screen: Register},
        Passwordrecovery: { screen: Passwordrecovery },
    },
    {
        initialRouteName: 'Login',
        headerMode: 'none'
    }
);



export default () => 
    <Root>
        <AppNavigators />
    </Root>
 