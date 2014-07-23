//Licensed under the ISC license.
//Copyright 2014 Yuki Ahmed

var ptr = exptr = [];

var cache = {
  set: function(name, response, expires) {
    exptr[name] = expires || Date.now() + (1000 * 60 * 1); //one minute
    ptr[name] = response;
  },
  get: function(name) {
    if(ptr[name] === undefined) {
      return null;
    }

    if(exptr[name] !== undefined && exptr[name] <= Date.now()) {
      return ptr[name];
    }

    return null;
  }
}

exports = module.exports = cache;
