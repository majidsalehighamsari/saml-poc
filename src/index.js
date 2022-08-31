const express = require("express");
const app = express();
const fs = require("fs");
const bodyParser = require("body-parser");
const saml = require("samlify");
const validator = require("@authenio/samlify-node-xmllint");

saml.setSchemaValidator(validator);

const sp = saml.ServiceProvider({
  metadata: fs.readFileSync("./metadata_sp.xml"),
  privateKey: fs.readFileSync("./encryptKey.pem"),
  privateKeyPass: "foobar"
});

const idp = saml.IdentityProvider({
  metadata: fs.readFileSync("./metadata_idp.xml")
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function(req, res) {
  res.write("Ola..");
  res.end();
});

app.get("/login", (req, res) => {
  const { id, context } = sp.createLoginRequest(idp, "redirect");

  console.log(context);
  console.log(id);
});

app.post("/xyz/custom-saml/callback", (req, res) => {
  sp.parseLoginResponse(idp, "post", req)
    .then(parseResult => {
      res.status(200).send({ success: true });
    })
    .catch(console.error);
});

app.listen(8080, function() {
  console.log("server on 8080");
});
