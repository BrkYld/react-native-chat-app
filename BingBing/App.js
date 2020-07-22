
import Main from './components/Main';
import Login from './components/Login';
import Lobby from './components/Lobby';
import UserList from './components/UserList';
import ChatRoom from './components/ChatRoom';
import PublicRoom from './components/PublicRoom';
import { createAppContainer, StackActions, NavigationActions } from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack'
import SQLite from 'react-native-sqlite-storage';

//Uygulama her zaman buradan basliyor.
global.db = SQLite.openDatabase({name:'UserToken',createFromLocation : '~UserToken.db'}); //SqlLite Veritabanı olusturma
global.isLogin = false;
global.baseUrl = '192.168.1.20'; // Global degiskenlerin tanimlanmasi
global.socket = null ;
const AppNavigator = createStackNavigator({
  Main: {screen: Main}, 
  Login:{screen:Login},
  Lobby: {screen :Lobby},
  UserList: {screen:UserList},
  ChatRoom:{screen:ChatRoom},
  PublicRoom :{screen:PublicRoom}

}, {
  initialRouteName: 'Main', //Uygulama , direkt Main componentine yönlendirilir.
  headerMode : 'none'
});


export default createAppContainer(AppNavigator);
