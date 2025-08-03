const mongoose = require("mongoose");

const languages = new mongoose.Schema({
    country: { type: String },
    language: { type: String },
    languageCode: { type: String },
    isPrimary: { type: Boolean, default: false },
    status: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
}, {
    timestamps: true
});

const Languages = mongoose.model('languages', languages);

module.exports = {
    Languages
};
