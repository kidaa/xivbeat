//Licensed under the ISC license.
//Copyright 2014 Yuki Ahmed

var ptr = [], exptr = [];

var cache = {
  set: function(name, response, expires) {
    exptr[name] = (expires !== undefined ? Date.now() + expires : -1);
    ptr[name] = response;
  },
  get: function(name) {
    if(ptr[name] === undefined) {
      return null;
    }

    if((exptr[name] !== undefined && exptr[name] >= Date.now()) || exptr[name] === -1) {
      return ptr[name];
    }

    return null;
  },
  getRemaining: function(name) {
    if(exptr[name] === undefined || exptr[name] === -1) {
      return 0;
    } else {
      return exptr[name] - Date.now();
    }
  }
}

exports = module.exports = cache;
