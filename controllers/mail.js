// controllers/mailController.js
const nodemailer = require("nodemailer");
const path = require("path");
require("dotenv").config();

var flag = true;

// Connect to the smtp server..
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: process.env.USER,
    pass: process.env.APP_PASSWORD,
  },
});

const sendE = async (transporter, info) => {
  try {
    await transporter.sendMail(info);
    flag = true;
    console.log("Email has been sent successfully");
  } catch (error) {
    flag = false;
    console.log("Error while sending email", error);
  }
};

const sendEmailsController = (req, res) => {
  console.log(req.body.to);
  console.log(req.body.subject);
  console.log(req.body.text);
  //console.log(req.body.attachment);

  // const { field, originalname, encoding, mimetype, size } = req.file;

  // console.log(`Field: ${field}`);
  // console.log(`Original Name: ${originalname}`);
  // console.log(`Encoding: ${encoding}`);
  //console.log(`Mime Type: ${mimetype}`);
  // console.log(`Size: ${size} bytes`);

  const fileBuffer = req.file.buffer;
  const name = req.file.originalname;

  const type = req.file.mimetype;
  const field = req.file.fieldname;
  const size = req.file.size;
  const encoding = req.file.encoding;

  console.log(size);
  console.log(field);
  console.log(encoding);
  console.log(type);

  //object destructuring
  const { to, subject, text } = req.body;

  const info = {
    from: {
      name: "Gangstar🖤💲🖤",
      address: process.env.USER,
    },
    to: to, //value of to,subject ,text is given in frontend
    subject: subject,
    text: text,
    html: "<b>Hello world</b>",
    attachments: [
      {
        filename: name, // Use the original filename from the uploaded file
        // path:path.join(__dirname,"files","Thomas.jpg"),
        content: fileBuffer,
        encoding: encoding,
      },
    ],
  };

  sendE(transporter, info);

  if (flag) {
    res.render("emailsuc");
  } else {
    res.render("emailfail");
  }
};

module.exports = sendEmailsController;
