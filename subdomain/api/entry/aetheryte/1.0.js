//Licensed under the ISC license.
//Copyright 2014 Yuki Ahmed

//middleware because subdomain switch.
var aetheryte = require("../../../../lib/aetheryte.js");

var AETHERYTE_10 = function(db, router) {

  router.get({
    endpoint: "time",
    expires: 1
  }, function(req, res, next) {
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

  router.get({
    endpoint: "ace",
    expires: 1
  }, function(req, res, next) {
    var ace = aetheryte.getEorzeaTimeAce();
    if(req.params._type == "txt") {
      res.end(ace.string, 0);
    } else {
      res.end(ace, 0);
    }
  });

  router.get({
    endpoint: "acepoch",
    expires: 1
  }, function(req, res, next) {
    var epoch = aetheryte.getEorzeaTimeAce().epoch;
    if(req.params._type == "txt") {
      res.end(epoch.toString(), 0);
    } else {
      res.end({epoch: epoch}, 0);
    }
  });

  router.get({
    endpoint: "element",
    expires: 1
  }, function(req, res, next) {
    var element = aetheryte.getElement();
    if(req.params._type == "txt") {
      res.end((element.astral ? "astral" : "umbral") + " " + element.hour, 0);
    } else {
      res.end(element, 0);
    }
  });

  router.get({
    endpoint: "moon",
    expires: 1
  }, function(req, res, next) {
    var moon = aetheryte.getMoonPhase();
    if(req.params._type == "txt") {
      res.end(moon.moon, 0);
    } else {
      res.end(moon, 0);
    }
  });

  return router;
}

exports = module.exports = AETHERYTE_10;
