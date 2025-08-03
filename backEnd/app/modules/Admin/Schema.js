let mongoose = require('mongoose');
let schema = mongoose.Schema;
const _ = require("lodash");
let roleSchema = require('../Roles/Schema').roleSchema;

let admin = new schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    username: { type: String },
    mobile: { type: String },
    emailId: { type: String, required: true },
    password: { type: Buffer },
    photo: { type: String },
    emailVerificationStatus: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    status: { type: Boolean, default: true },
    verificationToken: { type: String },
    verificationTokenCreationTime: { type: Date },
    role: {type: schema.Types.ObjectId, ref: 'roles'},
    dateofbirth: { type: Date },
    gender: { type: String },
    website: { type: String },
    address: { type: String },
    fbId: { type: String },
    twitterId: { type: String },
    instagramId: { type: String },
    githubId: { type: String },
    codepen: { type: String },
    slack: { type: String },
    sendOTPToken: { type: String },
    forgotToken: { type: String },
    forgotTokenCreationTime: { type: Date },
    deviceToken: { type: String },
    device: { type: String },
    isThemeDark: false,
    addedBy: { type: schema.Types.ObjectId, ref: 'Admin' },
    countryCode: { type: String },
    timeZone: { type: String },
    dateFormat: { type: String },
    currency: { type: String },
    timeFormat: { type: String }
}, {
    timestamps: true
});

let models = mongoose.modelNames();
let Admin = !_.includes(models, 'Admin') ? mongoose.model('Admin', admin) : mongoose.models['Admin'];
module.exports = {
    Admin,
    admin
}