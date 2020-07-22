const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;
let _connstr = 'mongodb://**********';
let dbName = "BingBing";
//Mongo Db VeriTabani islemleri
var DB =
{
    ObjectId: (_oid) => {
        return new mongo.ObjectID(_oid);
    },
    Name: (_dbName) => {
        dbName = _dbName;
    },
    TestConnection: (callback) => {
        MongoClient.connect(_connstr, (err, client) => {
            if (err) throw err;
            console.log('MongoDB bağlantısı başarıyla gerçekleştirildi.');
            client.close();
        });
    },
    Insert: (data, collection, callback) => {
        MongoClient.connect(_connstr, (err, client) => {
            if (err) throw err;
            const db = client.db(dbName);
            db.collection(collection).insertMany(data, (err, result) => {
                if (err) throw err;
                client.close();
                callback(result);
            });
        });
    },
    Find: (query, collection, callback) => {
        if(query._id != null && query._id.length == 24){
            
            query._id = DB.ObjectId(query._id);
        }
        MongoClient.connect(_connstr, (err, client) => {
            if (err) throw err;
            const db = client.db(dbName);
            db.collection(collection).find(query).toArray((err, result) => {
                if (err) throw err;
                client.close();
                callback(result);
            });

        });
    },
    Update: (query, newValue, collection, callback) => {
        MongoClient.connect(_connstr, (err, client) => {
            if (err) throw err;
            const db = client.db(dbName);
            db.collection(collection).updateMany(query, newValue, (err, result) => {
                if (err) throw err;
                client.close();
                callback(result);
            });

        });
    },
    Delete: (query, collection, callback) => {
        MongoClient.connect(_connstr, (err, client) => {
            if (err) throw err;
            const db = client.db(dbName);
            db.collection(collection).deleteMany(query,(err, result) => {
                if (err) throw err;
                client.close();
                callback(result);
            });

        });
    },
    SetAsDefault: ()=>{
        dbName = 'BingBing';
        _connstr = 'mongodb://*********************';
    }
};

module.exports = DB;