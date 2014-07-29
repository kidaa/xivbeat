//Licensed under the ISC license.
//Copyright 2014 Yuki Ahmed

var express = require("express"),
    static = require("serve-static"),
    thunder = require("express-thunder"),
    app = express();

app.engine("thunder", thunder);
app.set("view engine", "thunder");
app.set("views", "./view");
app.use(static("./pub"));

var db = null;

require("./route/index.js")(app, db);

app.listen(process.env.VMC_PORT || process.env.PORT || 8080);
