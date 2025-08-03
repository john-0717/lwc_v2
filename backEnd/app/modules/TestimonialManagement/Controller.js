const Controller = require("../Base/Controller");
const Globals = require("../../../configs/Globals");
const CommonService = require("../../services/Common");
const RequestBody = require("../../services/RequestBody");
const Email = require("../../services/Email");
const { HTTP_CODE } = require("../../services/constant");
const ObjectId = require("mongoose").Types.ObjectId;
const _ = require("lodash");
const Testimonial = require("./Schema").testimonials;

class TestimonialManagementController extends Controller {
  constructor() {
    super();
  }

    /********************************************************
     @Purpose Add Testimonial
     @Parameter {
        "title":"",
        "imageUrl":"",
        "description":""
     }
     @Return JSON String
  ********************************************************/

     async addTestimonial(){

        try{
            /********************************************************
          Generate Field Array and process the request body
          ********************************************************/
          let fieldsArray = ["title", "imageUrl", "description", "testimonialDesignation"];
          let data = await (new RequestBody()).processRequestBody(this.req.body, fieldsArray);
    
          let isNameAvailable = await new CommonService().nameValidator({
            model: Testimonial,
            searchString: data.title,
            field: 'title'
          });
          if (!_.isEmpty(isNameAvailable)) {
            return new CommonService().handleResolve(
              this.res,
              HTTP_CODE.FAILED,
              HTTP_CODE.SUCCESS_CODE,
              await new CommonService().setMessage(
                this.req.currentUserLang,
                "TESTIMONIAL_ALREADY_EXISTS"
              )
            );
          }
          data.createdBy = this.req.currentUser._id;
          /********************************************************
          Create CMS Pages data into DB and validate
          ********************************************************/
          const testimonialData = await Testimonial.create(data);
          if (_.isEmpty(testimonialData)) {
            return new CommonService().handleReject(this.res, HTTP_CODE.FAILED, HTTP_CODE.SUCCESS_CODE, await new CommonService().setMessage(this.req.currentUserLang, "TESTIMONIAL_NOT_CREATED"))
          }
          /********************************************************
          Generate and return response
          ********************************************************/
          return new CommonService().handleResolve(this.res, HTTP_CODE.SUCCESS, HTTP_CODE.SUCCESS_CODE, await new CommonService().setMessage(this.req.currentUserLang, "TESTIMONIAL_ADDED_SUCCESSFULLY"));
    
        } catch(error){
            console.log("error testimonial()", error);
          return new CommonService().handleReject(this.res, HTTP_CODE.FAILED, HTTP_CODE.SERVER_ERROR_CODE, await new CommonService().setMessage(this.req.currentUserLang, "SERVER_ERROR"))
    
        } 
    
      }

       /********************************************************
     @Purpose Edit Testimonial
     @Parameter {
        "title":"",
        "imageUrl":"",
        "description":"",
        "id":""
     }
     @Return JSON String
  ********************************************************/
 async editTestimonial(){
    try {

          /********************************************************
      Generate Field Array and process the request body
      ********************************************************/
      let fieldsArray = ["title", "imageUrl", "description", "testimonialDesignation", "id"];
      let data = await (new RequestBody()).processRequestBody(this.req.body, fieldsArray);

      data.modifiedBy = this.req.currentUser._id;
      let nameFilter = {
        _id: { $ne: ObjectId(data.id) },
      };

      let isNameAvailable = await new CommonService().nameValidator({
        model: Testimonial,
        searchString: data.title,
        field: 'title',
        filter: nameFilter
      });
      if (!_.isEmpty(isNameAvailable)) {
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "TESTIMONIAL_ALREADY_EXISTS"
          )
        );
      }

      
      /********************************************************
      Update testimonial data into DB and validate
      ********************************************************/
      const testimonialData = await Testimonial.findByIdAndUpdate(
        data.id,
        data,
        { new: true }
      ).exec();

