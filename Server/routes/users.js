var express = require('express');
var router = express.Router();
var DB = require('../helpers/db');
var collection = 'Users';
router.post('/Get',(request,response,next)=>{

    DB.Find(request.body,collection,(result,err)=>{
        if(err) response.json(err);
        else {
            response.json(result);}
    });
});
router.post('/Add',(request,response,next)=>{
    DB.Find(request.body[0],collection,(result,err)=>{
        if(err) response.json(err);
        if(result.length == 0)
        {
            DB.Insert(request.body,collection,(result)=>{
                if(err) response.json(err);
                else 
                {
                    var _response = {
                        message : 'User Added',
                        code : 1,
                        UserID : result.ops[0]._id
                    }
                  
                    response.json(_response);
                }
            });
        }
        else
        {

            var _response = {
                message : 'User has already exists!',
                code : 0,
                UserID : result[0]._id
            }
            response.json(_response);
        }
    });

})

module.exports = router;