//Licensed under the ISC license.
//Copyright 2014 Yuki Ahmed

var AETHERYTE = function(db, router) {
  var V10 = router.getInterface("1.0");
  require("./1.0.js")(db, V10);
  router.interface(V10);
}

exports = module.exports = AETHERYTE;
