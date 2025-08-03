const _ = require("lodash");

const Controller = require("../Base/Controller");
const Globals = require("../../../configs/Globals");
const CMSPages = require("./Schema").CMSPages;
const Model = require("../Base/Model");
const CommonService = require("../../services/Common");
const RequestBody = require("../../services/RequestBody");
const { HTTP_CODE } = require("../../services/constant");
const { Languages } = require("../MasterLanguageManagement/Schema");
const ObjectId = require("mongoose").Types.ObjectId;

class CMSPagesController extends Controller {
  constructor() {
    super();
  }

  /********************************************************
     @Purpose Add CMSPages
     @Parameter {
        "pageData":"",
        "title":"",
        "slug":"",
        "metaTitle":"",
        "metaKeywords":"",
        "metaDescription":"",
     }
     @Return JSON String
  ********************************************************/

  async addPage() {
    try {
      /********************************************************
      Generate Field Array and process the request body
      ********************************************************/
      let fieldsArray = [
        "pageData",
        "title",
        "slug",
        "metaTitle",
        "metaKeywords",
        "metaDescription",
      ];
      let data = await new RequestBody().processRequestBody(
        this.req.body,
        fieldsArray
      );

      let isNameAvailable = await new CommonService().nameValidator({
        model: CMSPages,
        searchString: data.title,
        field: "title"
      });
      isNameAvailable = isNameAvailable.filter(e => !e.isDeleted);

      if (!_.isEmpty(isNameAvailable)) {
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "CMS_PAGES_ALREADY_EXISTS"
          )
        );
      }

      if (data.slug) {
        let checkingSlugExist = await CMSPages.findOne({
          slug: data.slug,
          isDeleted: false,
        }).exec();
        if (!_.isEmpty(checkingSlugExist)) {
          return new CommonService().handleReject(
            this.res,
            HTTP_CODE.FAILED,
            HTTP_CODE.SUCCESS_CODE,
            await new CommonService().setMessage(
              this.req.currentUserLang,
              "SLUG_ALREADY_EXISTS"
            )
          );
        }
      }

