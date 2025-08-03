const _ = require("lodash");

const Controller = require("../Base/Controller");
const { LanguageLabel, LanguageMessages } = require("./Schema");
const Model = require("../Base/Model");
const masterProjection = require("./Projection.json");
const CommonService = require("../../services/Common");
const { HTTP_CODE } = require("../../services/constant");
const { Languages } = require("../MasterLanguageManagement/Schema");

class LanguagePreferencesController extends Controller {
  constructor() {
    super();
  }

  /********************************************************
     @Purpose Add/Update LanguagePreferences Messages 
     @Parameter {
      "languageId": "",
      "messageKey": ,
      "message": "",
      "editMessage":[{
        "dataId": "",
        "message": ""
      }]
     }
     @Return JSON String
     ********************************************************/
  async addUpdateMessages() {
    try {
      let data = this.req.body;
      if (data.editMessage) {
        /********************************************************
        Find Message details and validate
        ********************************************************/
        data.editMessage.forEach(async (message) => {
          /********************************************************
          Update Message details and validate
          ********************************************************/
          await LanguageMessages.findByIdAndUpdate(message.dataId, message, {
            new: true,
          }).exec();
        });
        /********************************************************
        Generate and return response
        ********************************************************/
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.SUCCESS,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "DATA_UPDATED_SUCCESSFULLY"
          )
        );
      } else {
        /********************************************************
        Check Message details and validate
        ********************************************************/
        let checkingMessageData = await LanguageMessages.findOne({
          languageId: data.languageId,
          messageKey: data.messageKey,
          isDeleted: false,
        }).exec();
        if (!_.isEmpty(checkingMessageData)) {
          return new CommonService().handleReject(
            this.res,
            HTTP_CODE.FAILED,
            HTTP_CODE.SUCCESS_CODE,
            await new CommonService().setMessage(
              this.req.currentUserLang,
              "LANGUAGE_MESSAGE_ALREADY_EXISTS"
            )
          );
        }

        /********************************************************
        Save Message details and validate
        ********************************************************/
        const messageData = await new Model(LanguageMessages).store(data);
        if (_.isEmpty(messageData)) {
          return new CommonService().handleReject(
            this.res,
            HTTP_CODE.FAILED,
            HTTP_CODE.SUCCESS_CODE,
            await new CommonService().setMessage(
              this.req.currentUserLang,
              "LANGUAGE_NOT_SAVED"
            )
          );
        }
        /********************************************************
        Generate and return response
        ********************************************************/
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.SUCCESS,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "LANGUAGE_MESSAGE_ADDED_SUCCESSFULLY"
          )
        );
      }
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error addUpdateMessages()", error);
      return new CommonService().handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "SERVER_ERROR"
        )
      );
    }
  }

  /********************************************************
     @Purpose get LanguagePreferences Messages
     @Parameter {page,pagesize}
     @Return JSON String
     ********************************************************/
  async getMessagesListing() {
    try {
      const data = this.req.body;
      const skip = (data.page - 1) * data.pagesize;
      const languageEN = await Languages.findOne({ languageCode: "en" }).exec();
      let filter = {};
      if (data.searchText) {
        filter = {
          $or: [
            { messageKey: { $regex: data.searchText, $options: "i" } },
            { message: { $regex: data.searchText, $options: "i" } },
          ],
        };
      }
      const listing = await LanguageMessages.find({
        languageId: languageEN._id,
        isDeleted: false,
        ...filter,
      })
        .skip(skip)
        .limit(data.pagesize)
        .select(masterProjection.listing)
        .exec();
      const total = await LanguageMessages.find({
        languageId: languageEN._id,
        isDeleted: false,
        ...filter,
      })
        .countDocuments()
        .exec();
      const language = await Languages.findOne({
        _id: data.languageId,
      }).exec();
      if (language.languageCode === "en") {
        /********************************************************
            Generate and return response
          ********************************************************/
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.SUCCESS,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "GET_DETAIL_SUCCESSFULLY"
          ),
          listing,
          null,
          data.page,
          data.pagesize,
          total
        );
      } else {
        let newListing = [];
        await this.asyncForEach(listing, async (data) => {
          const message = await LanguageMessages.findOne({
            languageId: this.req.body.languageId,
            isDeleted: false,
            messageKey: data.messageKey,
          })
            .select(masterProjection.listing)
            .exec();
          if (message) {
            newListing.push(message);
          } else {
            newListing.push({ messageKey: data.messageKey, message: "" });
          }
        });
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.SUCCESS,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "GET_DETAIL_SUCCESSFULLY"
          ),
          newListing,
          null,
          data.page,
          data.pagesize,
          total
        );
      }
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error getMessagesListing()", error);
      return new CommonService().handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "SERVER_ERROR"
        )
      );
    }
  }

  /********************************************************
     @Purpose Add/Update LanguagePreferences Labels 
     @Parameter {
      "languageId": "",
      "labelKey": ,
      "label": "",
      "editLabel":[{
        "dataId": "",
        "label": ""
      }]
     }
     @Return JSON String
     ********************************************************/
  async addUpdateLabel() {
    try {
      let data = this.req.body;
      if (data.editLabel) {
        /********************************************************
        Find Label details and validate
        ********************************************************/
        data.editLabel.forEach(async (label) => {
          /********************************************************
          Update Label details and validate
          ********************************************************/
          await LanguageLabel.findByIdAndUpdate({ _id: label.dataId }, label, {
            new: true,
          }).exec();
        });
        /********************************************************
        Generate and return response
        ********************************************************/
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.SUCCESS,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "LANGUAGE_LABEL_UPDATED_SUCCESSFULLY"
          )
        );
      } else {
        /********************************************************
        Check Label details and validate
        ********************************************************/
        let checkingLabelData = await LanguageLabel.findOne({
          languageId: data.languageId,
          labelKey: data.labelKey,
          isDeleted: false,
        }).exec();
        if (!_.isEmpty(checkingLabelData)) {
          return new CommonService().handleReject(
            this.res,
            HTTP_CODE.FAILED,
            HTTP_CODE.SUCCESS_CODE,
            await new CommonService().setMessage(
              this.req.currentUserLang,
              "LANGUAGE_LABEL_ALREADY_EXISTS"
            )
          );
        }

        /********************************************************
        Save Label details and validate
        ********************************************************/
        const labelData = await new Model(LanguageLabel).store(data);
        if (_.isEmpty(labelData)) {
          return new CommonService().handleReject(
            this.res,
            HTTP_CODE.FAILED,
            HTTP_CODE.SUCCESS_CODE,
            await new CommonService().setMessage(
              this.req.currentUserLang,
              "LANGUAGE_NOT_SAVED"
            )
          );
        }
        /********************************************************
        Generate and return response
        ********************************************************/
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.SUCCESS,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "LANGUAGE_LABEL_ADDED_SUCCESSFULLY"
          )
        );
      }
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error addUpdateLabel()", error);
      return new CommonService().handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "SERVER_ERROR"
        )
      );
    }
  }

  /********************************************************
   @Purpose get LanguagePreferences Label list
   @Parameter {page,pagesize}
   @Return JSON String
   ********************************************************/
  async getLabelListing() {
    try {
      const data = this.req.body;
      const skip = (data.page - 1) * data.pagesize;
      const languageEN = await Languages.findOne({ languageCode: "en" }).exec();
      const listing = await LanguageLabel.find({
        languageId: languageEN._id,
        isDeleted: false,
      })
        .skip(skip)
        .limit(data.pagesize)
        .select(masterProjection.listing)
        .exec();
      const total = await LanguageLabel.find({
        languageId: languageEN._id,
        isDeleted: false,
      })
        .countDocuments()
        .exec();
      const language = await Languages.findOne({ _id: data.languageId }).exec();
      if (language.languageCode === "en") {
        /********************************************************
          Generate and return response
        ********************************************************/
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.SUCCESS,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "GET_DETAIL_SUCCESSFULLY"
          ),
          listing,
          null,
          data.page,
          data.pagesize,
          total
        );
      } else {
        let newListing = [];
        await this.asyncForEach(listing, async (data) => {
          const label = await LanguageLabel.findOne({
            languageId: this.req.body.languageId,
            isDeleted: false,
            labelKey: data.labelKey,
          })
            .select(masterProjection.listing)
            .exec();
          if (label) {
            newListing.push(label);
          } else {
            newListing.push({ labelKey: data.labelKey, label: "" });
          }
        });
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.SUCCESS,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "GET_DETAIL_SUCCESSFULLY"
          ),
          newListing,
          null,
          data.page,
          data.pagesize,
          total
        );
      }
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error getLabelListing()", error);
      return new CommonService().handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "SERVER_ERROR"
        )
      );
    }
  }

  /********************************************************
   @Purpose get LanguagePreferences Label
   @Parameter {}
   @Return JSON String
   ********************************************************/
  async getLabel() {
    try {
      const listing = await LanguageLabel.find({
        languageId: this.req.currentUserLang,
        isDeleted: false,
      })
        .select(masterProjection.labelListing)
        .exec();
      /********************************************************
        Generate and return response
      ********************************************************/
      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "GET_DETAIL_SUCCESSFULLY"
        ),
        listing
      );
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error getLabel()", error);
      return new CommonService().handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "SERVER_ERROR"
        )
      );
    }
  }

  async asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }
}

module.exports = LanguagePreferencesController;
