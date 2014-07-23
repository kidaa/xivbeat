//Licensed under the ISC license.
//Copyright 2014 Yuki Ahmed

//middleware because subdomain switch.
var cache = require("../lib/cache.js");
var API = function(db) {
  return function(req, res, next) {
    next();
  }
}

exports = module.exports = API;
