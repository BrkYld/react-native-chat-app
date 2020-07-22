import React from 'react';
import {
    Text,
    View,
    SafeAreaView,
    TouchableOpacity,
    Dimensions,
    BackHandler,
    Alert
} from 'react-native';
import { Avatar } from 'react-native-elements';
import NavBar, { NavTitle } from 'react-native-nav';
import axios from "../node_modules/axios";
import { FlatList } from 'react-native-gesture-handler';
import Dialog from "react-native-dialog";
var maxWidth = Dimensions.get('window').width;
var maxHeight = Dimensions.get('window').height;

class UserList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            userName: '',
            userID: '',
            publicRoomDialog: false,
            newRoomName: '',
            lastTimerId: 0,
            requestCount: 0,
            isSpam: false
        }
        this.renderItem = this.renderItem.bind(this);
        this.goBack = this.goBack.bind(this);
        this.chat = this.chat.bind(this);
        this.createPublicRoom = this.createPublicRoom.bind(this);
    }
    componentDidMount() {
        socket.off('ChatRequest');
        socket.on('ChatRequest', (data) => { //Chat request islemleri 
            Alert.alert(
                data.ad,
                'Wants to chat with you !',
                [
                    { text: 'Accept', onPress: () => socket.emit('Accept', { targetID: data._id, userName: this.state.userName }) },
                    {
                        text: 'Decline',
                        style: 'cancel'
                    }
                ],
                { cancelable: true }
            );

        });
        axios({ //Aktif kullanicilari listeler
            method: 'post',
            url: 'http://' + baseUrl + ':4000/api/ActiveUsers/Get',
            data: {}
        }).then(result => {
            this.setState({ userName: this.props.navigation.getParam('UserName'), userID: this.props.navigation.getParam('UserID'), data: result.data });
        });
        socket.off('Update');
        socket.on('Update', () => { //Yeni bir kullanici giris yaptıginda Componenti yeniden render eder.
            axios({
                method: 'post',
                url: 'http://' + baseUrl + ':4000/api/ActiveUsers/Get',
                data: {}
            }).then(result => {
                this.setState({ userName: this.props.navigation.getParam('UserName'), userID: this.props.navigation.getParam('UserID'), data: result.data });
            });
        });
        socket.off('isNewChatRoom');
        socket.on('isNewChatRoom', (data) => { 
            if (data.is) { //Kullanici , yeni bir oda acmak istediginde o oda daha onceden yoksa serverdan bu mesaj gelir.
                Alert.alert(
                    'Sounds Good !',
                    'Have been sended a chat request :)',
                    [
                        { text: 'OK' }

                    ],
                    { cancelable: true }
                );
            }
            else { //varsa
                this.props.navigation.pop();
                data.ChatRoom.Messages.reverse();
                this.props.navigation.navigate('ChatRoom', { ChatRoom: data.ChatRoom, UserID: this.state.userID }); //chat odasina yonlendirir.
            }
        });

        BackHandler.addEventListener("hardwareBackPress", this.goBack);
    }
    componentWillUnmount() {
        socket.off('Update');
        socket.off('ChatRequest');
        clearTimeout(this.state.spamTimerId);
        clearTimeout(this.state.lastTimerId);
        BackHandler.removeEventListener("hardwareBackPress", this.goBack);
    }
    goBack() {
        this.props.navigation.pop();
        this.props.navigation.navigate('Lobby', { UserID: this.state.userID, UserName: this.state.userName });
        return true;
    }
    chat(item) {

        if (this.state.isSpam == false) {

            if (this.state.requestCount > 3) {
                this.setState({ isSpam: true }); //Karsidaki kullanciya sürekli olarak istek atmayi engellemek icin. Eger Gonderen kullanici spama dustuyse istegi attigini zanneder fakat o istek servera asla iletilmez.
            }
            var id = setTimeout(() => { this.setState({ requestCount: 0 }) }, 1500);
            clearTimeout(this.state.lastTimerId);
            this.setState({ lastTimerId: id, requestCount: this.state.requestCount + 1 });
            socket.emit('ChatRequest', { targetID: item._id }); //chat istegi atar
        }
        else {

            Alert.alert(
                'Sounds Good !',
                'Have been sended a chat request :)',
                [
                    { text: 'OK' }

                ],
                { cancelable: true }
            );
        }

    }
    createPublicRoom() {
        this.setState({ publicRoomDialog: true }); //Public oda acmak icin
    }
    renderItem({ item }) {
        var color = '#E5E7E9';

        if (item._id == this.state.userID) {
            return null;
        }
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
                        title="..."
                        rounded
                        overlayContainerStyle={{ backgroundColor: color }}
                        titleStyle={{ fontSize: 20, color: 'black' }}
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
                            alignSelf: 'center',
                            backgroundColor: 'white'
                        }}>{item.ad}</Text>

                        <Text style={{
                            textAlign: 'left',
                            color: '#7B8BFF',
                            fontSize: 15,
                            fontStyle: 'italic',
                            flex: 1,
                            alignSelf: 'center',
                            backgroundColor: 'white'
                        }}>
                            Tap to send message...
                        </Text>
                    </View>
                </View>
            </TouchableOpacity >


        );
    }

    render() {

        return (
            <>
                <NavBar>
                    <NavTitle>
                        Active Users
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
                        data={this.state.data}
                        renderItem={this.renderItem}
                        keyExtractor={(item) => item._id}
                    >
                    </FlatList>
                    <TouchableOpacity onPress={this.createPublicRoom} style={{
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
                            fontSize: 25,
                            alignSelf: 'center',
                        }}>
                            OR
                            </Text>
                    </TouchableOpacity>
                </SafeAreaView>
                <Dialog.Container visible={this.state.publicRoomDialog}>
                    <Dialog.Title>Create a Public Room</Dialog.Title>
                    <Dialog.Description>
                        What will we talking about ?
                    </Dialog.Description>
                    <Dialog.Input placeholder='Room Name' style={{ borderWidth: 0.3, borderRadius: 50 }} onChangeText={(text) => { this.setState({ newRoomName: text }) }}
                        value={this.state.newRoomName}
                    >
                    </Dialog.Input>
                    <Dialog.Button label="OK !" onPress={() => {
                        if (this.state.newRoomName != '') {
                            socket.emit('OpenPublicRoom', { roomName: this.state.newRoomName });
                            this.props.navigation.pop();
                            this.props.navigation.navigate('Lobby', { UserID: this.state.userID, UserName: this.state.userName });
                            this.setState({ publicRoomDialog: false });
                        }
                        else {
                            Alert.alert('Upps, Come on !', "Aren't we gonna talk anything ?");
                            this.setState({ publicRoomDialog: false });
                        }
                    }} />
                    <Dialog.Button label="Cancel" onPress={() => { this.setState({ publicRoomDialog: false, newRoomName: '' }) }} />
                </Dialog.Container>
            </>
        );
    }

}

export default UserList;