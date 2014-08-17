//Licensed under the ISC license.
//Copyright 2014 Yuki Ahmed

//middleware because subdomain switch.
var path = require("path"),
    static = require("serve-static"),
    Router = require("express").Router;

var API = function(app, db, subdomain, root) {
  root.use(function(req, res, next) {
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Origin", "*");

    res._end = res.end;
    res.end = function(msg) {
      if(typeof msg == "object" && !Buffer.isBuffer(msg)) {
        msg = JSON.stringify(msg);
        res.header("Content-Type", "application/json");
      }

      res._end(msg);
    }
    next();
  });

  root.use(static(path.resolve(__dirname, "pub")));

  root.use("/frontier/1.0", require("./entry/frontier/1.0")(app, db, Router()));

  root.get("/", function(req, res) {
    res.end({
      frontier: {
        "1.0": req.protocol + "://" + req.get("host") + "/frontier/1.0/"
      }
    });
  });

  root.use(function(err, req, res, next) {
    if(err.status === 404) {
      next();
    }
    res.end({error: err.message, stack: err.stack});
  });

  root.use(function(req, res) {
    res.end({error: "we lost the unicorns"});
  });

  app.use(subdomain("api", root));
}

exports = module.exports = API;
