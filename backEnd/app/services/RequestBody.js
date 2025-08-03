/****************************
 PROCESS REQUEST BODY
 ****************************/

class RequestBody {
  processRequestBody(body, fieldsArray) {
    return new Promise((resolve, reject) => {
      try {
        let data = {};
        fieldsArray.forEach((field) => {
          // field in body && typeof body[field] != "undefined" ? data[field] = typeof body[field] === 'string' ? body[field].trim() : body[field] : delete data[field]

          if (field in body && typeof body[field] != "undefined") {
            if (typeof body[field] === "string") {
              data[field] = body[field].trim();
            } else {
              data[field] = body[field];
            }
          } else {
            delete data[field];
          }
        });
        return resolve(data);
      } catch (error) {
        return reject({ status: 0, message: error });
      }
    });
  }
  checkEmptyWithFields(body, fieldsArray) {
    return new Promise((resolve, reject) => {
      try {
        let requiredFields = [];
        fieldsArray.forEach((element) => {
          if (
            !(element in body) ||
            body[element] === "" ||
            typeof body[element] === "undefined"
          ) {
            requiredFields.push(element);
          }
        });
        resolve(requiredFields);
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = RequestBody;
