//Licensed under the ISC license.
//Copyright 2014 Yuki Ahmed

var static = require("serve-static"),
    path = require("path");

exports = module.exports = function(app, db, router) {
  router.use(static(path.resolve(__dirname, "..", "pub")));

  router.get("/world/:datacenter/:world", function(req, res) {
    res.render("tracking.html", {});
  });

  app.use(router);
}
