//Licensed under the ISC license.
//Copyright 2014 Yuki Ahmed

//middleware because subdomain switch.
var aetheryte = require("../../../../lib/aetheryte.js");

var AETHERYTE_10 = function(db, router) {

  router.get({
    endpoint: "time",
    expires: 1
  }, function(req, res, next) {
    console.log(req.params);
    var epoch = aetheryte.formatTime(aetheryte.getEorzeaTime());
    if(req.params._type == "txt") {
      res.end(epoch.string, 0);
    } else {
      res.end(epoch, 0);
    }
  });

  router.get({
    endpoint: "epoch",
    expires: 1
  }, function(req, res, next) {
    var epoch = aetheryte.getEorzeaTime();
    if(req.params._type == "txt") {
      res.end(epoch.toString(), 0);
    } else {
      res.end({epoch: epoch}, 0);
    }
  });

  return router;
}

exports = module.exports = AETHERYTE_10;
