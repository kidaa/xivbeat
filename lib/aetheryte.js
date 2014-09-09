//Licensed under the ISC license.
//Copyright 2014 Yuki Ahmed

var EZ_TIME_CONSTANT = 20.571428571428574; //HAND CRAFTED, FRAME BY FRAME!

var Aetheryte = {
  getEorzeaTime: function() {
    return Math.floor((Date.now() - 26127360000000) * EZ_TIME_CONSTANT);
  },
  formatTime: function(epoch) {
    var date = new Date(epoch);
    var h = date.getUTCHours(), m = date.getUTCMinutes(), s = date.getUTCSeconds();
    var meridiem = "AM";
    if(h > 11) {
      meridiem = "PM";
    }

    return {
      epoch: epoch,
      h: h,
      m: m,
      s: s,
      meridiem: meridiem,
      string: ("0" + h).substr(-2) + ":" + ("0" + m).substr(-2) + ":" + ("0" + s).substr(-2) + " " + meridiem
    };
  },
}

exports = module.exports = Aetheryte;
