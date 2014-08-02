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

app.listen(process.env.VMC_PORT || process.env.PORT || 8080);
