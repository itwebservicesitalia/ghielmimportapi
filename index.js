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

app.post("/:template", (req, res) => {
  try {
    //Load the email template from the /templates directory
    const source = fs.readFileSync(
      path.join(__dirname, `templates/${req.params.template}.hbs`),
      "utf-8"
    );

    const template = Handlebars.compile(source);

    const mailOptions = {
      from: "noreply@ghielmimport.ch",
      to: "rickybag99@gmail.com",
      replyTo: req.fields.email,
      subject: "Nuova richiesta di offerta",
      html: template(req.fields),
      attachments: [
        {
          filename: req.files.capitolato.name,
          content: req.files.capitolato
        },
        {
          filename: req.files.disegni.name,
          content: req.files.disegni
        }
      ]
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
