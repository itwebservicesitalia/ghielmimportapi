// require("dotenv").config({ path: ".env" });

const express = require("express"),
  app = express(),
  cors = require("cors"),
  Handlebars = require("handlebars"),
  formidable = require("express-formidable"),
  fs = require("fs"),
  path = require("path");

const PORT = process.env.PORT || 1500;

const transporter = require("./config/smtp");

app.use(cors());

app.use(formidable());

app.listen(PORT, () => {
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

    const fileKeys = Object.keys(req.files);

    for (let i = 0; i < fileKeys.length; i++) {
      attachments.push({
        filename: req.files[fileKeys[i]].name,
        content: req.files[fileKeys[i]]
      });
    }

    let emailReceiver;

    switch (req.params.template) {
      case "cemento":
        emailReceiver = "info@ghielmimport.ch";
        break;
      case "ferro":
        emailReceiver = "antonio.colomban@ghielmimport.ch";
        break;
      default:
        emailReceiver = "valentina.giammito@ghielmimport.ch";
    }

    const mailOptions = {
      from: "noreply@ghielmimport.ch",
      to: emailReceiver,
      replyTo: req.fields.email,
      subject: `Nuova richiesta di offerta ${req.params.template}`,
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

    const clientEmail = fs.readFileSync(
      path.join(__dirname, `templates/risposta/${req.fields.language}.hbs`),
      "utf-8"
    );
    const clientTemplate = Handlebars.compile(clientEmail);

    const clientMailOptions = {
      from: "noreply@ghielmimport.ch",
      to: req.fields.email,
      subject: "Conferma ricezione richiesta d'offerta",
      html: clientTemplate()
    };

    transporter.sendMail(clientMailOptions);
  } catch (error) {
    res.status(404).json(error);
  }
});
