import React from 'react';
import ReactNative, { BackHandler, Text, SafeAreaView,  Alert} from 'react-native';
import axios from "../node_modules/axios";
import NavBar, {NavTitle } from 'react-native-nav';
import { GiftedChat } from 'react-native-gifted-chat'
class ChatRoom extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            Users: [],
            Messages: [],
            userID: '',
            userName: '',
            senderName: '',
            targetID: '',
            isTyping: false,
            lastTimerId: 0
        }
        this.goBack = this.goBack.bind(this);
        this.send = this.send.bind(this);
        this.getNavTitle = this.getNavTitle.bind(this);
    }
    componentDidMount() {
        var ChatRoom = this.props.navigation.getParam('ChatRoom');  //Odadaki mesajlari alir.

        if (this.props.navigation.getParam('UserID') != null) {
            axios({
                method: 'post',
                url: 'http://' + baseUrl + ':4000/api/Test/Get',
                data: { _id: this.props.navigation.getParam('UserID') }
            }).then(result => {
                var userID = this.props.navigation.getParam('UserID');
                var senderID = '';
                if (ChatRoom.Users[0] == userID) {
                    senderID = ChatRoom.Users[1];
                }
                else {
                    senderID = ChatRoom.Users[0];
                }
                axios({
                    method: 'post',
                    url: 'http://' + baseUrl + ':4000/api/Test/Get',
                    data: { _id: senderID }
                }).then(_result => {
                    this.setState({ userName: result.data[0].ad, userID: userID, targetID: senderID, senderName: _result.data[0].ad, Users: ChatRoom.Users, Messages: ChatRoom.Messages });
                });
            })
        }
        socket.off('Typing');
        socket.on('Typing', (data) => { //typing kontrolu
            var isTrueSender = false;
            for (var i = 0; i < this.state.Users.length; i++) {
                if (data._id == this.state.Users[i]) {
                    isTrueSender = true;
                }
            }
            if (isTrueSender) {

                var id = setTimeout(() => { this.setState({ isTyping: false }) }, 1000);
                clearTimeout(this.state.lastTimerId);
                this.setState({ isTyping: true, lastTimerId: id });

            }


        });
        socket.off('Chat');
        socket.on('Chat', (data) => { //Mesaj alma islemi
            var isTrueSender = false;
            for (var i = 0; i < this.state.Users.length; i++) {
                if (data.Messages[0].user._id == this.state.Users[i]) {
                    isTrueSender = true;
                }
            }
            if (isTrueSender) {
                this.setState({Messages: GiftedChat.append(this.state.Messages, data.Messages)});

            }
        });
        BackHandler.addEventListener("hardwareBackPress", this.goBack);
    }
    componentWillUnmount() {
        socket.off('Typing');
        socket.off('Chat');
        BackHandler.removeEventListener("hardwareBackPress", this.goBack);
    }
    goBack() {
        this.props.navigation.pop();
        this.props.navigation.navigate('Lobby', { UserID: this.state.userID, UserName: this.state.userName });
        return true;
    }
    send(messages) {
        socket.emit('Chat', { targetID: this.state.targetID, messages: messages }); //Mesaj gonderme islemi
        this.setState({ Messages: GiftedChat.append(this.state.Messages, messages), isTyping: false });
    }
    getNavTitle() {
        if (this.state.isTyping == true) {
            return (
                <Text>
                    typing...
                </Text>

            );
        }
        else {
            return (
                <Text>
                    {this.state.senderName}
                </Text>

            );
        }

    }
    render() {

        return (
            <>
                <NavBar>
                    <NavTitle>
                        {this.getNavTitle()}
                    </NavTitle>
                </NavBar>
                <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
                    <GiftedChat
                        messages={this.state.Messages}
                        onSend={this.onSend}
                        onPressAvatar={(user) => Alert.alert('Sended By', user.name)}
                        user={{
                            _id: this.state.userID,
                            name: this.state.userName
                        }}
                        onInputTextChanged={() => { socket.emit('Typing', { targetID: this.state.targetID }) }}
                        onSend={messages => this.send(messages)}
                    />
                </SafeAreaView>
            </>
        );
    }

}

export default ChatRoom;