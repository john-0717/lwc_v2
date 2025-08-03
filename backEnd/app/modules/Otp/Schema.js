/**************************
 OTP SCHEMA INITIALISATION
 **************************/
let Schema = require('mongoose').Schema;
let mongoose = require('mongoose');

let adminOtpInfo = new Schema({
    adminId: { type: Schema.Types.ObjectId, ref: 'Admin' },
    otp: { type: String },
    otpVerficationToken: { type: String },
    otpExpiryTime: { type: Date },
    isDeleted: { type: Boolean, default: false }
}, {
    timestamps: true
});

let AdminOtpInfos = mongoose.model('adminotpinfos', adminOtpInfo);

module.exports = {
    AdminOtpInfos
}