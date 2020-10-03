

var express = require('express');
var socket = require('socket.io')
var DB = require('./helpers/db');
var Users = require('./routes/users');
var ActiveUsers = require('./routes/activeUser');
var ChatRooms = require('./routes/chatRooms');
var bodyParser = require('body-parser');
//Server Tarafi 
var api = express(); //Express framework ile Web Apisi
var server = api.listen(4000, () => {
    DB.Delete({}, 'ActiveUsers', (result) => { });
    console.log('LISTENING NOW');
});


api.use(bodyParser.json()); //Http isteklerini parse et.
api.use('/api/Test', Users);//Api url yonlendirmeleri.
api.use('/api/ActiveUsers', ActiveUsers);
api.use('/api/ChatRooms', ChatRooms);
var io = socket(server); //Socket olusturma islemi.

function getSocketID(userID, callback) { // Aktif Kullanici tablosundan kullancinin o anki soket id sini buluyor.
    DB.Find({ userID: userID }, 'ActiveUsers', (result) => {
        callback(result);
    });
};

io.on('connection', (socket) => { //Servera ilk baglanti aninda

    var handshakeData = socket.request._query['UserID'];
    var item = [{ socketID: socket.id, userID: handshakeData }];
    DB.Insert(item, 'ActiveUsers', (result) => { //Kullanicinin soket id si ve kullanici id sini Active users adinda bir tabloya ekliyor.
        socket.broadcast.emit('Update'); //İstemciye Guncelleme mesaji gonderiyor.
    });
    socket.on('ChatRequest', (data) => {
        var chatRoomQuery = {

            Users: { $all: [data.targetID, item[0].userID] }

        }
        DB.Find(chatRoomQuery, 'ChatRooms', (result) => { //Chat odasi var mi diye kontrol ediyor.
            if (result.length != 0) { // varsa
                socket.emit("isNewChatRoom", { ChatRoom: result[0], is: false }); //Chat odasina ait bilgileri veritabanindan cekiyor ve mesaj olarak gonderiyor.
            }
            else { //yoksa
                getSocketID(data.targetID, (result) => {
                    DB.Find({ _id: item[0].userID }, 'Users', (__result) => {
                        socket.to(result[0].socketID).emit('ChatRequest', __result[0]);//hedef kullaniciya chat istegi mesajini gonderiyor.
                        socket.emit("isNewChatRoom", { is: true }); // yeni chatroom mesajını gonderiyor
                    });
                })
            }
        });
    });
    socket.on('Accept', (data) => { //Chat istegi kabul edilirse bu mesaj servera iletilecek
        DB.Find({ _id: data.targetID }, 'Users', (result) => {

            var newRoom = [{
                Users: [item[0].userID, data.targetID],
                UserNames: [result[0].ad, data.userName],
                Messages: []
            }]

            DB.Insert(newRoom, 'ChatRooms', (result) => { }); //Veritabanina yeni oda kaydediliyor.
        });
    });
    socket.on('Typing', (data) => { //Kullanici yazarken servera bu mesaj gonderilir.
        if (data.targetID != '') {
            getSocketID(data.targetID, (result) => {
                if (result.length != 0) {
                    socket.to(result[0].socketID).emit('Typing', { _id: item[0].userID });
                }
            })
        }
    });
    socket.on('Chat', (data) => { //Mesaj geldiginde.
        if (data.targetID != '') {
            getSocketID(data.targetID, (result) => {
                if (result.length != 0) {
                    socket.to(result[0].socketID).emit('Chat', { Messages: data.messages });//Hedef kullaniciya mesaj iletilir.
                    socket.to(result[0].socketID).emit('LobbyUpdate'); //Lobinin guncellenmesi icin istemciye bu mesaj gider.
                }
                var chatRoomQuery = {
                    Users: { $all: [data.targetID, item[0].userID] }
                };
                DB.Find(chatRoomQuery, 'ChatRooms', (_result) => { //mesaji gonderdikten sonra veritabanına kaydet
                    var message = _result[0].Messages;
                    for (var i = 0; i < data.messages.length; i++) {
                        message.push(data.messages[i]);
                    }
                    DB.Update(chatRoomQuery, { $set: { Messages: message } }, 'ChatRooms', () => { });
                });
            })
        }
    });
    socket.on('OpenPublicRoom', (data) => { //Yeni bir chat odasi olusturma istegi.
        DB.Find({ RoomName: data.roomName }, 'ChatRooms', (result) => {

            if (result.length == 0) {
                var room = [{
                    Users: ['Public'],
                    UserNames: [],
                    RoomName: data.roomName,
                    Messages: []
                }]
                DB.Insert(room, 'ChatRooms', () => { });
            }
        });

    });
    socket.on('JoinRoom', (data) => { //Kullanici bir chat odasina katildiginda
        socket.join(data.roomName);
    });
    socket.on('RoomChat', (data) => { //Odaya mesaj dustugunde 
        socket.to(data.roomName).emit('RoomChat',{Messages : data.messages}); 
        var chatRoomQuery = {
            RoomName: data.roomName
        };
        DB.Find(chatRoomQuery, 'ChatRooms', (_result) => {
            var message = _result[0].Messages;
            for (var i = 0; i < data.messages.length; i++) {
                message.push(data.messages[i]);
            }
            DB.Update(chatRoomQuery, { $set: { Messages: message } }, 'ChatRooms', () => { }); //Mesaji veri tabanina kaydeder.
        });
    });
    socket.on('LeaveRoom', (data) => {
        socket.leave(data.roomName);
    });
    socket.on('disconnect', () => {
        DB.Delete({ socketID: socket.id }, 'ActiveUsers', (result) => { //socket baglantisi kopmussa Aktif kullanicilari guncelle.

            socket.broadcast.emit('Update');

        });

    });
});

