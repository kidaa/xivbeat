//Licensed under the ISC license.
//Copyright 2014 Yuki Ahmed

//middleware because subdomain switch.
var path = require("path"),
    static = require("serve-static"),
    fs = require("fs"),
    Router = require("express").Router;

var ATMA = function(app, db, subdomain, root) {
  root.get("/script/data.js", function(req, res) {
    res.header("Content-Type", "text/javascript");
    res.end("window.data = " + fs.readFileSync(path.resolve(__dirname, "pub", "script", "data.json")));
  });

  root.get("/script/aetheryte.js", function(req, res) {
    res.header("Content-Type", "text/javascript");
    res.end(fs.readFileSync(path.resolve(__dirname, "..", "..", "lib", "aetheryte.js")));
  });

  root.use(static(path.resolve(__dirname, "pub")));

  app.use(subdomain("atma", root));
}

exports = module.exports = ATMA;
