const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;

const roleSchema = new mongoose.Schema({
    role: { type: String },
    description: { type: String },
    slug: { type: String },
    permissions: [{ type: Schema.Types.ObjectId, ref: 'Permissions', required: true }],
    isDefault: { type: Boolean, default: false },
    addedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
    modifiedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
    status: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false }
}, {
    timestamps: true
});

let RolesSchema = mongoose.model('Roles', roleSchema);

const permissionSchema = new mongoose.Schema({
    permission: { type: String },
    permissionKey: { type: String, unique: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'PermissionCategory', required: true },
    status: { type: Boolean, default: true }
}, {
    timestamps: true
});

const PermissionsSchema = mongoose.model('Permissions', permissionSchema);

const permissionCategorySchema = new mongoose.Schema({
    category: { type: String, unique: true },
    status: { type: Boolean, default: true }
}, {
    timestamps: true
});

const PermissionCategoriesSchema = mongoose.model('PermissionCategory', permissionCategorySchema);

module.exports = {
    PermissionsSchema,
    RolesSchema,
    PermissionCategoriesSchema
}