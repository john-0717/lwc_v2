const _ = require("lodash");

const Controller = require("../Base/Controller");
const FilterSettings = require("./Schema").FilterSettings;
const ColumnSettings = require("./Schema").ColumnSettings;
const Model = require("../Base/Model");
const CommonService = require("../../services/Common");
const RequestBody = require("../../services/RequestBody");
const { HTTP_CODE } = require("../../services/constant");

class CommonController extends Controller {
  constructor() {
    super();
  }

  /********************************************************
     @Purpose Save Filter 
     @Parameter {
        "key":"",
        "filterName": "",
        "filter": []
    }
     @Return JSON String
     ********************************************************/
  async saveFilter() {
    try {
      /********************************************************
      Generate Field Array and process the request body
      ********************************************************/
      let fieldsArray = ["key", "filterName", "filter"];
      let data = await (new RequestBody()).processRequestBody(this.req.body, fieldsArray);

      /********************************************************
      Check Filter Name in DB and validate
      ********************************************************/
      let checkingFilterName = await FilterSettings.findOne({
        adminId: this.req.currentUser._id,
        filterName: data.filterName,
        key: data.key,
        isDeleted: false,
      }).exec();
      if (!_.isEmpty(checkingFilterName)) {
        return new CommonService().handleReject(this.res, HTTP_CODE.FAILED, HTTP_CODE.UNPROCESSABLE_ENTITY, await new CommonService().setMessage(this.req.currentUserLang, "FILTER_ALREADY_EXISTS"))
      }

      /********************************************************
       Check Filter length in DB and validate
      ********************************************************/
      let checkingFilterLength = await FilterSettings.find({
        adminId: this.req.currentUser._id,
        key: data.key,
        isDeleted: false,
      }).exec();
      if (checkingFilterLength.length >= 5) {
        return new CommonService().handleReject(this.res, HTTP_CODE.FAILED, HTTP_CODE.UNPROCESSABLE_ENTITY, await new CommonService().setMessage(this.req.currentUserLang, "FILTER_MAX_LIMIT"))
      }
      data.adminId = this.req.currentUser._id;
      /********************************************************
      Add Filter data into DB and validate
      ********************************************************/
      await new Model(FilterSettings).store(data);
      /********************************************************
      Generate and return response
      ********************************************************/
      return new CommonService().handleResolve(this.res, HTTP_CODE.SUCCESS, HTTP_CODE.SUCCESS_CODE, await new CommonService().setMessage(this.req.currentUserLang, "FILTER_SAVED"));
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error saveFilter()", error);
      return new CommonService().handleReject(this.res, HTTP_CODE.FAILED, HTTP_CODE.SERVER_ERROR_CODE, await new CommonService().setMessage(this.req.currentUserLang, "SERVER_ERROR"))
    }
  }

