const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.sui-inter.net",
  port: 465,
  secure: true,
  auth: {
    user: "wed-usa.com@smtp.sui-inter.net",
    pass: "DER85rdRsee"
  }
});

module.exports = transporter;
