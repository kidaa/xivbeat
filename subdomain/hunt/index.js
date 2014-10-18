//Licensed under the ISC license.
//Copyright 2014 Yuki Ahmed

//middleware because subdomain switch.
var path = require("path"),
    static = require("serve-static"),
    fs = require("fs"),
    Router = require("express").Router;

var TIME = function(app, db, subdomain, root) {
  root.get("/regions/regions.js", function(req, res) {
    res.header("Content-Type", "text/javascript");
    res.end("window.hunt = window.hunt || {}; window.hunt.configuration.regions = " + fs.readFileSync(path.resolve(__dirname, "pub", "regions", "regions.json")));
  });

  root.use(static(path.resolve(__dirname, "pub")));

  app.use(subdomain("hunt", root));
}

exports = module.exports = TIME;
