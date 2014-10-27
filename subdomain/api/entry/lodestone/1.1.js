//Licensed under the ISC license.
//Copyright 2014 Yuki Ahmed

//middleware because subdomain switch.
var lodestone = require("../../../../lib/lodestone.js"),
    path = require("path"),
    static = require("serve-static");

var LODESTONE_10 = function(db, router) {

  router.use(static(path.resolve(__dirname, "pub")));

  var map = {
    "basic": "",
    "grandcompany": "grandCompany",
    "company": "freeCompany",
    "equipment": "items",
    "resistances": "elements",
    "minouts": ""
  };

  var params = {
    "items": {"no_icons": "boolean"},
    "minouts": {"no_icons": "boolean"}
  };

  var expiry = {};

  var mash = function(func, expires) {
    return function(req, res, next) {
      var id = req.params.id;

      var query = {};
      for(var key in params[func]) {
        if(req.query[key] !== undefined) {
          query[key] = req.query[key];
        }
      }

      var cache_str = "CHARACTER_"+func+"#"+id+"#"+(new Buffer(JSON.stringify(query), "utf8").toString("base64"));
      var ch = cache.get(cache_str);
      if(ch === null) {
        var args = [id];
        for(var key in params[func]) {
          if(params[func][key] === "boolean") {
            args.push((key in query));
          } else if(typeof params[func][key] === "number") {
            var n = parseFloat(query[key]);
            args.push(Number.isNaN(n)  ? params[key] : n);
          } else if(typeof params[func][key] === "string") {
            args.push(query[key]);
          }
        }

        args.push(function(err, result) {
          if(err != null) {
            res.send(500);
            return res.end({error: err});
          } else if(err == null && result == null) {
            res.status = 404;
            return next();
          } else {
            result.expires = Date.now() + expires;
            cache.set(cache_str, result, expires);
            res.end(result, expires);
          }
        });
        lodestone.getCharacter[func].apply(null, args);
      } else {
        res.end(ch || {}, cache.getRemaining(cache_str));
      }
    }
  }

  for(var key in map) {
    var func = map[key] || key;
    var expires = expiry[func];
    if(expires === undefined || Number.isNaN(expires)) {
      expires = 1000 * 60 * 60 * 24;
    }

    router.get({
      endpoint: "character/"+key+"/:id",
      expires: expires,
      params: params[func]
    }, mash(func, expires));
  }

  return router;
}

exports = module.exports = LODESTONE_10;