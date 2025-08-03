const Joi = require('joi');
const i18n = require("i18n");

const Listing = Joi.object({
    page: Joi.number().required().error(new Error(i18n.__("VALID_PAGE"))),
    pagesize: Joi.number().required().error(new Error(i18n.__("VALID_PAGESIZE"))),
    searchText: Joi.string().allow(null, '')
});


module.exports = { Listing};