//Licensed under the ISC license.
//Copyright 2014 Yuki Ahmed

var express = require("express"),
    thunder = require("express-thunder"),
    subdomain = require("express-subdomain"),
    app = express();

app.engine("html", thunder);
app.set("view engine", "html");
app.set("views", "./view");
var db = null;

var params = {api: true, time: true, pf: false, main: true, rtma: true, hunt: false};

if(process.argv.length > 2) {
  for(var key in params) {
    params[key] = false;
  }

  for(var i = 1; i < process.argv.length; ++i) {
    var arg = process.argv[i];

    for(var key in params) {
      var l = key[0];
      if(arg == "--" + key || arg == "-" + l) {
        params[key] = true;
        console.log(key, "enabled");
      }
    }
  }
}

if(params.api === true) {
  console.log("API Loaded");
  require("./subdomain/api/")(app, db, subdomain, express.Router());
}
if(params.time === true) {
  console.log("Time Loaded");
  require("./subdomain/time/")(app, db, subdomain, express.Router());
}
if(params.pf === true) {
  console.log("PF Loaded");
  require("./subdomain/pf/")(app, db, subdomain, express.Router());
}
if(params.rtma === true) {
  console.log("Atma Loaded");
  require("./subdomain/atma/")(app, db, subdomain, express.Router());
}
if(params.main === true) {
  console.log("WWW Loaded");
  require("./route/index.js")(app, db, express.Router());
}
if(params.hunt === true) {
  console.log("Hunt Loaded");
  require("./subdomain/hunt/")(app, db, subdomain, express.Router());
}

process.on('uncaughtException', function(err) {
  console.log("ERR! "+err.stack);
});

app.listen(process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || process.env.VMC_PORT || 8080, process.env.OPENSHIFT_NODEJS_IP || "0.0.0.0", function() { console.log("started"); });
