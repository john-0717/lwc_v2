const mongoose = require('mongoose');

const filterSettingsSchema = new mongoose.Schema({
    key: { type: String },
    filterName: { type: String },
    filter: { type: Array },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'admins' },
}, {
    timestamps: true
});
filterSettingsSchema.index({ key: 1, filterName: 1 }, { unique: true });
let FilterSettings = mongoose.model('filterSettings', filterSettingsSchema);

const columnSettingsSchema = new mongoose.Schema({
    key: { type: String },
    name: { type: String },
    column: { type: Array },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'admins' },
}, {
    timestamps: true
});
let ColumnSettings = mongoose.model('columnSettings', columnSettingsSchema);

module.exports = {
    FilterSettings,
    ColumnSettings
}