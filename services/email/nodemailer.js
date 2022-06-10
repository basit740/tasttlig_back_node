// Libraries
const nodemailer = require("nodemailer");
const aws = require("aws-sdk");
const hbs = require("nodemailer-express-handlebars");
const current_file_path = require("path").dirname(__filename);
require("dotenv").config();

aws.config.update({
  region: process.env.AWS_DEFAULT_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const devMailSettings = {
  host: process.env.DEV_MAIL_HOST ?? "smtp.ethereal.email",
  port: process.env.DEV_MAIL_PORT ?? 587,
  auth: {
    user: process.env.DEV_MAIL_USER ?? "keara.block@ethereal.email",
    pass: process.env.DEV_MAIL_PASSWORD ?? "hbGChvzjwgRwWUeewC",
  },
};

let mailConfig;
if (process.env.NODE_ENV === "production") {
  mailConfig = {
    SES: new aws.SES({
      apiVersion: "2010-12-01",
    }),
  };
} else if (process.env.NODE_ENV === "staging") {
  // Use Ethereal mail in testing environment
  // https://ethereal.email/
  mailConfig = {
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: "keara.block@ethereal.email",
      pass: "hbGChvzjwgRwWUeewC",
    },
  };
} else {
  mailConfig = {
    ...devMailSettings
  }
}

let options = {
  viewPath: current_file_path + "../../../public/emails/",
  extName: ".hbs",
  viewEngine: {
    extname: ".hbs",
    layoutsDir: current_file_path + "../../../public/emails/",
    defaultLayout: "main",
    partialsDir: current_file_path + "../../../public/emails/partials/",
    helpers: {
      year: function () {
        return new Date().getFullYear();
      }
    }
  }
};

let nodemailer_transporter = nodemailer.createTransport(mailConfig);
nodemailer_transporter.use("compile", hbs(options));

module.exports = {
  nodemailer_transporter,
};
