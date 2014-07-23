//Licensed under the ISC license.
//Copyright 2014 Yuki Ahmed

var mongoose = require("mongoose");

var timeseries = mongoose.Schema({
  timestamp: Number,
  status: Object // {World: 0, World2: 0}
})

exports = module.exports = timeseries;
