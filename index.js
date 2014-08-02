//Licensed under the ISC license.
//Copyright 2014 Yuki Ahmed

var express = require("express"),
    static = require("serve-static"),
    thunder = require("express-thunder"),
    app = express();

app.engine("html", thunder);
app.set("view engine", "html");
app.set("views", "./view");
var db = null;

app.use(require("./route/api")(db));
app.use(static("./pub"));

require("./route/index.js")(app, db);

app.listen(process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || process.env.VMC_PORT || 8080, process.env.OPENSHIFT_NODEJS_IP || "0.0.0.0", function() { console.log("started"); });
