/****************************
 Middleware
****************************/
const _ = require("lodash");
let i18n = require("i18n");
const { HTTP_CODE } = require("../constant");
const CommonService = require("../Common");


class Middleware {

    /********************************************************
    @Purpose Function Joi req body validator
    @Parameter 
    {}
    @Return JSON String
    ********************************************************/
    static validateBody(req, res, next) {
        try {
            const { error, value } = req.schema.validate(req.body);
            if (error) {
                const message = Array.isArray(error.details) ? error.details[0].message : error.message;
                return new CommonService().handleReject(res, HTTP_CODE.FAILED, HTTP_CODE.UNPROCESSABLE_ENTITY, message)
            }
            if (error) {
                return new CommonService().handleReject(res, HTTP_CODE.FAILED, HTTP_CODE.UNPROCESSABLE_ENTITY, error.details[0].message)
            }
            req.body = value;
            next();
        } catch (error) {
            return res.send({ status: 0, message: i18n.__("SERVER_ERROR") });
        }
    }
}
module.exports = Middleware;