//Licensed under the ISC license.
//Copyright 2014 Yuki Ahmed

//middleware because subdomain switch.
var cache = require("../../lib/cache.js"),
    frontier = require("../../lib/frontier.js"),
    path = require("path"),
    static = require("serve-static");

var API = function(app, db, subdomain, router) {
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
  };

  fetchServerStatus();
  fetchServerSlim();

  router.use(function(req, res, next) {
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

  router.use(static(path.resolve(__dirname, "pub")));

  router.get("/", function(req, res) {
    return res.end({
      root: {
        url: req.protocol + "://" + req.get("host"),
        params: [],
        expires: 0
      },
      list: {
        url: req.protocol + "://" + req.get("host") + "/server_map.json",
        params: [],
        expires: 0
      },
      list_slim: {
        url: req.protocol + "://" + req.get("host") + "/server_map_linear.json",
        params: [],
        expires: 0
      },
      server: {
        url: req.protocol + "://" + req.get("host") + "/server.json",
        params: [],
        expires: 1000 * 60
      },
      server_slim: {
        url: req.protocol + "://" + req.get("host") + "/slim.json",
        params: [],
        expires: 1000 * 15
      },
      timeseries: {
        url: req.protocol + "://" + req.get("host") + "/timeseries.json",
        params: ["world", "start", "end"],
        expires: Number.MAX_VALUE
      },
      world: {
        url: req.protocol + "://" + req.get("host") + "/world.json",
        params: [],
        expires: 1000 * 60
      },
      login: {
        url: req.protocol + "://" + req.get("host") + "/login.json",
        params: [],
        expires: 1000 * 60
      },
      lobby: {
        url: req.protocol + "://" + req.get("host") + "/lobby.json",
        params: ["lang"],
        expires: 1000 * 60
      },
      headlines: {
        url: req.protocol + "://" + req.get("host") + "/headlines.json",
        params: ["lang"],
        expires: 1000 * 60 * 60
      },
      article: {
        url: req.protocol + "://" + req.get("host") + "/article.json",
        params: ["id"],
        expires: 1000 * 60 * 60
      }
    });
  });

  router.get("/headlines.json", function(req, res) {
    var ch = cache.get("headlines.json#" + (req.query.lang || "en-us"));
    if(ch !== null) {
      return res.end(ch);
    }

    return frontier.getHeadlines(req.query.lang || "en-us", function(err, headlines) {
      if(err) {
        return res.end({error: err});
      }

      cache.set("headlines.json#" + (req.query.lang || "en-us"), headlines, 1000 * 60 * 60);
      return res.end(headlines);
    });
  });

  router.get("/server.json", function(req, res) {
    var ch = cache.get("status.json");
    res.end(ch || {error: "no cached data"});
  });

  router.get("/slim.json", function(req, res) {
    var ch = cache.get("slim.json");
    res.end(ch || {error: "no cached data"});
  })

  router.get("/timeseries.json", function(req, res) {
    return res.end({});

    if(req.query.world === undefined || req.query.world.length == 0) {
      return res.end({error: "Invalid world"});
    }

    var world = res.query.world.toLowerCase();
  })

  router.get("/world.json", function(req, res) {
    var ch = cache.get("world.json");
    res.end(ch || {error: "no cached data"});
  });

  router.get("/login.json", function(req, res) {
    var ch = cache.get("login.json");
    res.end(ch || {});
  });

  router.get("/lobby.json", function(req, res) {
    var ch = cache.get("lobby.json");
    res.end(ch || {});
  });

  router.get("/article.json", function(req, res) {
    if(req.query.id === undefined || req.query.id.length == 0) {
      return res.end({error: "Invalid ID"});
    }

    var ch = cache.get("article.json#" + req.query.id);
    if(ch !== null) {
      return res.end(ch);
    }

    return frontier.getArticle(req.query.id || "", function(err, article) {
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

  router.use(function(err, req, res, next) {
    if(err.status === 404) {
      next();
    }
    res.end({error: err.message, stack: err.stack});
  });

  router.use(function(req, res) {
    res.end({error: "we lost the unicorns"});
  });

  app.use(subdomain("api", router));
}

exports = module.exports = API;
