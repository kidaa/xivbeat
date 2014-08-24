//Licensed under the ISC license.
//Copyright 2014 Yuki Ahmed

//middleware because subdomain switch.
var path = require("path"),
    static = require("serve-static"),
    faye = require("faye"),
    Router = require("express").Router;

var PF = function(app, db, subdomain, root) {=

  var adapter = new faye.NodeAdapter({mount: "/faye", timeout: 60});

  root.use(static(path.resolve(__dirname, "pub")));

  adapter.attach(root);

  app.use(subdomain("time", root));
}

exports = module.exports = PF;
