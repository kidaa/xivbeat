//Licensed under the ISC license.
//Copyright 2014 Yuki Ahmed

//middleware because subdomain switch.
var path = require("path"),
    static = require("serve-static"),
    api = require("../../lib/api.js");

cache = require("../../lib/cache.js");

var API = function(app, db, subdomain, root) {

  var Api = new api("/", root);

  var Aetheryte = Api.getInterface("aetheryte"),
      Frontier = Api.getInterface("frontier"),
      Lodestone = Api.getInterface("lodestone");

  root.use(static(path.resolve(__dirname, "pub")));
  Api.static({
    endpoint: "README.txt",
    name: "README",
    expires: -1
  })

  require("./entry/aetheryte/")(db, Aetheryte);
  Api.interface(Aetheryte);

  require("./entry/frontier/")(db, Frontier);
  Api.interface(Frontier);

  require("./entry/lodestone/")(db, Lodestone);
  Api.interface(Lodestone);

  Api.mesh(root);

  app.use(subdomain("api", root));
}

exports = module.exports = API;
