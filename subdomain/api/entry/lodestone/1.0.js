//Licensed under the ISC license.
//Copyright 2014 Yuki Ahmed

//middleware because subdomain switch.
var cache = require("../../../../lib/cache.js"),
    lodestone = require("../../../../lib/lodestone.js"),
    path = require("path"),
    static = require("serve-static");

var LODESTONE_10 = function(app, db, router) {

  router.use(static(path.resolve(__dirname, "pub")));

  router.get("/", function(req, res) {
    return res.end({
      root: {
        url: req.protocol + "://" + req.get("host") + "/lodestone/1.0/",
        params: [],
        expires: 0
      },
      character: {
        url: req.protocol + "://" + req.get("host") + "/lodestone/1.0/character/:id.json",
        params: ["no_icons"],
        expires: 1000 * 60 * 60 * 24
      },
      freeCompany: {
        url: req.protocol + "://" + req.get("host") + "/lodestone/1.0/company/:id.json",
        params: [],
        expires: 1000 * 60 * 60 * 24
      }
    });
  });

  router.get("/character/:id.json", function(req, res, next) {
    var id = req.params.id;
    var ch = cache.get("CHARACTER#"+id+("no_icons" in req.query ? "NO_ICONS" : "ICONS"));
    if(ch === null) {
      lodestone.getCharacterInfo(id, !("no_icons" in req.query), function(err, result) {
        if(err != null) {
          res.send(500);
          return res.end({error: err});
        } else if(err == null && result == null) {
          res.status = 404;
          return next();
        } else {
          result.expires = Date.now() + 1000 * 60 * 60 * 24;
          cache.set("CHARACTER#"+id+("no_icons" in req.query ? "NO_ICONS" : "ICONS"), result, 1000 * 60 * 60 * 24);
          res.end(result);
        }
      });
    } else {
      res.end(ch || {});
    }
  });

  router.get("/company/:id.json", function(req, res, next) {
    var id = req.params.id;
    var ch = cache.get("FC#"+id);
    if(ch === null) {
      lodestone.getFreeCompanyInfo(id, function(err, result) {
        if(err != null) {
          res.send(500);
          return res.end({error: err});
        } else if(err == null && result == null) {
          res.status = 404;
          return next();
        } else {
          result.expires = Date.now() + 1000 * 60 * 60 * 24;
          cache.set("FC#"+id, result, 1000 * 60 * 60 * 24);
          res.end(result);
        }
      });
    } else {
      res.end(ch || {});
    }
  });

  return router;
}

exports = module.exports = LODESTONE_10;
