//Licensed under the ISC license.
//Copyright 2014 Yuki Ahmed

var request = require("request"),
    jsdom = require("jsdom");

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
  getMaintenance: function(callback) {
    return Frontier.getHeadlines("en-gb", function(err, result) {
      if(err !== null) {
        return callback(err, null);
      }

      var id = null;

      for(var i = 0; i < result.pinned.length; ++i) {
        if(result.pinned[i].tag == "Maintenance") {
          id = result.pinned[i].id;
          break;
        }
      }

      if(id === null) {
        for(var i = 0; i < result.news.length; ++i) {
          if(result.news[i].tag == "Maintenance") {
            id = result.news[i].id;
            break;
          }
        }
      }

      if(id === null) {
        return callback(null, {start: 0, end: 0, services: [], error: "no news", id: ""});
      }

      Frontier.getArticle(id, function(err, result) {
        jsdom.env({
          html: result.text,
          done: function(err, window) {
            if(err !== null) {
              return callback(err, null);
            }
            var document = window.document;
            var nodes = document.body.childNodes;
            var isDateSection = false,
                isServicesSection = false,
                start = 0,
                end = 0,
                services = [];
            try {
              for(var i = 0; i < nodes.length; ++i) {
                var text = nodes[i].textContent.trim();
                if(text.length == 0) {
                  continue;
                }

                if(text == "[Date & Time]") {
                  isDateSection = true;
                  continue;
                }

                if(text == "[Affected Service]" || text == "[Affected Worlds]" || text == "[Affected Services]" || text == "[Affected World]") {
                  isServicesSection = true;
                  continue;
                }

                if(text.substr(0, 1) == "[") {
                  isDateSection = false;
                  isServicesSection = false;
                }

                if(isDateSection) {
                  isDateSection = false;
                  var day = text.toLowerCase().split("from ")[0].split("to")[0];
                  var bd = false;
                  if(day.indexOf(":") > -1) {
                    day = day.substr(0, day.indexOf(":")-2);
                    bd = true;
                  }
                  var tofrom = text.toLowerCase().split("from ").pop().split(" to ");
                  var from = tofrom[0],
                      to = tofrom[1].split("(")[0],
                      timezone = text.split("(")[1].split(")")[0];
                  var fromStr = day + " " + (from.split(".").join("").toLowerCase()) + " " + timezone,
                      toStr = (to.split(".").join("").toLowerCase()) + " " + timezone;
                  if(new Date(toStr).getTime() === NaN) {
                    toStr = day + " " + toStr;
                  }

                  if(bd) {
                    fromStr = from + " " + timezone;
                  }

                  start = new Date(fromStr).getTime();
                  end = new Date(toStr).getTime();
                  continue;
                }

                if(isServicesSection) {
                  text = text.split("- ");
                  if(text[0] == "") {
                    text.shift();
                  }
                  services.push(text.join("- "));
                }
              }
            } catch(e) {
              return callback(e, id);
            }

            return callback(null, {
              start: start,
              end: end,
              services: services,
              error: false,
              id: id
            });
          }
        })
      });
    });
  },
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
          return callback(null, result, world, login, lobby);
        });
      });
    });
  },
  toSlim: function(resultset) {
    var slim = [];
    for(var key in resultset) {
      slim.push(resultset[key]);
    }
    return slim;
  },
  getStatusSlim: function(callback) {
    return Frontier.getStatus(function(err, result) {
      if(err !== null) {
        return callback(err, null);
      }

      slim = Frontier.toSlim(result);
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
