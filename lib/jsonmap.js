//Licensed under the ISC license.
//Copyright 2014 Yuki Ahmed

var jpath = require("./jsonpath.js");

var map = function(schema) {
  this.schema = schema;
}

map.prototype = {
  update: function(schema) {
    this.schema = schema;
  },
  parse: function(object, parent) {
    var obj = {};
    parent = parent || this.schema;

    for(var key in parent) {
      if(object[key] === undefined) {
        obj[key] = null;
        continue;
      }

      if(typeof parent[key] == "object" && typeof object[key] == object) {
        obj[key] = this.parse(object[key], parent[key]);
      } else if(typeof parent[key] == "string" && parent[key].length > 0) {
        obj[key] = jpath(object[key], parent[key]);
      } else {
        obj[key] = object[key];
      }
    }
    return obj;
  }
}

var jsonmap = function(schema) {
    return new map(schema);
}

exports = module.exports = jsonmap;
