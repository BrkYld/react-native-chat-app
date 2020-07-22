var express = require('express');
var router = express.Router();
var DB = require('../helpers/db');
var collection = 'ActiveUsers';
router.post('/Get', (request, response, next) => {

    DB.Find(request.body, collection, (result, err) => {
        if (err) throw err;
        else {
            var data = [];
            for(var i = 0 ; i < result.length ; i++){
                data.push(DB.ObjectId(result[i].userID));
            }
           
            DB.Find({_id : { $in : data}},'Users',(result)=>{
                response.json(result);
            });
        }
    });
});


module.exports = router;