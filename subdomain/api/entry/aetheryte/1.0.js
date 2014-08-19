//Licensed under the ISC license.
//Copyright 2014 Yuki Ahmed

//middleware because subdomain switch.
var aetheryte = require("../../../../lib/aetheryte.js");

var AETHERYTE_10 = function(app, db, router) {

  router.get("/", function(req, res) {
    return res.end({
      root: {
        url: req.protocol + "://" + req.get("host") + "/aetheryte/1.0/",
        params: [],
        expires: 0
      },
      time: {
        url: req.protocol + "://" + req.get("host") + "/aetheryte/1.0/time.json",
        params: [],
        expires: 1
      },
      epoch: {
        url: req.protocol + "://" + req.get("host") + "/aetheryte/1.0/epoch.json",
        params: [],
        expires: 1
      }
    });
  });

  router.get("/time.:format", function(req, res, next) {
    var epoch = aetheryte.formatTime(aetheryte.getEorzeaTime());
    if(req.params.format == "txt") {
      res.end(epoch.string);
    } else {
      res.end(epoch);
    }
  });
  router.get("/epoch.:format", function(req, res, next) {
    var epoch = aetheryte.getEorzeaTime();
    if(req.params.format == "txt") {
      res.end(epoch.toString());
    } else {
      res.end({epoch: epoch});
    }
  });

  return router;
}

exports = module.exports = AETHERYTE_10;
