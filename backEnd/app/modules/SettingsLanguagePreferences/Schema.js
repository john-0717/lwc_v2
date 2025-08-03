const { Schema } = require("mongoose");
const mongoose = require("mongoose");

const languageMessages = new mongoose.Schema({
    languageId: { type: Schema.Types.ObjectId, ref: 'languages', required: true },
    messageKey: { type: String, required: true },
    message: { type: String },
    isDeleted: { type: Boolean, default: false },
}, {
    timestamps: true
});

const languageLabel = new mongoose.Schema({
    languageId: { type: Schema.Types.ObjectId, ref: 'languages', required: true },
    labelKey: { type: String, required: true },
    label: { type: String },
    isDeleted: { type: Boolean, default: false },
}, {
    timestamps: true
});

const LanguageMessages = mongoose.model("languagemessages", languageMessages);
const LanguageLabel = mongoose.model("Languagelabel", languageLabel);

module.exports = {
    LanguageMessages,
    LanguageLabel
};
