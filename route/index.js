//Licensed under the ISC license.
//Copyright 2014 Yuki Ahmed

exports = module.exports = function(app, db) {
  app.get("/world/:datacenter/:world", function(req, res) {
    res.render("tracking.html", {});
  });
}
