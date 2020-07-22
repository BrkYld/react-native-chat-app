import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    Dimensions,
    BackHandler
} from 'react-native';
import NavBar, { NavTitle } from 'react-native-nav';
import axios from "../node_modules/axios";
import io from "socket.io-client";
var maxWidth = Dimensions.get('window').width;
var maxHeight = Dimensions.get('window').height;

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userName: '',
            password: '',
            isLogin: false,
        }
        this.handleChange = this.handleChange.bind(this);
        this.start = this.start.bind(this);
        this.ExitApp = this.ExitApp.bind(this);

    }
    componentWillUnmount() {
        BackHandler.removeEventListener("hardwareBackPress", this.ExitApp);
    }
    componentDidMount() {

        BackHandler.addEventListener("hardwareBackPress", this.ExitApp);
        this.setState({ isLogin: this.props.navigation.getParam('isLogin') });
    }
    handleChange(text, name) {

        this.setState({ [name]: text });
    }
    start() {

        var data = [];
        var element = {
            ad: this.state.userName,
            psswd: this.state.password
        }
        data.push(element);
        axios({ //Kullaniciyi yerel ve genel veri tabanina kaydet.
            method: 'post',
            url: 'http://' + baseUrl + ':4000/api/Test/Add',
            data: data
        }).then(result => {
            db.transaction((tx) => {
                tx.executeSql('UPDATE User SET UserId = (?) WHERE id = 1', [result.data.UserID],
                    (tx, results) => {
                        isLogin = true;
                        if (socket == null) {
                            socket = io('http://' + baseUrl + ':4000/?UserID=' + result.data.UserID); //Soket Baglantisini olustur
                        }
                        else {
                            console.log('Connected');
                        }
                        this.props.navigation.pop();
                        this.props.navigation.navigate('Lobby', { UserID: result.data.UserID, userName: this.state.userName });
                    });
            });
        });
    }
    ExitApp() {
        BackHandler.exitApp();
        return true;
    }
    render() {
        return (
            <>
                <NavBar>
                    <NavTitle>
                        Welcome {this.state.userName} !
                        </NavTitle>
                </NavBar>
                <View style={styles.container}>
                    <View style={styles.textInputContainer}>
                        <TextInput
                            style={styles.textInput}
                            placeholder={'Username'}
                            onChangeText={text => this.handleChange(text, 'userName')}
                            value={this.state.userName}
                        />
                        <TextInput
                            style={styles.textInput}
                            placeholder={'Password'}
                            onChangeText={text => this.handleChange(text, 'password')}
                            value={this.state.password}
                            secureTextEntry={true}
                        />

                    </View>
                    <Text style={{
                        width: maxWidth,
                        fontSize: 15,
                        alignSelf: 'center',
                        textAlign: 'center',
                        color: '#A3A9AB'
                    }}>
                        *İf you don't have an account, I will register you
                            </Text>
                </View>
                <View style={{ flex: 0.5, justifyContent: 'flex-end', backgroundColor: 'white' }}>
                    <TouchableOpacity onPress={this.start} style={styles.button}>
                        <Text style={styles.buttonText}>
                            Let's Start!
                            </Text>
                    </TouchableOpacity>
                </View>

            </>
        );
    }



}

const styles = StyleSheet.create({
    container: {
        flex: 0.5,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    textInput: {
        height: 50,
        fontSize: 20,
        alignSelf: 'stretch',
        textAlign: 'center',
        borderRadius: 100,
        borderColor: '#4DA6FF',
        borderWidth: 0.3,
        margin: 5,
        elevation: 1,
    },
    textInputContainer: {
        alignSelf: 'stretch',
        justifyContent: 'space-around',
        marginHorizontal: 40,
        backgroundColor: 'white'

    },
    button: {
        alignSelf: 'flex-end',
        height: 70,
        width: 70,
        marginBottom: 5 * maxWidth / 100,
        marginHorizontal: 2 * maxHeight / 100,
        backgroundColor: '#4DA6FF',
        borderRadius: 400,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,

    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 13,
        alignSelf: 'center',
    },
});

export default Login;