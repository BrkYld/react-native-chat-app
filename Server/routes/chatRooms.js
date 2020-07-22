var express = require('express');
var router = express.Router();
var DB = require('../helpers/db');
var collection = 'ChatRooms';
router.post('/GetForLobby', (request, response, next) => {
    DB.Find({Users : {$in : [request.body._id,'Public']}},collection,(result)=>{
        
        var _response = [];
        for(var i = 0 ; i < result.length ; i++){
            var Messages = result[i].Messages;
            var lastMessage = "";
            var lastSender = "";
            if(Messages.length != 0){
                lastMessage = Messages[Messages.length-1].text;
                lastSender = Messages[Messages.length-1].user.name;
            }
            var item = 
            {
                _id : result[i]._id,
                Users : result[i].Users,
                lastMessage : lastMessage,
                lastSender : lastSender,
                between : result[i].UserNames,
                roomName : result[i].RoomName 
            }
            _response.push(item);
        }
        response.json(_response);
    });
});
router.post('/Get', (request, response, next) => {
   DB.Find({_id : request.body._id},collection,(result)=>
   {
     response.json(result);
   });
});
router.post('/GetForPublic',(request,response,next) => {
    DB.Find({RoomName : request.body.RoomName},collection,(result)=>{
        response.json(result);
    });
});
module.exports = router;