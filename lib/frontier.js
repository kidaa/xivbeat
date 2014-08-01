//Licensed under the ISC license.
//Copyright 2014 Yuki Ahmed

var request = require("request");

var WORLD_STATUS = "http://frontier.ffxiv.com/worldStatus/current_status.json",
    LOBBY_STATUS = "http://frontier.ffxiv.com/worldStatus/gate_status.json?lang=",
    LOGIN_STATUS = "http://frontier.ffxiv.com/worldStatus/login_status.json",
    HEADLINE_URL = "http://frontier.ffxiv.com/news/headline.json?lang=",
    ARTICLE_INFO = "http://frontier.ffxiv.com/news/article.json?id=";

var server_status = require("../schema/server_status.js");
var createRequest = function(url, callback) {
  return request.get({url: url, json: true}, callback);
}

var Frontier = {
  getWorldStatus: function(callback) {
    return createRequest(WORLD_STATUS, function(err, resp, body) {
      return callback(err, body);
    });
  },
  getLobbyStatus: function(lang, callback) {
    return createRequest(LOBBY_STATUS + lang, function(err, resp, body) {
      return callback(err, body);
    });
  },
  getLoginStatus: function(callback) {
    return createRequest(LOGIN_STATUS, function(err, resp, body) {
      return callback(err, body);
    });
  },
  getStatus: function(callback) {
    return Frontier.getWorldStatus(function(err, world) {
      if(err !== null) {
        return callback(err, null);
      }
      return Frontier.getLobbyStatus("", function(err, lobby) {
        if(err !== null) {
          return callback(err, null);
        }
        return Frontier.getLoginStatus(function(err, login) {
          if(err !== null) {
            return callback(err, null);
          }

          var result = server_status.parse(world);
          result.Japan = result["North America"] = lobby.status;
          result.Global = login.status;
          result.Time = Date.now();
          return callback(null, result);
        });
      });
    });
  },
  getStatusSlim: function(callback) {
    return Frontier.getStatus(function(err, result) {
      if(err !== null) {
        return callback(err, null);
      }

      var slim = [];
      for(var key in result) {
        slim.push(result[key]);
      }
      return callback(null, slim);
    });
  },
  getHeadlines: function(lang, callback) {
    return createRequest(HEADLINE_URL + lang, function(err, resp, body) {
      if(err !== null) {
        return callback(err, null);
      }

      var result = {};

      for(var key in body) {
        result[key] = new Array(body[key].length);
        for(var i = 0; i < body[key].length; ++i) {
          result[key][i] = {
            date: body[key][i].date,
            title: body[key][i].title,
            id: body[key][i].id,
            tag: body[key][i].tag || ""
          };
        }
      }

      return callback(null, result);
    });
  },
  getArticle: function(id, callback) {
    return createRequest(ARTICLE_INFO + id, function(err, resp, body) {
      if(err !== null) {
        return callback(err, null);
      }

      delete body.image;
      return callback(null, body);
    });
  }
}

exports = module.exports = Frontier;
