/****************************
 FILE HANDLING OPERATIONS
 ****************************/
const _ = require("lodash");
let path = require("path");
const aws = require("aws-sdk");
const mv = require("mv");
const sharp = require("sharp");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
const configs = require("../../configs/configs");
const { fs } = require("file-system");
ffmpeg.setFfmpegPath(ffmpegPath);

let s3, s3bucketName, s3EndpointURL, s3FolderName;
if (configs.s3upload === "true") {
  aws.config.update({
    apiVersion: "2006-03-01",
    secretAccessKey: configs.s3SecretAccessKey,
    accessKeyId: configs.s3AccessKeyId,
    region: configs.s3Region,
  });
  s3 = new aws.S3();
  s3bucketName = configs.s3Bucket;
  s3EndpointURL = configs.s3Endpoint;
  s3FolderName = configs.s3folder;
}

class File {
  constructor(file, location) {
    this.file = file;
    this.location = location;
  }

  /** Method to store any file as it is */

  /** Method to store any file as it is */
  store(data) {
    return new Promise((resolve, reject) => {
      if (_.isEmpty(this.file)) {
        reject("Please send file.");
      }

      let fileName = this.file.originalFilename.split(".");
      let ext = _.last(fileName);
      let imagePath =
        data && data.imagePath ? data.imagePath : "/public/upload/images/";
      let name = `${ext}_${Date.now().toString()}.${ext}`;
      let filePath = imagePath + name;
      let fileObject = { filePath: name };
      mv(this.file.path, appRoot + filePath, { mkdirp: true }, function (err) {
        if (err) {
          reject(err);
        }
        if (!err) {
          resolve(fileObject);
        }
      });
    });
  }

