//Licensed under the ISC license.
//Copyright 2014 Yuki Ahmed

//middleware because subdomain switch.
var path = require("path"),
    static = require("serve-static"),
    fs = require("fs"),
    Router = require("express").Router;

var TIME = function(app, db, subdomain, root) {
  root.get("/script/data.js", function(req, res) {
    res.header("Content-Type", "text/javascript");
    res.end("window.nodes = " + fs.readFileSync(path.resolve(__dirname, "pub", "script", "data.json")));
  });

  root.use(static(path.resolve(__dirname, "pub")));

  app.use(subdomain("time", root));
}

exports = module.exports = TIME;
