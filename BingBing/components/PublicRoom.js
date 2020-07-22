import React from 'react';
import ReactNative, { BackHandler, Text, SafeAreaView, FlatList, Alert, DeviceEventEmitter } from 'react-native';
import axios from "axios";
import io, { Socket } from "socket.io-client";
import NavBar, { NavButton, NavButtonText, NavTitle } from 'react-native-nav';
import { GiftedChat } from 'react-native-gifted-chat'
class PublicRoom extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            Messages: [],
            userID: '',
            userName: '',
            RoomName: ''
        }
        this.goBack = this.goBack.bind(this);
        this.send = this.send.bind(this);
    }
    componentDidMount() {

        if (this.props.navigation.getParam('UserID') != null) {

            axios({  //Odadaki mesajlari veritabanından ceker.
                method: 'post',
                url: 'http://' + baseUrl + ':4000/api/ChatRooms/GetForPublic',
                data: { RoomName: this.props.navigation.getParam('RoomName') }
            }).then(_result => {

                this.setState({ userName: this.props.navigation.getParam('UserName'), userID: this.props.navigation.getParam('UserID'), RoomName: this.props.navigation.getParam('RoomName'), Messages: _result.data[0].Messages.reverse() });

            });

        }
        socket.emit('JoinRoom', { roomName: this.props.navigation.getParam('RoomName') }); //Odaya katiliyor.
        socket.on('RoomChat', (data) => {
            this.setState({ Messages: GiftedChat.append(this.state.Messages, data.Messages) });
        });

        BackHandler.addEventListener("hardwareBackPress", this.goBack);
    }
    componentWillUnmount() {
        socket.emit('LeaveRoom', { roomName: this.props.navigation.getParam('RoomName') }); //odadan ayriliyor.
        socket.off('RoomChat');
        BackHandler.removeEventListener("hardwareBackPress", this.goBack);
    }
    goBack() {
        this.props.navigation.pop();
        this.props.navigation.navigate('Lobby', { UserID: this.state.userID, UserName: this.state.userName });
        return true;
    }
    send(messages) {
        socket.emit('RoomChat', { roomName: this.state.RoomName, messages: messages });
        this.setState({ Messages: GiftedChat.append(this.state.Messages, messages) });
    }
    render() {

        return (
            <>
                <NavBar>
                    <NavTitle>
                        {this.state.RoomName}
                    </NavTitle>
                </NavBar>
                <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
                    <GiftedChat
                        messages={this.state.Messages}
                        onPressAvatar={(user) => Alert.alert('Sended By', user.name)}
                        user={{
                            _id: this.state.userID,
                            name: this.state.userName
                        }}
                        onSend={messages => this.send(messages)}
                    />
                </SafeAreaView>
            </>
        );
    }

}

export default PublicRoom;