  /** Method to store Compressed Image file */
  storeImage(file_extension, width = undefined, height = undefined) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          if (_.isEmpty(this.file?.file)) {
            return reject("Please send file.");
          }
          if (file_extension !== "ico" && file_extension !== "gif") {
            console.log(this.file.file[0].path);
            let imagePath = this.file.file[0].path;
            let fileObject = await this.compressImage(imagePath, width, height);
            return resolve(fileObject);
          } else {
            let imagePath = this.file.file[0].path;
            let fileObject = await this.uploadMedia(imagePath, file_extension);
            return resolve(fileObject);
          }
        } catch (error) {
          console.log("error- StoreImage", error);
          return reject(error);
        }
      })();
    });
  }

  /** Method to store Compressed Video file */
  storeVideo() {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          if (_.isEmpty(this.file.file)) {
            return reject("Please send file.");
          }
          const fileSize = this.file.file[0].size;
          const maxSize = 30 * 1024 * 1024; // 30MB

          if (fileSize > maxSize) {
            return reject("File size exceeds the maximum limit of 30MB.");
          }
          let videoPath = this.file.file[0].path;
          let fileObject = await this.compressVideo(videoPath, "webm");
          return resolve(fileObject);
        } catch (error) {
          console.log("error- storeVideo", error);
          return reject(error);
        }
      })();
    });
  }

  /** Function to Compress and Write file */
  uploadMedia(imagePath, file_extension) {
    return new Promise((resolve, reject) => {
      let name = `media_${Date.now().toString()}.${file_extension}`;
      let filePath = path.join(appRoot, "/public/upload/images/" + name);
      let fileObject = { filePath: name };
      if (configs.s3upload === "true") {
        fs.readFile(imagePath, function (err, data) {
          let params = {
            Bucket: s3bucketName,
            Key: s3FolderName + "/" + name,
            Body: data,
          };
          let finalData = {};
          s3.putObject(params, function (error, res) {
            if (error) {
              console.log("ERROR IN S3: ", error);
              return reject(error);
            } else {
              finalData.filePath = s3FolderName + "/" + name;
              finalData.Location = `${s3EndpointURL}${
                s3FolderName + "/" + name
              }`;

              return resolve(finalData);
            }
          });
        });
      } else {
        fs.readFile(imagePath, function (error, data) {
          fs.writeFile(filePath, data, function (err) {
            if (err) {
              return reject(err);
            }
            return resolve(fileObject);
          });
        });
      }
    });
  }

  /** Function to Compress and Write file */
  compressImage(imagePath, size, height = undefined) {
    return new Promise((resolve, reject) => {
      (async () => {
        let name = `imageCompress${
          size ? "_" + size : ""
        }_${Date.now().toString()}.webp`;
        let filePath = path.join(appRoot, "/public/upload/images/" + name);
        let fileObject = { filePath: name };
        if (configs.s3upload === "true") {
          if (size && height) {
            await sharp(imagePath)
              .resize({ width: size, height: height })
              .webp({ quality: 100 })
              .toBuffer()
              .then((data) => {
                let params = {
                  Bucket: s3bucketName,
                  Key: s3FolderName + "/" + name,
                  Body: data,
                  ContentType: "image/webp",
                };
                let finalData = {};
                s3.putObject(params, function (error, res) {
                  if (error) {
                    return reject(error);
                  } else {
                    finalData.filePath = s3FolderName + "/" + name;
                    finalData.Location = `${s3EndpointURL}${
                      s3FolderName + "/" + name
                    }`;
                    console.log(
                      "---->Upload Successfully For check use " +
                        s3EndpointURL +
                        s3FolderName +
                        "/" +
                        name
                    );
                    return resolve(finalData);
                  }
                });
              })
              .catch((err) => {
                console.log("error- compressImage", err);
                reject(JSON.stringify(err));
              });
          } else {
            await sharp(imagePath)
              .webp({ quality: 100 })
              .toBuffer()
              .then((data) => {
                let params = {
                  Bucket: s3bucketName,
                  Key: s3FolderName + "/" + name,
                  Body: data,
                  ContentType: "image/webp",
                };
                let finalData = {};
                s3.putObject(params, function (error, res) {
                  if (error) {
                    return reject(error);
                  } else {
                    finalData.filePath = s3FolderName + "/" + name;
                    finalData.Location = `${s3EndpointURL}${
                      s3FolderName + "/" + name
                    }`;
                    console.log(
                      "---->Upload Successfully For check use " +
                        s3EndpointURL +
                        s3FolderName +
                        "/" +
                        name
                    );
                    return resolve(finalData);
                  }
                });
              })
              .catch((err) => {
                console.log("error- compressImage", err);
                reject(JSON.stringify(err));
              });
          }
        } else {
          await sharp(imagePath)
            .resize({ width: size, height: undefined })
            .webp({ quality: 100 })
            .toFile(filePath)
            .then(() => {
              resolve(fileObject);
            })
            .catch((err) => {
              console.log("error- compressImage", err);
              reject(JSON.stringify(err));
            });
        }
      })();
    });
  }

  /** Function to Compress and Write file */
  compressVideo(videoPath, format) {
    return new Promise((resolve, reject) => {
      let name = `videoCompress_${Date.now().toString()}.${format}`;

      let command = ffmpeg(videoPath).format(format);

      fs.readFile(videoPath, function (err, data) {
        let params = {
          Bucket: s3bucketName,
          Key: s3FolderName + "/" + name,
          Body: data,
        };
        let finalData = {};
        s3.putObject(params, function (error, res) {
          if (error) {
            console.log("ERROR IN S3: ", error);
            return reject(error);
          } else {
            finalData.filePath = s3FolderName + "/" + name;
            finalData.Location = `${s3EndpointURL}${s3FolderName + "/" + name}`;

            command.on("error", function () {
              console.log("Ffmpeg has been killed");
              reject("Ffmpeg has been killed");
            });

            return resolve(finalData);
          }
        });
      });
    });
  }

  /** remove Imge from s3 */

  removeImageFromS3Bucket(fileName) {
    return new Promise((resolve, reject) => {
      let path = fileName;
      var params = {
        Bucket: s3bucketName,
        Key: path,
      };
      s3.deleteObject(params, async function (err, res) {
        if (err) {
          return reject(err, null);
        } else {
          console.log(
            "---->Deleted Sucessfully For check use " + s3EndpointURL + path
          );
          resolve({ status: 1, msg: "Deleted successfully" });
        }
      });
    });
  }

  /** Method to upload file (pdf) */
  storeFile(file_extension) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          if (_.isEmpty(this.file.file)) {
            return reject("Please send a file.");
          }

          const fileSize = this.file.file[0].size;
          const maxSize = 30 * 1024 * 1024; // 30MB

          if (fileSize > maxSize) {
            return reject("File size exceeds the maximum limit of 30MB.");
          }

          if (file_extension !== "pdf") {
            return reject("Invalid file extension.");
          }

          let docPath = this.file.file[0].path;
          let fileObject;

          fileObject = await this.uploadDocument(docPath, file_extension);

          return resolve(fileObject);
        } catch (error) {
          console.log("error - storeFile", error);
          return reject(error);
        }
      })();
    });
  }

  /** Function to Compress and Write file */
  uploadDocument(docPath, file_extension) {
    return new Promise((resolve, reject) => {
      let name = `media_${Date.now().toString()}.${file_extension}`;
      let filePath = path.join(appRoot, "/public/upload/images/" + name);
      let fileObject = { filePath: name };
      if (configs.s3upload === "true") {
        fs.readFile(docPath, function (err, data) {
          let params = {
            Bucket: s3bucketName,
            Key: s3FolderName + "/" + name,
            Body: data,
          };
          let finalData = {};
          s3.putObject(params, function (error, res) {
            if (error) {
              console.log("ERROR IN S3: ", error);
              return reject(error);
            } else {
              finalData.filePath = s3FolderName + "/" + name;
              finalData.Location = `${s3EndpointURL}${
                s3FolderName + "/" + name
              }`;

              return resolve(finalData);
            }
          });
        });
      } else {
        fs.readFile(docPath, function (error, data) {
          fs.writeFile(filePath, data, function (err) {
            if (err) {
              return reject(err);
            }
            return resolve(fileObject);
          });
        });
      }
    });
  }
}

module.exports = File;
