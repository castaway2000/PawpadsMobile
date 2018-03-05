//import libraries
import React, { Component } from 'react';
import { StyleSheet, StatusBar, Image, TouchableOpacity,AsyncStorage } from 'react-native';
import {
    Content,
	Text,
	List,
	ListItem,
	Icon,
	Container,
	Left,
	Right,
	Badge,
	Button,
	View,
	StyleProvider,
	getTheme,
	variables,
} from 'native-base'
import { Actions } from 'react-native-router-flux';
import Constant from '../../common/Constant'

import RNFirebase from 'react-native-firebase';
const firebase = RNFirebase.initializeApp({ debug: false, persistence: true })

import Drawer from '../../Drawer'

import {CachedImage} from 'react-native-img-cache';

const datas = [
	{
		name: "Friends",
		route: "Friends",
        icon: require('../../assets/img/two-men.png'),
	},
    {
		name: "Settings",
		route: "Settings",
        icon: require('../../assets/img/settings_icon.png'),
	},
    {
		name: "About",
		route: "About",
        icon: require('../../assets/img/about_icon.png'),
	},
    {
		name: "Logout",
		route: "Logout",
        icon: require('../../assets/img/logout_icon.png'),
	},
]
// create a component
class SideBar extends Component {
    constructor(props) {
		super(props);
		this.state = {
            name:'',
            blob_id:'',
            tableId:'',
            profileimage:'',
            coverPictureURL:'',
            fullname:'',
		};
	}

    componentWillMount() {
        this.loadUserData()

        const defaultGetStateForAction = Drawer.router.getStateForAction;

        Drawer.router.getStateForAction = (action, state) => {

            //use 'DrawerOpen' to capture drawer open event
            if (state && action.type === 'Navigation/NAVIGATE' && action.routeName === 'DrawerClose') {
                console.log('DrawerClose');
                //write the code you want to deal with 'DrawerClose' event
            } else if ( action.type === 'Navigation/NAVIGATE' && action.routeName === 'DrawerOpen') {
              console.log('DrawerOpen');
              this.loadUserData()
            }
            return defaultGetStateForAction(action, state);
        };

    }


    loadUserData(){

      AsyncStorage.getItem(Constant.USER_BLOBID).then((value1) => {
          this.setState({
              name: value1,
          })
      })

        AsyncStorage.getItem(Constant.USER_FULL_NAME).then((value2) => {
          this.setState({
              blob_id: value2,
          })
        })

        AsyncStorage.getItem(Constant.USER_TABEL_ID).then((value) => {
          this.setState({tableId: value })
          this.downloadProfileFirebase()
        })
    }

    downloadProfileFirebase() {

          if (this.state.tableId) {
            console.log("downloadLastUser......",this.state.tableId);
              firebase.database()
                  .ref('/users/' + this.state.tableId)
                  .once("value")
                  .then(snapshot => {

                    console.log("snapshot downloadLastUser......",snapshot.val());
                    if (snapshot.val()) {
                      var profile = snapshot.val();

                        if (profile) {

                          var fullname = ''
                          if (profile.full_name) {
                            fullname = profile.full_name
                          } else {
                            fullname = profile.login
                          }

                          this.setState({fullname: fullname,});

                          if (profile["content"]) {
                            for (let item in profile["content"]) {
                              let content = profile["content"][item]
                              let blobid =  content["id"]

                              if (blobid == profile["blob_id"]) {

                                firebase.storage().ref("content/" + profile["firid"] + "/" + profile["content"][item]["name"]).getDownloadURL().then((url) => {

                                  this.setState({profileimage: url,});

                                })
                              }

                              if(profile.custom_data) {
                                var json = JSON.parse(profile.custom_data)

                                if (blobid == json["backgroundId"]) {
                                  let path = "content/" + profile["firid"] + "/" + profile["content"][item]["name"]

                                  firebase.storage().ref(path).getDownloadURL().then((url) => {
                                    this.setState({coverPictureURL: url,});
                                  })
                                }
                              }
                            }
                          }
                        }
                      }
                    })
                  }
                }

    _onEdit = () => {
        this.props.navigation.navigate('ProfileEdit')
    }

    render() {
        return (
            <Container>
                <Content bounces={false} style={{ flex: 1, backgroundColor: 'white'}}>
                    <Content>
                        <View style = {styles.drawer}>

                            <CachedImage source = {{
                                uri: this.state.coverPictureURL,
                                }}
                                defaultSource = {require('../../assets/img/app_bar_bg.png')}
                                style = {styles.drawerCover} />


                            <TouchableOpacity onPress={() => this.props.navigation.navigate('UserProfile')}>
                                <CachedImage source = {{
                                    uri: this.state.profileimage,
                                    }}
                                    defaultSource = {require('../../assets/img/user_placeholder.png')}
                                    style = {styles.userPhoto} />
                            </TouchableOpacity>

                            <Text style = {styles.name}>{this.state.fullname}</Text>
                            <TouchableOpacity style = {styles.editBtn} onPress = {this._onEdit}>
                                <Text style = {styles.edit}>Edit</Text>
                            </TouchableOpacity>
                        </View>
                    </Content>
                    <Content>
                        <List
                            style = {{marginTop:15, paddingBottom: 100, backgroundColor:'white', height: 400}}
                            dataArray={datas}
                            renderRow={data =>
                                <ListItem button noBorder onPress={() => this.props.navigation.navigate(data.route)} style = {{height:50, padding:10}}>
                                    <Image source = {data.icon} style = {styles.menuIcon}/>
                                    <Text style = {styles.menuItem}>{data.name}</Text>
                                </ListItem>
                            }
                        >
                        </List>
                    </Content>
                </Content>
            </Container>
        );
    }
}

// define your styles
const styles = StyleSheet.create({
    sidebar: {
        paddingTop: 30,
        flex: 1,
        backgroundColor: '#0074aa',
    },
    title:{
        color: 'red',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 15,
    },
    drawer:{
        flex: 1,
        height: 150,
        padding: 20,
        justifyContent: 'center',
        alignItems: "stretch",

    },
    drawerCover: {
        height: 150,
        position: 'absolute',
        top: 0,
        left: 0,
        resizeMode: 'cover',
        left: 0,
        width: 400,
    },
    line: {
        height: 1,
        width: 400,
        backgroundColor:'white',
        position: 'absolute',
        top: 79,
        left: 0,
        opacity:0.3,
    },
    menuItem:{
        color: 'black',
        opacity: 1,
        fontSize: 15,
        marginLeft: 15,
    },
    menuIcon: {
        width: 18,
        height: 18,
    },
    userPhoto: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginTop: 20,
    },
    name: {
        color: 'white',
        fontSize: 18,
        marginTop: 10
    },
    edit: {
        color: 'white'
    },
    editBtn: {
        position: 'absolute',
        top: 40,
        right: 20,
    },
});

//make this component available to the app
export default SideBar;
