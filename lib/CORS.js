//Licensed under the ISC license.
//Copyright 2014 Yuki Ahmed

var CORS = function(domainmask) {
  return function(req, res, next) {
    if(domainmask.indexOf(req.get('host').toUpperCase())) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Credentials", "false");
      res.header("Access-Control-Allow-Methods", "GET");
    }
    next();
  }
}

exports = module.exports = CORS;
