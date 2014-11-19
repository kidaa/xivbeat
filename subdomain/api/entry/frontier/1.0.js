//Licensed under the ISC license.
//Copyright 2014 Yuki Ahmed

//middleware because subdomain switch.
var frontier = require("../../../../lib/frontier.js"),
    path = require("path"),
    static = require("serve-static");

var FRONTIER_10 = function(db, router) {
  var fetchServerStatus = function() {
    frontier.getStatus(function(err, status, world, login, lobby) {
      setTimeout(fetchServerStatus, 1000 * 59);
      if(err) {
        return;
      }

      cache.set("status.json", status);
      cache.set("world.json", world);
      cache.set("login.json", login);
      cache.set("lobby.json", lobby);
    });
  }, fetchServerSlim = function() {
    frontier.getStatusSlim(function(err, status) {
      setTimeout(fetchServerSlim, 1000 * 14);
      if(err) {
        return;
      }

      cache.set("slim.json", status);
    });
  }, fetchServerMaintenance = function() {
    frontier.getMaintenance(function(err, maintenance) {
      setTimeout(fetchServerMaintenance, 1000 * 58);
      if(err) {
        cache.set("maintenance.json", {
          start: 0,
          end: 0,
          services: [],
          error: err.stack,
          id: maintenance || ""
        });
        return;
      }

      cache.set("maintenance.json", maintenance);
    });
  }

  fetchServerStatus();
  fetchServerSlim();
  fetchServerMaintenance();

  router.use(static(path.resolve(__dirname, "pub")));

  router.static({
    endpoint: "server_map.json",
    name: "list",
    expires: -1
  });

  router.static({
    endpoint: "server_map_linear.json",
    name: "list_slim",
    expires: -1
  });

  router.get({
    endpoint: "headlines",
    expires: 3600000,
    params: {"lang": "string"}
  }, function(req, res) {
    var ch = cache.get("headlines.json#" + (req.query.lang || "en-us"));
    if(ch !== null) {
      return res.end(ch, cache.getRemaining("headlines.json#" + (req.query.lang || "en-us")));
    }

    frontier.getHeadlines(req.query.lang || "en-us", function(err, headlines) {
      if(err) {
        return res.end({error: err}, 1000);
      }

      cache.set("headlines.json#" + (req.query.lang || "en-us"), headlines, 1000 * 60 * 60);
      return res.end(headlines, 1000 * 60 * 60);
    });
  });

  router.get({
    endpoint: "server",
    expires: 60000
  }, function(req, res) {
    var ch = cache.get("status.json");
    res.end(ch || {error: "no cached data"}, 10000);
  });

  router.get({
    endpoint: "slim",
    expires: 15000
  }, function(req, res) {
    var ch = cache.get("slim.json");
    res.end(ch || {error: "no cached data"}, 1000);
  })

  router.get({
    endpoint: "timeseries",
    expires: Number.MAX_VALUE
  }, function(req, res) {
    return res.end({}, 13e+11);

    if(req.query.world === undefined || req.query.world.length == 0) {
      return res.end({error: "Invalid world"});
    }

    var world = res.query.world.toLowerCase();
  })

  router.get({
    endpoint: "world",
    expires: 60000
  }, function(req, res) {
    var ch = cache.get("world.json");
    res.end(ch || {error: "no cached data"}, 10000);
  });

  router.get({
    endpoint: "login",
    expires: 60000
  }, function(req, res) {
    var ch = cache.get("login.json");
    res.end(ch || {error: "no cached data"}, 10000);
  });

  router.get({
    endpoint: "lobby",
    expires: 60000
  }, function(req, res) {
    var ch = cache.get("lobby.json");
    res.end(ch || {error: "no cached data"}, 10000);
  });

  router.get({
    endpoint: "article",
    expires: 3600000,
    params: {"id": "number"}
  }, function(req, res) {
    if(req.query.id === undefined || req.query.id.length == 0) {
      return res.end({error: "Invalid ID"});
    }

    var ch = cache.get("article.json#" + req.query.id);
    if(ch !== null) {
      return res.end(ch);
    }

    frontier.getArticle(req.query.id || "", function(err, article) {
      if(err) {
        return res.end({error: err});
      }

      if(Object.keys(article).length == 0) {
        return res.end({error: "Invalid ID"});
      }

      cache.set("article.json#" + req.query.id, article, 1000 * 60 * 60);
      return res.end(article);
    });
  });

  router.get({
    endpoint: "maintenance",
    expires: 60000
  }, function(req, res) {
    var ch = cache.get("maintenance.json");
    return res.end(ch || {error: "no cached data"}, 10000);
  });

  return router;
}

exports = module.exports = FRONTIER_10;
