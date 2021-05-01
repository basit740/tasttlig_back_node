"use strict";

// Libraries
const aws = require("aws-sdk");
const mobileS3UploaderRouter = require("express").Router();
const aws_region = process.env.AWS_DEFAULT_REGION;
const decode = require("base64-arraybuffer");
const axios = require("axios");

aws.config.update({
  region: aws_region,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const S3_BUCKET = process.env.S3_BUCKET;

mobileS3UploaderRouter.post("/mobile/s3_signed_url", async (req, res) => {
  const arrayBuffer = decode.decode(req.body.base64);
  const s3 = new aws.S3();

  const fileName = req.body.fileName;
  const fileType = req.body.fileType;

  const params = {
    Bucket: S3_BUCKET,
    Key: fileName,
    Expires: 500,
    ContentType: fileType,
    ACL: "public-read",
  };

  s3.getSignedUrlPromise("putObject", params)
    .then(function (url) {
      const data = {
        signedRequest: url,
        url: `https://s3.${aws_region}.amazonaws.com/${S3_BUCKET}/${fileName}`,
        arrayBuffer,
      };

      const doPut = async () => {
        let options = {
          headers: {
            "Content-Type": fileType,
          },
        };

        try {
          await axios.put(
            data.signedRequest,
            decode.decode(req.body.base64),
            options
          );
        } catch (error) {
          console.log(JSON.stringify(error));
          return {
            success: false,
            error: error.message,
          };
        }
      };
      doPut();
      res.json({ success: true, ...data });
    })
    .catch((error) => res.json({ success: false, error }));
});

module.exports = mobileS3UploaderRouter;
