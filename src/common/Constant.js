import {Dimensions, Platform} from 'react-native'


module.exports = {
    APP_COLOR: '#24A2B1',
    WIDTH_SCREEN : Dimensions.get('window').width,
    HEIGHT_SCREEN : Dimensions.get('window').height,
    HEIGHT_KEYBOARD_IOS : 216,

    QB_APPID : "35252",
    QB_AUTH_KEY : "gb4f7kN3FLgap9A",
    QB_AUTH_SECRET : "sszVLheuYags2ZQ",
    QB_ACCOUNT_KEY : "S6mqpsBsKxfbSqZxGY4X",

    FIREBASE_PASS_SECRET : "S6mqpsBsKxfbSqZxGY4X",

    TWITTER_COMSUMER_KEY: 'd0OQD2OeO77QLYMPROTteJRMi',
    TWITTER_CONSUMER_SECRET: '8ZdXAvVlHzJWjGwZSeQm9MaLtJ1Ra9kx6eg5nqCLFh3NBfMzkf',

    FIREBASE_API_KEY: 'AIzaSyCD9aCIS0hDbcH3zKBNc3C5vv6L0ai7Stg',
    FIREBASE_AUTH_DOMAIN: 'pawpads-rn.firebaseapp.com',
    FIREBASE_DATABASE_URL: 'https://pawpads-rn.firebaseio.com',
    FIREBASE_STORAGE_BUCKET: 'pawpads-rn.appspot.com',

    SESSION_URL : 'https://api.quickblox.com/session.json',
    LOGIN_URL : 'https://api.quickblox.com/login.json',
    REGISTER_URL : 'https://api.quickblox.com/users.json',
    RETRIEVE_DIALOGS_URL: 'https://api.quickblox.com/chat/Dialog.json',
    BLOB_URL: 'https://api.quickblox.com/blobs/',
    USERS_URL: 'https://api.quickblox.com/users/',
    GROUPCHAT_MESSAGE_URL: 'https://api.quickblox.com/chat/Message.json',
    NEARBY_FIND_USER_URL : 'https://api.quickblox.com/geodata/find.json',
    CREATE_FILE_URL : 'https://api.quickblox.com/blobs.json',
    GET_USER_LOCATION : 'https://api.quickblox.com/geodata/find.json', //?user.id=20852310
    GET_BLOCKLIST : 'https://api.quickblox.com/data/BlockList.json',
    GET_FRIENDSLIST : 'https://api.quickblox.com/data/FriendsList.json',

    QB_USERID: 'qb_userid',
    QB_OWNER_ID: 'qb_owner_id',
    QB_USERNAME: 'qb_username',
    QB_TOKEN:  'qb_token',
    QB_USER_TOKEN:  'qb_user_token',

    USER_TABEL_ID: 'user_tabel_id',
    USER_LOGIN: 'user_login',
    USER_PASSWORD: 'user_pass',
    USER_FULL_NAME: 'user_full_name',
    USER_EMAIL: 'user_email',
    USER_BLOBID: 'user_blob_id',

    SETTINGS_DISTANCE_UNIT: 'settings_distance_unit',
    SETTINGS_RANGE: 'settings_range',
    SETTINGS_GPS_ACCURACY: 'settings_gps_accuracy',
    SETTINGS_TOGGLE_PUSH_NOTIFICATIONS: 'settings_toggle_push_notification',
    SETTINGS_TOGGLE_MESSAGING_POPUPS: 'settings_toggle_messaging_popups',
}
