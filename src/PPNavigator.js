//import libraries
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux'
import { 
    addNavigationHelpers, 
    StackNavigator } from 'react-navigation'
var { Router, Scene } = require('react-native-router-flux');
import { Root } from 'native-base'
import Drawer from './Drawer'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import Passwordrecovery from './components/auth/Passwordrecovery'
import Dashboard from './screen/Dashboard'
import Profile from './screen/Profile'
import Chat from './screen/Chat'
import ChatGroup from './screen/ChatGroup'
import ChatGroupEdit from './screen/ChatGroupEdit'
import CreateGroupChat from './screen/CreateGroupChat'
import Search from './screen/Search'

const AppNavigators = StackNavigator(
    {
        Drawer: { screen: Drawer },
        Dashboard: { screen: Dashboard },
    },
    {
        initialRouteName: 'Drawer',
        headerMode: 'none'
    }
);

const LoginStack = StackNavigator(
    {   
        Login: { screen: Login },
        Register: { screen: Register},
        Passwordrecovery: { screen: Passwordrecovery },
        Drawer: { screen: Drawer },
        Profile: { screen: Profile },
        Chat: { screen: Chat },
        ChatGroup: { screen: ChatGroup },
        ChatGroupEdit: { screen: ChatGroupEdit },
        CreateGroupChat: { screen: CreateGroupChat },
        Search: { screen: Search },
    },
    {
        initialRouteName: 'Login',
        headerMode: 'none'
    },
)


export default () => 
    <Root>
        <LoginStack />
    </Root>
 