      if (_.isEmpty(testimonialData)) {
        return new CommonService().handleReject(this.res, HTTP_CODE.FAILED, HTTP_CODE.SUCCESS_CODE, await new CommonService().setMessage(this.req.currentUserLang, "TESTIMONIAL_NOT_UPDATED"));
      }

      /********************************************************
      Generate and return response
      ********************************************************/
      return new CommonService().handleResolve(this.res, HTTP_CODE.SUCCESS, HTTP_CODE.SUCCESS_CODE, await new CommonService().setMessage(this.req.currentUserLang, "TESTIMONIAL_UPDATED_SUCCESSFULLY"));


    } catch (error) {

      console.log("error testimonialEditError()", error);
      return new CommonService().handleReject(this.res, HTTP_CODE.FAILED, HTTP_CODE.SERVER_ERROR_CODE, await new CommonService().setMessage(this.req.currentUserLang, "SERVER_ERROR"))

    }
 }

 /********************************************************
    @Purpose Testimonial Listing
    @Parameter
    {
       "page":1,
       "pagesize":10,
       "sort":{},
       "search":""
    }
    @Return JSON String
    ********************************************************/
    async testimonialListing() {
        try {
          // page
          let page = this.req.query.page ? this.req.query.page : 1;
          let pageSize = this.req.query.pageSize ? this.req.query.pageSize : 10;
    
          let sorting = { createdAt: -1 };
          if (!_.isEmpty(this.req.query.sort))
            sorting = JSON.parse(this.req.query.sort);
    
          let skip = (parseInt(page) - 1) * parseInt(pageSize);
          let where = {isDeleted:false};
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
    
          let testimonialList = await Testimonial.aggregate([
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
                        _id: 0
                      }
                    }
                  ],
                  as: "createdBy"
                }
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
                        _id: 0
                      }
                    }
                  ],
                  as: "modifiedBy"
                }
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
            }
            
          ]);

         
          /********************************************************
            Generate and return response
            ********************************************************/
        if(_.isEmpty(testimonialList[0].data)){
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
            testimonialList[0].data,
            null,
            page,
            pageSize,
            testimonialList[0].count[0].count
          );
        } catch (error) {
          /********************************************************
             Manage Error logs and Response
             ********************************************************/
          console.log("error testimonialListing()", error);
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
     @Purpose delete Testimonial
     @Parameter
     {
        "ids":[""],
     }
     @Return JSON String
     ********************************************************/
  async deleteTestimonial() {
    try {
        const currentUser =
                this.req.currentUser && this.req.currentUser._id
                ? this.req.currentUser._id
                : "";
      /********************************************************
      Update Delete Status
      ********************************************************/
      await Testimonial.updateMany(
        { _id: { $in: this.req.body.ids } },
        { $set: { isDeleted: true , deletedBy: currentUser } }
      ).exec();
      /********************************************************
        Generate and return response
      ********************************************************/
      return new CommonService().handleResolve(this.res, HTTP_CODE.SUCCESS, HTTP_CODE.SUCCESS_CODE, await new CommonService().setMessage(this.req.currentUserLang, "TESTIMONIAL_DELETED_SUCCESSFULLY"));
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error deleteTestimonial()", error);
      return new CommonService().handleReject(this.res, HTTP_CODE.FAILED, HTTP_CODE.SERVER_ERROR_CODE, await new CommonService().setMessage(this.req.currentUserLang, "SERVER_ERROR"))
    }
  }

      
       /********************************************************
     @Purpose Testimonial Details
     @Parameter {id}
     @Return JSON String
     ********************************************************/
    async testimonialDetails(){
        try{
            const testimonialDetails = await Testimonial.find({
              _id: this.req.query.id,isDeleted:false
            }).populate('createdBy', 'firstname lastname').populate('modifiedBy', 'firstname lastname');
    
            if (!testimonialDetails) {
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
              await new CommonService().setMessage(this.req.currentUserLang, "GET_DETAIL_SUCCESSFULLY"),
              testimonialDetails
            );


        } catch (error) {
              /********************************************************
            Manage Error logs and Response
            ********************************************************/
          console.log("error testimonialDetails()", error);
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

module.exports = TestimonialManagementController;