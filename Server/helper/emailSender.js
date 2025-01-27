const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "jephyjvarghese@gmail.com",
    pass: "gjlp asml djup ndyt",
  },
});
module.exports = transporter;
