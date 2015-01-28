//Licensed under the ISC license.
//Copyright 2014 Yuki Ahmed

var Router = require("express").Router,
    exml = require("easyxml").render;

var Api = function(entry) {
  this.entry = entry;
  this.router = Router();
  this.endpoints = {};

  this.router.use(function(req, res, next) {
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Origin", "*");

    res._end = res.end;
    res.end = function(msg, expires) {
      if(typeof msg == "object" && !Buffer.isBuffer(msg)) {
        if("error" in msg) {
          res.status = 500;
        }

        req.params._type = req.params._type || "json"

        if(req.params._type == "json") {
          if(req.query.pretty !== undefined) {
            msg = JSON.stringify(msg, null, 2);
          } else {
            msg = JSON.stringify(msg);
          }
          res.header("Content-Type", "application/json");
        } else if(req.params._type == "js") {
          var func = req.query.callback || req.url.split("/").pop().split(".")[0];

          msg = func + "("+JSON.stringify(msg)+")";
          res.header("Content-Type", "text/javascript");
        } else if(req.params._type == "xml") {
          msg = exml(msg);
          res.header("Content-Type", "application/xml");
        } else {
          msg = "JSON\u0000\u0000" + (new Buffer(JSON.stringify(), "utf8")).toString("base64");
          res.header("Content-Type", "application/octet-stream");
        }
      }

      if(expires || false > 0) {
        res.setHeader("Cache-Control", "public, max-age=" + Math.floor(expires/1000));
        res.setHeader("Expires", new Date(Date.now() + expires).toUTCString());
      };

      res._end(msg);
    }
    next();
  });
};

Api.prototype = {
  interface: function(interface) {
    interface.sudo();
    this.router.use(interface.entry, interface.router);
  },
  path: function(req, res) {
    res.end(this.endpoints);
  },
  getInterface: function(entry) {
    this.endpoints[entry] = {};
    return new Interface(entry, this);
  },
  static: function(meta, method) {
    this.endpoints[meta.name] = {
      params: meta.params || [],
      method: (method || "get").toUpperCase(),
      expires: meta.expires,
      url: meta.endpoint
    }
  },
  sudo: function() {
    var prefix = "/";
    if(this.entry != "/") {
      prefix = this.entry;
    }
    var entry = {root: {params: [], method: "GET", expires: -1, url: prefix}};

    for(var key in this.endpoints) {
      var val = this.endpoints[key];

      if(typeof val == "string" || typeof val == "undefined") {
        entry[key] = prefix + (val || key);
      } else if("method" in val) {
        entry[key] = val;
        if(!"url" in val) {
          entry[key].url = prefix + key;
        }
      } else if(Object.keys(val).length){
        entry[key] = val;
        entry[key].root = prefix + key;
      } else {
        entry[key] = prefix + key;
      }
      if("url" in val) {
        entry[key].url = val.url;
      }
    };
    this.router.get("/", function(req, res) {
      res.end(entry);
    });
  },
  mesh: function(app) {
    this.sudo();

    this.router.use(function(err, req, res, next) {
      if(err.status === 404) {
        return next();
      }
      res.end({error: err.message, stack: err.stack});
    });

    this.router.use(function(req, res) {
      return res.end({error: "we lost the unicorns"});
    });

    app.use(this.router);

  }
}

var Interface = function(entry, host) {
  this.entry = host.entry + entry;
  if(this.entry.substr(-1) != "/") {
    this.entry += "/";
  }
  this._entry = entry;
  this.router = Router();
  this.host = host;
  this.endpoints = {};
}

Interface.prototype = {
  interface: function(interface) {
    interface.sudo();
    this.host.router.use(interface.entry, interface.router);
  },
  getInterface: function(entry) {
    this.host.endpoints[this._entry][entry] = this.entry + entry + "/";
    this.endpoints[entry] = {};
    return new Interface(entry, this);
  },
  use: function() {
    this.router.use.apply(this.router, arguments);
  },
  sudo: function() {
    var prefix = "/";
    if(this.entry != "/") {
      prefix = this.entry;
    }
    var entry = {root: {url: prefix, params: {}, expires: -1, method: "GET"}};

    for(var key in this.endpoints) {
      var val = this.endpoints[key];
      if(typeof val == "string") {
        entry[key] = prefix + val;
      } else if ("method" in val) {
        entry[val.name || key] = {
          url: prefix + key,
          params: val.params || {},
          expires: val.expires || 0,
          method: val.method || "GET"
        };
      } else if(Object.keys(val).length){
        entry[val.name || key] = val;
      } else {
        entry[val.name || key] = prefix + key;
      }
    };

    this.router.get("/", function(req, res) {
      res.end(entry);
    });
  },
  static: function(meta, method) {
    this.endpoints[meta.endpoint] = {
      params: meta.params || [],
      method: (method || "get").toUpperCase(),
      name: meta.name,
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

    this.router[method]("/" + meta.endpoint + ".:_type", call);
  }
}

exports = module.exports = Api;
