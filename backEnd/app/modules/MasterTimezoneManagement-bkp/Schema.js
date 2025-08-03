const { Schema } = require("mongoose");
const mongoose = require("mongoose");

const timezones = new mongoose.Schema({
    countryId: { type: Schema.Types.ObjectId, ref: 'countries', required: true },
    timeZone: { type: String },
    status: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
}, {
    timestamps: true
});

const Timezones = mongoose.model('timezones', timezones);

module.exports = {
    Timezones
};
