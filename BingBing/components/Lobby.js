import React, { Component } from 'react';
import {
    Text,
    View,
    SafeAreaView,
    TouchableOpacity,
    Dimensions,
    BackHandler,
    YellowBox,
    Alert
} from 'react-native';
import { Avatar} from 'react-native-elements';
import NavBar, { NavTitle } from 'react-native-nav';
import axios from "../node_modules/axios";
import { FlatList } from 'react-native-gesture-handler';
var maxWidth = Dimensions.get('window').width;
var maxHeight = Dimensions.get('window').height;
const colors = [
    'aqua',
    'bisque',
    'blue',
    'blueviolet',
    'brown',
    'coral',
    'darkgoldenrod',
    'fuchsia',
    'orange',
    'pink'
];
YellowBox.ignoreWarnings([
    'Unrecognized WebSocket connection option(s) `agent`, `perMessageDeflate`, `pfx`, `key`, `passphrase`, `cert`, `ca`, `ciphers`, `rejectUnauthorized`. Did you mean to put these under `headers`?'
]);
class Lobby extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userName: this.props.navigation.getParam('userName'),
            userID: null,
            ChatRooms: []
        }
        this.goBack = this.goBack.bind(this);
        this.renderItem = this.renderItem.bind(this);
        this.getRandomColor = this.getRandomColor.bind(this);
        this.onPressAddButton = this.onPressAddButton.bind(this);
        this.chat = this.chat.bind(this);
    }
    goBack() { //Telefonda back buttonuna basildiginda 
        socket.off('ChatRequest');
        this.props.navigation.pop();
        BackHandler.exitApp();
        return true;
    }
    getRandomColor() {
        var color = colors[Math.floor(Math.random() * colors.length)];
        return color;
    }
    componentDidMount() {
        if (this.props.navigation.getParam('UserID') != null) { //Kullaniciya ait chat room bilgilerini getir.
            axios({
                method: 'post',
                url: 'http://' + baseUrl + ':4000/api/Test/Get',
                data: { _id: this.props.navigation.getParam('UserID') }
            }).then(result => {
                axios({
                    method: 'post',
                    url: 'http://' + baseUrl + ':4000/api/ChatRooms/GetForLobby',
                    data: { _id: this.props.navigation.getParam('UserID') }
                }).then(_result => {

                    for (var i = 0; i < _result.data.length; i++) {

                        var withUser = '';
                        if (_result.data[i].Users[0] != 'Public') {
                            if (_result.data[i].between[0] == result.data[0].ad) {
                                withUser = _result.data[i].between[1];
                            }
                            else {
                                withUser = _result.data[i].between[0];
                            }
                        }
                        else {
                            withUser = _result.data[i].roomName;
                        }
                        _result.data[i].withUser = withUser;
                    }
                    this.setState({ userName: result.data[0].ad, userID: this.props.navigation.getParam('UserID'), ChatRooms: _result.data });
                })
            })
        }
        socket.off('LobbyUpdate'); //Her ihtimale karsi onceden acik olan dinlemeyi kapatir.
        socket.on('LobbyUpdate', () => { //Yeni bir Mesaj geldiyse lobby de gozukmesi icin burayi dinler.
            axios({
                method: 'post',
                url: 'http://' + baseUrl + ':4000/api/Test/Get',
                data: { _id: this.props.navigation.getParam('UserID') }
            }).then(result => {
                axios({
                    method: 'post',
                    url: 'http://' + baseUrl + ':4000/api/ChatRooms/GetForLobby',
                    data: { _id: this.props.navigation.getParam('UserID') }
                }).then(_result => {

                    for (var i = 0; i < _result.data.length; i++) {

                        var withUser = '';
                        if (_result.data[i].Users[0] != 'Public') {
                            if (_result.data[i].between[0] == result.data[0].ad) {
                                withUser = _result.data[i].between[1];
                            }
                            else {
                                withUser = _result.data[i].between[0];
                            }
                        }
                        else {
                            withUser = _result.data[i].roomName;
                        }
                        _result.data[i].withUser = withUser;
                    }
                    this.setState({ userName: result.data[0].ad, userID: this.props.navigation.getParam('UserID'), ChatRooms: _result.data });
                })
            })
        });
        socket.off('ChatRequest'); //Her ihtimale karsi onceden acik olan dinlemeyi kapatir.
        socket.on('ChatRequest', (data) => { //Mesajlasma istegi icin burayi dinler
            Alert.alert(
                data.ad,
                'Wants to chat with you !',
                [
                    {
                        text: 'Accept', onPress: () => {
                            socket.emit('Accept', { targetID: data._id, userName: this.state.userName });//Istek kabul edildiyse bu mesaji gonder.
                            axios({ //Lobby yi tekrardan yenile.
                                method: 'post',
                                url: 'http://' + baseUrl + ':4000/api/Test/Get',
                                data: { _id: this.props.navigation.getParam('UserID') }
                            }).then(result => {
                                axios({
                                    method: 'post',
                                    url: 'http://' + baseUrl + ':4000/api/ChatRooms/GetForLobby',
                                    data: { _id: this.props.navigation.getParam('UserID') }
                                }).then(_result => {

                                    for (var i = 0; i < _result.data.length; i++) {

                                        var withUser = '';
                                        if (_result.data[i].Users[0] != 'Public') {
                                            if (_result.data[i].between[0] == result.data[0].ad) {
                                                withUser = _result.data[i].between[1];
                                            }
                                            else {
                                                withUser = _result.data[i].between[0];
                                            }
                                        }
                                        else {
                                            withUser = _result.data[i].roomName;
                                        }
                                        _result.data[i].withUser = withUser;
                                    }
                                    this.setState({ userName: result.data[0].ad, userID: this.props.navigation.getParam('UserID'), ChatRooms: _result.data });
                                })
                            })

                        }
                    },
                    {
                        text: 'Decline',
                        style: 'cancel'
                    }
                ],
                { cancelable: true }
            );

        });
        BackHandler.addEventListener("hardwareBackPress", this.goBack)
    }
    componentWillUnmount() {
        socket.off('LobbyUpdate');
        BackHandler.removeEventListener("hardwareBackPress", this.goBack);
    }
    renderItem({ item }) {
        var color = this.getRandomColor();
        if (item.Users[0] != 'Public') {

            return (
                <TouchableOpacity
                    style={{
                        width: maxWidth,
                        height: 85,
                        justifyContent: 'flex-start',
                        backgroundColor: 'white',
                        borderBottomWidth: 1,
                        borderBottomColor: '#EAECEE',
                        flex: 1,
                        flexDirection: 'row'
                    }}
                    onPress={() => { this.chat(item) }}
                >
                    <View style={{ alignSelf: 'center', backgroundColor: 'white', flex: 0, justifyContent: 'center', alignItems: 'center' }}>
                        <Avatar
                            size="medium"
                            title={item.withUser[0]}//item.name
                            rounded
                            overlayContainerStyle={{ backgroundColor: color }}
                            titleStyle={{ fontSize: 20 }}
                        />

                    </View>

                    <View style={{ backgroundColor: 'white', flex: 1, flexDirection: 'row' }}>
                        <View style={{ backgroundColor: 'white', flex: 0.05 }}>
                        </View>
                        <View style={{ backgroundColor: 'white', flex: 1, flexDirection: 'column' }}>
                            <Text style={{
                                textAlign: 'left',
                                color: 'black',
                                fontSize: 20,
                                flex: 1,
                                alignSelf: 'flex-start',
                                // marginTop:15,
                                backgroundColor: 'white'
                            }}>{item.withUser}</Text>

                            <Text style={{
                                textAlign: 'left',
                                color: '#7B8BFF',
                                fontSize: 15,
                                flex: 1,
                                alignSelf: 'flex-start',
                                backgroundColor: 'white'
                            }}>{item.lastSender} :
                               <Text style={{
                                    textAlign: 'left',
                                    color: 'gray',
                                    fontSize: 15,
                                    fontStyle: 'italic',
                                    flex: 1,
                                    alignSelf: 'flex-start',
                                    backgroundColor: 'white',

                                }}
                                >
                                    {" "}{item.lastMessage}
                                </Text>
                            </Text>
                        </View>
                    </View>

                </TouchableOpacity >

            );
        }
        else {
            return (
                <TouchableOpacity
                    style={{
                        width: maxWidth,
                        height: 85,
                        justifyContent: 'flex-start',
                        backgroundColor: 'white',
                        borderBottomWidth: 1,
                        borderBottomColor: '#EAECEE',
                        flex: 1,
                        flexDirection: 'row'
                    }}
                    onPress={() => { this.chat(item) }}
                >
                    <View style={{ alignSelf: 'center', backgroundColor: 'white', flex: 0, justifyContent: 'center', alignItems: 'center' }}>
                        <Avatar
                            size="medium"
                            title='P'//item.name
                            rounded
                            overlayContainerStyle={{ backgroundColor: 'white', borderWidth: 0.5 }}
                            titleStyle={{ fontSize: 20, color: 'black', fontWeight: 'bold' }}
                        />

                    </View>

                    <View style={{ backgroundColor: 'white', flex: 1, flexDirection: 'row' }}>
                        <View style={{ backgroundColor: 'white', flex: 0.05 }}>
                        </View>
                        <View style={{ backgroundColor: 'white', flex: 1, flexDirection: 'column' }}>
                            <Text style={{
                                textAlign: 'left',
                                color: 'black',
                                fontSize: 20,
                                flex: 1,
                                alignSelf: 'flex-start',
                                // marginTop:15,
                                backgroundColor: 'white'
                            }}>{item.withUser}</Text>

                            <Text style={{
                                textAlign: 'left',
                                color: '#7B8BFF',
                                fontSize: 15,
                                flex: 1,
                                alignSelf: 'flex-start',
                                backgroundColor: 'white'
                            }}>
                                <Text style={{
                                    textAlign: 'left',
                                    color: 'gray',
                                    fontSize: 15,
                                    fontStyle: 'italic',
                                    flex: 1,
                                    alignSelf: 'flex-start',
                                    backgroundColor: 'white',

                                }}
                                >
                                    PUBLİC ROOM
                                </Text>
                            </Text>
                        </View>
                    </View>

                </TouchableOpacity >

            );
        }
    }
    onPressAddButton() {
        this.props.navigation.pop();
        this.props.navigation.navigate('UserList', { UserID: this.state.userID, UserName: this.state.userName });
    }
    chat(item) {
        if (item.Users[0] != 'Public') {
            axios({
                method: 'post',
                url: 'http://' + baseUrl + ':4000/api/ChatRooms/Get',
                data: { _id: item._id }
            }).then(_result => {
                this.props.navigation.pop();
                _result.data[0].Messages.reverse();
                this.props.navigation.navigate('ChatRoom', { ChatRoom: _result.data[0], UserID: this.state.userID });
            });
        }
        else {
            this.props.navigation.pop();
            this.props.navigation.navigate('PublicRoom', { RoomName: item.withUser, UserID: this.state.userID, UserName: this.state.userName });
        }
    }
    render() {
        return (
            <>
                <NavBar>
                    <NavTitle>
                        {this.state.userName}
                    </NavTitle>
                </NavBar>
                <SafeAreaView style={{
                    flex: 1,
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    backgroundColor: 'white'
                }}>
                    <FlatList
                        data={this.state.ChatRooms}
                        renderItem={this.renderItem}
                        keyExtractor={(item) => item._id}
                    >
                    </FlatList>
                    <TouchableOpacity onPress={this.onPressAddButton} style={{
                        alignSelf: 'flex-end',
                        height: 60,
                        width: 60,
                        right: 2 * maxHeight / 100,
                        bottom: 5 * maxWidth / 100,
                        backgroundColor: '#4DA6FF',
                        elevation: 8,
                        borderRadius: 400,
                        justifyContent: 'center',
                        alignItems: 'center',
                        position: 'absolute'

                    }}>
                        <Text style={{
                            color: 'white',
                            fontSize: 40,
                            alignSelf: 'center',
                        }}>
                            +
                            </Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </>
        );
    }
}





export default Lobby;