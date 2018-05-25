//import libraries
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux'
import {
    DrawerNavigator,
    StackNavigator } from 'react-navigation'
var { Router, Scene } = require('react-native-router-flux');

import SideBar from './components/sidebar/SideBar'
import Dashboard from './screen/Dashboard'
import Friends from './screen/Friends'
import Settings from './screen/Settings'
import ProfileEdit from './screen/ProfileEdit'
import About from './screen/About'
import UserProfile from './screen/UserProfile'
import Login from './components/auth/Login'

const Drawer = DrawerNavigator(
    {
        Dashboard: { screen: Dashboard },
        Friends: { screen: Friends },
        Settings: { screen: Settings },
        ProfileEdit: { screen: ProfileEdit },
        About: { screen: About },
        UserProfile: { screen: UserProfile },
        Logout: { screen: Login },
    },
    {
        initialRouterName: 'Dashboard',
        contentOptions: {
            activeTintColor: 'red'
        },
        contentComponent: props => <SideBar {...props}/>
    }
);

// const defaultGetStateForAction = Drawer.router.getStateForAction;
//
// Drawer.router.getStateForAction = (action, state) => {
//
//     //use 'DrawerOpen' to capture drawer open event
//     if (state && action.type === 'Navigation/NAVIGATE' && action.routeName === 'DrawerClose') {
//         console.log('DrawerClose');
//         //write the code you want to deal with 'DrawerClose' event
//     }
//     return defaultGetStateForAction(action, state);
// };

export default Drawer;
