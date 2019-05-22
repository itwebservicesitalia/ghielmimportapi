const express = require("express"),
  app = express(),
  cors = require("cors"),
  Handlebars = require("handlebars"),
  formidable = require("express-formidable"),
  fs = require("fs"),
  path = require("path"),
  uuid = require("uuid/v4");

const transporter = require("./config/smtp");

app.use(cors());

app.use(formidable());

app.listen(1500, () => {
  console.log("Server running on port 1500");
});

app.get("/", (req, res) => {
  res.send("Ghielmimport API");
});

app.post("/:template", (req, res) => {
  try {
    //Load the email template from the /templates directory
    const source = fs.readFileSync(
      path.join(__dirname, `templates/${req.params.template}.hbs`),
      "utf-8"
    );

    const template = Handlebars.compile(source);

    const attachments = [];

    for (let i = 0; i < req.files.length; i++) {
      if (req.files[i]) {
        attachments.push({
          filename: req.files[i].name,
          content: req.files[i]
        });
      }
    }
    const mailOptions = {
      from: "noreply@ghielmimport.ch",
      to: "rickybag99@gmail.com",
      replyTo: req.fields.email,
      subject: "Nuova richiesta di offerta",
      html: template(req.fields),
      attachments: attachments
    };

    transporter.sendMail(mailOptions, function(error, info) {
      if (error) {
        res.send(error);
      } else {
        res.send(info);
      }
    });
  } catch (error) {
    res.status(404).json(error);
  }
});