      data.createdBy = this.req.currentUser._id;
      /********************************************************
      Create CMS Pages data into DB and validate
      ********************************************************/
      const cmsPagesData = await CMSPages.create(data);
      if (_.isEmpty(cmsPagesData)) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "CMS_PAGES_NOT_SAVED"
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
          "CMS_PAGES_ADDED_SUCCESSFULLY"
        )
      );
    } catch (error) {
      console.log("error cmspages()", error);
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
     @Purpose Edit CMSPages
     @Parameter {
        "pageData":"",
        "title":"",
        "slug":"",
        "metaTitle":"",
        "metaKeywords":"",
        "metaDescription":"",
        "id":""
     }
     @Return JSON String
  ********************************************************/
  async editPage() {
    try {
      /********************************************************
      Generate Field Array and process the request body
      ********************************************************/
      let fieldsArray = [
        "pageData",
        "title",
        "metaTitle",
        "metaKeywords",
        "metaDescription",
        "id",
      ];
      let data = await new RequestBody().processRequestBody(
        this.req.body,
        fieldsArray
      );

      data.modifiedBy = this.req.currentUser._id;
      let nameFilter = {
        _id: { $ne: ObjectId(data.id) },
        isDeleted: false,
      };
      let modifiedString = data.title
        .toString()
        .toLowerCase()
        .replace(/ /g, "");
      let isNameAvailable = await CMSPages.aggregate([
        {
          $match: {
            $expr: {
              $eq: [
                {
                  $toLower: {
                    $replaceAll: {
                      input: `$title`,
                      find: " ",
                      replacement: "",
                    },
                  },
                },
                modifiedString,
              ],
            },
            ...nameFilter,
          },
        },
      ]);
      if (!_.isEmpty(isNameAvailable)) {
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "CMS_PAGES_ALREADY_EXISTS"
          )
        );
      }

      /********************************************************
      Update CMS Page data into DB and validate
      ********************************************************/
      const cmsPageData = await CMSPages.findByIdAndUpdate(data.id, data, {
        new: true,
      }).exec();

      if (_.isEmpty(cmsPageData)) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "CMS_PAGES_NOT_UPDATED"
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
          "CMS_PAGES_UPDATED_SUCCESSFULLY"
        )
      );
    } catch (error) {
      console.log("error cmsPageEditError()", error);
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
    @Purpose CMS Pages Listing
    @Parameter
    {
       "page":1,
       "pagesize":10,
       "sort":{},
       "search":""
    }
    @Return JSON String
    ********************************************************/
  async cmsPagesListing() {
    try {
      // page
      let page = this.req.query.page ? this.req.query.page : 1;
      let pageSize = this.req.query.pageSize ? this.req.query.pageSize : 10;

      let sorting = { createdAt: -1 };
      if (!_.isEmpty(this.req.query.sort))
        sorting = JSON.parse(this.req.query.sort);

      let skip = (parseInt(page) - 1) * parseInt(pageSize);
      let where = { isDeleted: false };
      // for searching
      if (this.req.query.search) {
        where = {
          ...where,
          title: {
            $regex: Globals.escapeRegExp(this.req.query.search),
            $options: "i",
          },
        };
      }

      let cmsPagesList = await CMSPages.aggregate([
        { $match: where },
        {
          $lookup: {
            from: "admins",
            let: { id: "$createdBy" },
            pipeline: [
              { $match: { $expr: { $eq: ["$_id", "$$id"] } } },
              {
                $project: {
                  firstname: 1,
                  lastname: 1,
                  _id: 0,
                },
              },
            ],
            as: "createdBy",
          },
        },
        {
          $lookup: {
            from: "admins",
            let: { id: "$modifiedBy" },
            pipeline: [
              { $match: { $expr: { $eq: ["$_id", "$$id"] } } },
              {
                $project: {
                  firstname: 1,
                  lastname: 1,
                  _id: 0,
                },
              },
            ],
            as: "modifiedBy",
          },
        },
        {
          $facet: {
            count: [
              {
                $group: {
                  _id: null,
                  count: {
                    $sum: 1,
                  },
                },
              },
            ],
            data: [
              { $skip: skip },
              { $limit: parseInt(pageSize) },
              { $sort: sorting },
            ],
          },
        },
      ]);

      /********************************************************
            Generate and return response
            ********************************************************/
      if (_.isEmpty(cmsPagesList[0].data)) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.SUCCESS,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "NO_DATA_FOUND"
          )
        );
      }
      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "GET_DETAIL_SUCCESSFULLY"
        ),
        cmsPagesList[0].data,
        null,
        page,
        pageSize,
        cmsPagesList[0].count[0].count
      );
    } catch (error) {
      /********************************************************
             Manage Error logs and Response
             ********************************************************/
      console.log("error cmsPagesListing()", error);
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
     @Purpose delete cms Page
     @Parameter
     {
        "ids":[""],
     }
     @Return JSON String
     ********************************************************/
  async deleteCMSPage() {
    try {
      const currentUser =
        this.req.currentUser && this.req.currentUser._id
          ? this.req.currentUser._id
          : "";
      /********************************************************
      Update Delete Status
      ********************************************************/
      await CMSPages.updateMany(
        { _id: { $in: this.req.body.ids } },
        { $set: { isDeleted: true, deletedBy: currentUser } }
      ).exec();
      /********************************************************
        Generate and return response
      ********************************************************/
      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "CMS_PAGES_DELETED_SUCCESSFULLY"
        )
      );
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error deleteCMSPage()", error);
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
     @Purpose CMS Page Change Status
     @Parameter
     {
        "ids":[],
        "status":true/false
     }
     @Return JSON String
     ********************************************************/
  async changeCMSPagesStatus() {
    try {
      const currentUser =
        this.req.currentUser && this.req.currentUser._id
          ? this.req.currentUser._id
          : "";
      /********************************************************
          Update Status
          ********************************************************/
      await CMSPages.updateMany(
        { _id: { $in: this.req.body.ids } },
        { $set: { status: this.req.body.status, modifiedBy: currentUser } }
      ).exec();
      /********************************************************
            Generate and return response
          ********************************************************/
      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "STATUS_UPDATED_SUCCESSFULLY"
        )
      );
    } catch (error) {
      /********************************************************
          Manage Error logs and Response
          ********************************************************/
      console.log("error changeStaticPagesStatus()", error);
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
     @Purpose CMS Page Change Status
     @Parameter
     {
        "ids":[],
        "status":true/false
     }
     @Return JSON String
     ********************************************************/
  /********************************************************
     @Purpose Ansco Details
     @Parameter {id}
     @Return JSON String
     ********************************************************/
  async cmsPageDetails() {
    try {
      const cmsPageDetails = await CMSPages.find({
        _id: this.req.query.id,
        isDeleted: false,
      })
        .populate("createdBy", "firstname lastname")
        .populate("modifiedBy", "firstname lastname");

      if (!cmsPageDetails) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.SUCCESS,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "NO_DATA_FOUND"
          )
        );
      }

      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "GET_DETAIL_SUCCESSFULLY"
        ),
        cmsPageDetails
      );
    } catch (error) {
      /********************************************************
            Manage Error logs and Response
            ********************************************************/
      console.log("error cmsPageDetails()", error);
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
}

module.exports = CMSPagesController;
