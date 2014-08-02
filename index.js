//Licensed under the ISC license.
//Copyright 2014 Yuki Ahmed

var express = require("express"),
    static = require("serve-static"),
    thunder = require("express-thunder"),
    app = express();

app.engine("html", thunder);
app.set("view engine", "html");
app.set("views", "./view");
app.set("domain", process.env.OPENSHIFT_NODEJS_IP || "0.0.0.0");
app.set("port", process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 8080);

var db = null;

app.use(require("./route/api")(db));
app.use(static("./pub"));

require("./route/index.js")(app, db);

app.listen();
