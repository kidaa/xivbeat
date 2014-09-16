//Licensed under the ISC license.
//Copyright 2014 Yuki Ahmed

var Router = require("express").Router,
    exml = require("easyxml").render;

var Api = function(entry, carry) {
  this.entry = entry;
  this.router = Router();
  this.endpoints = {};

  this.router.use(function(req, res, next) {
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Origin", "*");

    res._end = res.end;
    res.end = function(msg) {
      if(typeof msg == "object" && !Buffer.isBuffer(msg)) {
        if("error" in msg) {
          res.status = 500;
        }

        if(req.params.type$ == "json") {
          if(req.query.pretty !== undefined) {
            msg = JSON.stringify(msg, null, 2);
          } else {
            msg = JSON.stringify(msg);
          }
          res.header("Content-Type", "application/json");
        } else if(req.params.type$ == "jsonp") {
          var func = req.query.callback || req.url.split("/")[0].split(".")[0];

          msg = func + "("+JSON.stringify(msg)+")";
          res.header("Content-Type", "text/javascript");
        } else if(req.params.type$ == "xml") {
          msg = exml(msg);
          res.header("Content-Type", "application/xml");
        }
      }

      res._end(msg);
    }
    next();
  })
};

Api.prototype = {
  interface: function(interface) {
    interface.sudo();
    this.router.use(interface.router);
  },
  path: function(req, res) {
    res.end(this.endpoints);
  },
  getInterface: function(entry) {
    this.endpoints[entry] = {};
    return new Interface(entry, this);
  },
  sudo: function() {
    var entry = {};
    for(var key in this.endpoints) {
      var val = this.endpoints[val];
      if(typeof val == "string") {
        entry[key] = "/" + this.entry + "/" + val;
      } else {
        entry[key] = val;
        entry[key].url = "/" + this.entry + "/" + val;
      }
    };
    this.router.get("/", function(req, res) {
      res.end(entry);
    });
  },
  mesh: function(app) {
    this.sudo();
    app.use("/"+entry, this.router);
  }
}

var Interface = function(entry, host) {
  this.entry = host.entry + entry;
  this.router = router;
  this.host = host;
  this.endpoints = {};
  this.router.use(function(req, res, next) {
    res.___end = res.end;
    res.end = function(message, expiry) {
      res.setHeader("Cache-Control", "public, max-age=" + Math.floor(expiry/1000));
      res.setHeader("Expires", new Date(Date.now() + expiry).toUTCString());
      res.___end(message);
    };
    next();
  });
}

Interface.prototype = {
  getInterface: function(entry) {
    this.host.endpoints[this.entry][entry] = this.entry + "/" + entry + "/";
    this.endpoints[entry] = {};
    return new Intreface(entry, this);
  },
  sudo: function() {
    var entry = {};
    for(var key in this.endpoints) {
      var val = this.endpoints[val];
      if(typeof val == "string") {
        entry[key] = "/" + this.entry + "/" + val;
      } else {
        entry[key] = val;
      }
    };
    this.router.get("/", function(req, res) {
      res.end(entry);
    });
  },
  static: function(meta, method) {
    this.endpoints[method.endpoint] = {
      params: meta.params,
      method: (method || "get").toUpperCase(),
      expires: meta.expires
    }
  },
  get: function(meta, call) {
    this.call("get", meta, call);
  },
  post: function(meta, call) {
    this.call("post", meta, call);
  },
  put: function(meta, call) {
    this.call("put", meta, call);
  },
  delete: function(meta, call) {
    this.call("delete", meta, call);
  },
  head: function(meta, call) {
    this.call("head", meta, call);
  },
  call: function(method, meta, call) {
    this.static(meta, method);

    this.router[method]("/" + endpoint + ".:type$", call);
  }
}

exports = module.exports = Api;
exports.interface = module.exports.interface = Interface;