  /********************************************************
    @Purpose Get Filters
    @Parameter
    {
      "key": ""
    }
    @Return JSON String
    ********************************************************/
  async getFilters() {
    try {
      this.req.body["adminId"] = this.req.currentUser._id;
      if (_.isEmpty(this.req.params.key)) {
        return new CommonService().handleReject(this.res, HTTP_CODE.FAILED, HTTP_CODE.UNPROCESSABLE_ENTITY, await new CommonService().setMessage(this.req.currentUserLang, "REQUEST_PARAMETERS"))
      }

      let result = await new CommonService().getFilters({
        bodyData: { key: this.req.params.key, adminId: this.req.currentUser._id },
      });
      return new CommonService().handleResolve(this.res, HTTP_CODE.SUCCESS, HTTP_CODE.SUCCESS_CODE, await new CommonService().setMessage(this.req.currentUserLang, "GET_DETAIL_SUCCESSFULLY"), result.data, null, result.page, result.perPage, result.total);
    }
    catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error getFilters()", error);
      return new CommonService().handleReject(this.res, HTTP_CODE.FAILED, HTTP_CODE.SERVER_ERROR_CODE, await new CommonService().setMessage(this.req.currentUserLang, "SERVER_ERROR"))
    }
  }

  /********************************************************
     @PurposeCountry delete Filter
     @Parameter
     {
        "filterId":[""],
     }
     @Return JSON String
     ********************************************************/
  async deleteFilter() {
    try {
      if (_.isEmpty(this.req.params.filterId)) {
        return new CommonService().handleReject(this.res, HTTP_CODE.FAILED, HTTP_CODE.UNPROCESSABLE_ENTITY, await new CommonService().setMessage(this.req.currentUserLang, "REQUEST_PARAMETERS"))
      }
      /********************************************************
      Update Delete Status
      ********************************************************/
      await FilterSettings.deleteOne(
        { _id: { $in: this.req.params.filterId } },
      ).exec();
      /********************************************************
        Generate and return response
      ********************************************************/
      return new CommonService().handleResolve(this.res, HTTP_CODE.SUCCESS, HTTP_CODE.SUCCESS_CODE, await new CommonService().setMessage(this.req.currentUserLang, "FILTER_TEMPLATE_DELETED"));
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error deleteFilter()", error);
      return new CommonService().handleReject(this.res, HTTP_CODE.FAILED, HTTP_CODE.SERVER_ERROR_CODE, await new CommonService().setMessage(this.req.currentUserLang, "SERVER_ERROR"))
    }
  }

  /********************************************************
     @Purpose Save Column 
     @Parameter {
        "key":"",
        "name": "",
        "column": []
    }
     @Return JSON String
     ********************************************************/
  async saveColumn() {
    try {
      /********************************************************
      Generate Field Array and process the request body
      ********************************************************/
      let fieldsArray = ["key", "name", "column"];
      let data = await (new RequestBody()).processRequestBody(this.req.body, fieldsArray);

      /********************************************************
      Check Column Name in DB and validate
      ********************************************************/
      let checkingColumnName = await ColumnSettings.findOne({
        adminId: this.req.currentUser._id,
        name: data.name,
        key: data.key,
        isDeleted: false,
      }).exec();
      if (!_.isEmpty(checkingColumnName)) {
        return new CommonService().handleReject(this.res, HTTP_CODE.FAILED, HTTP_CODE.UNPROCESSABLE_ENTITY, await new CommonService().setMessage(this.req.currentUserLang, "COLUMN_ALREADY_EXISTS"))
      }

      /********************************************************
       Check Column Settings length in DB and validate
      ********************************************************/
      let checkingFilterSettingsLength = await ColumnSettings.find({
        adminId: this.req.currentUser._id,
        key: data.key,
        isDeleted: false,
      }).exec();
      if (checkingFilterSettingsLength.length >= 5) {
        return new CommonService().handleReject(this.res, HTTP_CODE.FAILED, HTTP_CODE.UNPROCESSABLE_ENTITY, await new CommonService().setMessage(this.req.currentUserLang, "COLUMN_MAX_LIMIT"))
      }
      data.adminId = this.req.currentUser._id;
      /********************************************************
      Add Filter data into DB and validate
      ********************************************************/
      await new Model(ColumnSettings).store(data);
      /********************************************************
      Generate and return response
      ********************************************************/
      return new CommonService().handleResolve(this.res, HTTP_CODE.SUCCESS, HTTP_CODE.SUCCESS_CODE, await new CommonService().setMessage(this.req.currentUserLang, "COLUMN_SAVED"));
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error saveColumn()", error);
      return new CommonService().handleReject(this.res, HTTP_CODE.FAILED, HTTP_CODE.SERVER_ERROR_CODE, await new CommonService().setMessage(this.req.currentUserLang, "SERVER_ERROR"))
    }
  }

  /********************************************************
    @Purpose Get Column
    @Parameter
    {
      "key": ""
    }
    @Return JSON String
    ********************************************************/
  async getColumn() {
    try {
      this.req.body["adminId"] = this.req.currentUser._id;
      if (_.isEmpty(this.req.params.key)) {
        return new CommonService().handleReject(this.res, HTTP_CODE.FAILED, HTTP_CODE.UNPROCESSABLE_ENTITY, await new CommonService().setMessage(this.req.currentUserLang, "REQUEST_PARAMETERS"))
      }

      let result = await new CommonService().getColumn({
        bodyData: { key: this.req.params.key, adminId: this.req.currentUser._id },
      });
      return new CommonService().handleResolve(this.res, HTTP_CODE.SUCCESS, HTTP_CODE.SUCCESS_CODE, await new CommonService().setMessage(this.req.currentUserLang, "GET_DETAIL_SUCCESSFULLY"), result.data, null, result.page, result.perPage, result.total);
    }
    catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error getColumn()", error);
      return new CommonService().handleReject(this.res, HTTP_CODE.FAILED, HTTP_CODE.SERVER_ERROR_CODE, await new CommonService().setMessage(this.req.currentUserLang, "SERVER_ERROR"))
    }
  }

  /********************************************************
     @PurposeCountry delete Column
     @Parameter
     {
        "filterId":[""],
     }
     @Return JSON String
     ********************************************************/
  async deleteColumn() {
    try {
      if (_.isEmpty(this.req.params.columnId)) {
        return new CommonService().handleReject(this.res, HTTP_CODE.FAILED, HTTP_CODE.UNPROCESSABLE_ENTITY, await new CommonService().setMessage(this.req.currentUserLang, "REQUEST_PARAMETERS"))
      }
      /********************************************************
      Update Delete Status
      ********************************************************/
      await ColumnSettings.deleteOne(
        { _id: { $in: this.req.params.columnId } },
      ).exec();
      /********************************************************
        Generate and return response
      ********************************************************/
      return new CommonService().handleResolve(this.res, HTTP_CODE.SUCCESS, HTTP_CODE.SUCCESS_CODE, await new CommonService().setMessage(this.req.currentUserLang, "COLUMN_TEMPLATE_DELETED"));
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error deleteColumn()", error);
      return new CommonService().handleReject(this.res, HTTP_CODE.FAILED, HTTP_CODE.SERVER_ERROR_CODE, await new CommonService().setMessage(this.req.currentUserLang, "SERVER_ERROR"))
    }
  }

}

module.exports = CommonController;
