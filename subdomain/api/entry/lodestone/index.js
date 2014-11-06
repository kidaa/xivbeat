//Licensed under the ISC license.
//Copyright 2014 Yuki Ahmed

var LODESTONE = function(db, router) {
  var V10 = router.getInterface("1.0"),
      V11 = router.getInterface("1.1");
  require("./1.0.js")(db, V10);
  require("./1.1.js")(db, V11, router);
  router.interface(V10);
  router.interface(V11);
}

exports = module.exports = LODESTONE;
