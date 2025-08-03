/****************************
 MONGOOSE SCHEMAS
 ****************************/
let config = require('./configs');
let mongoose = require('mongoose');
mongoose.Promise = global.Promise;

let mongoDBOptions = {
    keepAlive: true,
    connectTimeoutMS: 30000,
    minPoolSize: 5
}

module.exports = function () {
    return mongoose.connect(config.db, mongoDBOptions).then(
        () => { console.log('MongoDB connected') },
        (err) => { console.log('MongoDB connection error', err) }
    );
};
