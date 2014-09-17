//Licensed under the ISC license.
//Copyright 2014 Yuki Ahmed

//middleware because subdomain switch.
var lodestone = require("../../../../lib/lodestone.js"),
    path = require("path"),
    static = require("serve-static");

var LODESTONE_10 = function(db, router) {

  router.use(static(path.resolve(__dirname, "pub")));

  router.get({
    endpoint: "character/:id",
    expires: 1000 * 60 * 60 * 24
  }, function(req, res, next) {
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
          res.end(result, 1000 * 60 * 60 * 24);
        }
      });
    } else {
      res.end(ch || {}, cache.getRemaining("CHARACTER#"+id+("no_icons" in req.query ? "NO_ICONS" : "ICONS")));
    }
  });

  router.get({
    endpoint: "company/:id",
    expires: 1000 * 60 * 60 * 24
  }, function(req, res, next) {
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
          res.end(result, 1000 * 60 * 60 * 24);
        }
      });
    } else {
      res.end(ch || {}, cache.getRemaining("FC#"+id));
    }
  });

  return router;
}

exports = module.exports = LODESTONE_10;
