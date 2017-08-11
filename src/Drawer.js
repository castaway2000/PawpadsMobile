//import liraries
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux'
import { 
    DrawerNavigator, 
    StackNavigator } from 'react-navigation'
var { Router, Scene } = require('react-native-router-flux');

import SideBar from './components/sidebar/SideBar'
import Dashboard from './screen/Dashboard'
import Friends from './screen/Friends'

const Drawer = DrawerNavigator(
    {   
        Dashboard: { screen: Dashboard },
        Friends: { screen: Friends },
    //     Settings: { screen: Settings },
    //     About: { screen: About },
    //     Logout: { screen: Logout },
    },
    {
        initialRouterName: 'Dashboard',
        contentOptions: {
            activeTintColor: 'red'
        },
        contentComponent: props => <SideBar {...props}/>
    }
);

export default Drawer;