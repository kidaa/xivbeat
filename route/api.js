//Licensed under the ISC license.
//Copyright 2014 Yuki Ahmed

//middleware because subdomain switch.
var cache = require("../lib/cache.js"),
    frontier = require("../lib/frontier.js"),
    path = require("path"),
    fs = require("fs");

var servermap = fs.readFileSync(path.resolve(__dirname, "../api_pub/server_map.json")),
    servermaplinear = fs.readFileSync(path.resolve(__dirname, "../api_pub/server_map_linear.json"));

var API = function(db) {
  return function(req, res, next) {
    res._end = res.end;
    res.end = function(msg) {
      if(typeof msg == "object" && !Buffer.isBuffer(msg)) {
        msg = JSON.stringify(msg);
      }

      res._end(msg);
    }

    if(req.get("host").split(".")[0] == "api" || process.env.NO_SUBDOMAIN == "1") {
      res.header("Content-Type", "application/json");
      if(req.method != "GET") {
        return res.end({error: "Invalid request method"});
      }

      var prefix = process.env.NO_SUBDOMAIN == "1" ? "/api/" : "/";
      switch(req.path) {
        case prefix:
          return res.end({
            root: {
              url: req.protocol + "://" + req.get("host") + prefix,
              params: [],
              expires: 0
            },
            list: {
              url: req.protocol + "://" + req.get("host") + prefix + "server_map.json",
              params: [],
              expires: 0
            },
            list_slim: {
              url: req.protocol + "://" + req.get("host") + prefix + "server_map_linear.json",
              params: [],
              expires: 0
            },
            server: {
              url: req.protocol + "://" + req.get("host") + prefix + "server.json",
              params: [],
              expires: 1000 * 60 * 1
            },
            server_slim: {
              url: req.protocol + "://" + req.get("host") + prefix + "slim.json",
              params: [],
              expires: 1000 * 15
            },
            timeseries: {
              url: req.protocol + "://" + req.get("host") + prefix + "timeseries.json",
              params: [],
              expires: -1
            },
            world: {
              url: req.protocol + "://" + req.get("host") + prefix + "world.json",
              params: [],
              expires: 1000 * 60 * 1
            },
            login: {
              url: req.protocol + "://" + req.get("host") + prefix + "login.json",
              params: [],
              expires: 1000 * 15 * 1
            },
            lobby: {
              url: req.protocol + "://" + req.get("host") + prefix + "lobby.json",
              params: ["lang"],
              expires: 1000 * 15 * 1
            },
            headlines: {
              url: req.protocol + "://" + req.get("host") + prefix + "headlines.json",
              params: ["lang"],
              expires: 1000 * 15 * 1
            },
            article: {
              url: req.protocol + "://" + req.get("host") + prefix + "article.json",
              params: ["id", "lang"],
              expires: 1000 * 15 * 1
            }
          })
        break;

        case prefix + "server_map.json":
          return res.end(servermap);
        break;

        case prefix + "server_map_linear.json":
          return res.end(servermaplinear);
        break;

        case prefix + "headlines.json":
          var ch = cache.get("headlines.json#" + (req.query.lang || "en-us"));
          if(ch !== null) {
            return res.end(ch);
          }

          return frontier.getHeadlines(req.query.lang || "en-us", function(err, headlines) {
            if(err) {
              return res.end({error: err});
            }

            cache.set("headlines.json#" + (req.query.lang || "en-us"), headlines);
            return res.end(headlines);
          });
        break;

        case prefix + "server.json":
          var ch = cache.get("status.json");
          if(ch !== null) {
            return res.end(ch);
          }

          return frontier.getStatus(function(err, status) {
            if(err) {
              return res.end({error: err});
            }
            cache.set("status.json", status, 1000 * 60 * 1);
            return res.end(status);
          });
        break;

        case prefix + "slim.json":
          var ch = cache.get("slim.json");
          if(ch !== null) {
            return res.end(ch);
          }

          return frontier.getStatusSlim(function(err, status) {
            if(err) {
              return res.end({error: err});
            }
            cache.set("slim.json", status);
            return res.end(status);
          });
        break;

        case prefix + "timeseries.json":
          return res.end({});

          if(req.query.world === undefined || req.query.world.length == 0) {
            return res.end({error: "Invalid world"});
          }

          var world = res.query.world.toLowerCase();
        break;

        case prefix + "world.json":
          var ch = cache.get("world.json", 1000 * 60 * 1);
          if(ch !== null) {
            return res.end(ch);
          }

          return frontier.getWorldStatus(function(err, world) {
            if(err) {
              return res.end({error: err});
            }

            cache.set("world.json", world);
            return res.end(world);
          });
        break;

        case prefix + "login.json":
          var ch = cache.get("login.json");
          if(ch !== null) {
            return res.end(ch);
          }

          return frontier.getLoginStatus(function(err, login) {
            if(err) {
              return res.end({error: err});
            }

            cache.set("login.json", login);
            return res.end(login);
          });
        break;

        case prefix + "lobby.json":
          var ch = cache.get("lobby.json#" + (req.query.lang || "en-us"));
          if(ch !== null) {
            return res.end(ch);
          }

          return frontier.getLobbyStatus(req.query.lang || "en-us", function(err, lobby) {
            if(err) {
              return res.end({error: err});
            }

            cache.set("lobby.json#" + (req.query.lang || "en-us"), lobby);
            return res.end(lobby);
          });
        break;

        case prefix + "article.json":
          if(req.query.id === undefined || req.query.id.length == 0) {
            return res.end({error: "Invalid ID"});
          }

          var ch = cache.get("article.json#" + req.query.id + "#" + (req.query.lang || "en-us"));
          if(ch !== null) {
            return res.end(ch);
          }

          return frontier.getArticle(req.query.lang || "en-us", req.query.id || "", function(err, article) {
            if(err) {
              return res.end({error: err});
            }

            if(Object.keys(article).length == 0) {
              return res.end({error: "Invalid ID"});
            }

            cache.set("article.json#" + req.query.id, article + "#" + (req.query.lang || "en-us"));
            return res.end(article);
          });
        break;
      }

      res.header("Content-Type", "");
      next();
    } else {
      next();
    }
  }
}

exports = module.exports = API;
