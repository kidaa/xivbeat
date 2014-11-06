//Licensed under the ISC license.
//Copyright 2014 Yuki Ahmed

var request = require("request"),
    jsdom = require("jsdom").jsdom;

var SEARCH_URL = "http://xivdb.com/modules/search/search.php?language=1&showview=1&query="

var createRequest = function(url, callback) {
  return request.get({url: url, json: true}, callback);
}

var createDOM = function(url, callback) {
  jsdom.env({
    url: url,
    features: {
      QuerySelector: true,
      ProcessExternalResources: false,
      SkipExternalResources: true
    },
    done: function(errs, window) {
      callback(window, window.document);
    }
  });
}

var XIVDB = {
  language_map: [
    "ja",
    "en",
    "de",
    "fr"
  ],
  search: function(query, callback) {
    if(typeof language === "string") {
      language = language_map[language] || 1;
    }

    var url = SEARCH_URL + encodeURIComponent(query).replace(/\%20/g, "+");
    console.log(url);
    createDOM(url, function(window, document) {
      try {
        callback(null, "http://xivdb.com/?"+(document.querySelector(".search_result_box a").href.split("?")[1]));
      } catch(e) {
        callback(e);
      }
    });
  }
}

exports = module.exports = XIVDB;
