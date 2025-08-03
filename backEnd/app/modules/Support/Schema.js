const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;

const supportTicketSchema = new mongoose.Schema({
    supportId: { type: String },
    title: { type: String },
    description: { type: String },
    status: {
        type: String,
        default: "Open",
        enum: ["Open", "Rejected", "Closed"],
    },
    openBy: { type: Schema.Types.ObjectId, ref: 'users' },
    closedAt: { type: Date },
    closedBy: { type: Schema.Types.ObjectId, ref: 'admin' },
    isDeleted: { type: Boolean, default: false },
}, {
    timestamps: true
});

let SupportTicketSchema = mongoose.model('supportTicket', supportTicketSchema);

const supportTicketRepliesSchema = new mongoose.Schema({
    supportId: { type: Schema.Types.ObjectId, ref: 'supportTicket' },
    message: { type: String },
    ipAddress: { type: String },
    browser: { type: String },
    addedFrom: { type: String },
    repliedByUser: { type: Schema.Types.ObjectId, ref: 'users' },
    repliedByAdmin: { type: Schema.Types.ObjectId, ref: 'admin' },
    media: { type: String },
    isDeleted: { type: Boolean, default: false },
}, {
    timestamps: true
});

const SupportTicketRepliesSchema = mongoose.model('supportTicketReplies', supportTicketRepliesSchema);

module.exports = {
    SupportTicketSchema,
    SupportTicketRepliesSchema
}