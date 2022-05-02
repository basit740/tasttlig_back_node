// Libraries
const nodemailer = require("nodemailer");
const aws = require("aws-sdk");
const hbs = require("nodemailer-express-handlebars");
const current_file_path = require("path").dirname(__filename);

aws.config.update({
  region: process.env.AWS_DEFAULT_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

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
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: "keara.block@ethereal.email",
      pass: "hbGChvzjwgRwWUeewC",
    },
  };
}

let options = {
  viewEngine: {
    extname: ".hbs",
    layoutsDir: current_file_path + "../../../public/emails/",
    defaultLayout: "main",
    partialsDir: current_file_path + "../../../public/emails/partials/",
  },
  viewPath: current_file_path + "../../../public/emails/",
  extName: ".hbs",
};

let nodemailer_transporter = nodemailer.createTransport(mailConfig);
nodemailer_transporter.use("compile", hbs(options));

module.exports = {
  nodemailer_transporter,
};
