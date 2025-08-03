/**************************
 AUTHENTICATION SCHEMA INITIALISATION
 **************************/
let Schema = require('mongoose').Schema;
let mongoose = require('mongoose');

let authtokensSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'Users' },
    adminId: { type: Schema.Types.ObjectId, ref: 'Admin' },
    refreshToken: { type: Buffer },
    role: { type: String },
    access_tokens: [{
        token: { type: Buffer },
        tokenExpiryTime: { type: Date },
        deviceId: { type: String },
        ipAddress: { type: String },
    }]
},
    { timestamps: true });

let Authtokens = mongoose.model('authtokens', authtokensSchema);

module.exports = {
    Authtokens: Authtokens,
}

