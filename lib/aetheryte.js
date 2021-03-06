//Licensed under the ISC license.
//Copyright 2014 Yuki Ahmed

var EZ_TIME_CONSTANT = 20.571428571428574; //HAND CRAFTED, FRAME BY FRAME!

var Aetheryte = {
  getEorzeaTime: function() {
    return Math.floor(Date.now() * EZ_TIME_CONSTANT);
  }, formatTime: function(epoch) {
    var date = new Date(epoch);
    var h = date.getUTCHours(), m = date.getUTCMinutes(), s = date.getUTCSeconds();
    var meridiem = "AM";
    var H = h;
    if(h > 11) {
      meridiem = "PM";
      H -= 12;
    }

    return {
      epoch: epoch,
      h: h,
      m: m,
      s: s,
      meridiem: meridiem,
      string: ("0" + H).substr(-2) + ":" + ("0" + m).substr(-2) + ":" + ("0" + s).substr(-2) + " " + meridiem
    };
  }, getEorzeaTimeAce: function(epoch) {
    //different method, based off http://www.toyboxarts.com/XIV/atma/atmclock.html
    var now = (new Date),
        offset = (now.getTimezoneOffset() + 60) * 60000,
        jp = new Date((now.getTime() + offset) + 3600000 * 9),
        ezpoch = new Date(2010, 6, 12, 1, 0, 0, 0),
        cms = jp.getTime(),
        epms = ezpoch.getTime(),
        dms = (cms - epms),
        dsec = (dms / 1000) - 90000,
        Δ = (dsec  * EZ_TIME_CONSTANT),
        epoch = epoch || Aetheryte.getEorzeaTime();

    var gsec = Δ % 60;
        Δ = (Δ - gsec) / 60;
        gsec = Math.floor(gsec);

    var gmin = Δ % 60;
        Δ = (Δ - gmin) / 60;

    var ghour = Δ % 24;
        Δ = (Δ - ghour) / 24;

    var gday = Δ % 32;
        Δ = (Δ - gday) / 32;
        gday++;

    var gmonth = Δ % 12;
        Δ = (Δ - gmonth) / 12
        gmonth++;

    var gyear = Δ;

    var meridiem = "AM";
    if(ghour > 11) {
      meridiem = "PM";
    }

    return {
      h: ghour,
      m: gmin,
      s: gsec,
      d: gday,
      M: gmonth,
      y: gyear,
      meridiem: meridiem,
      string: ("0" + gyear).substr(-2) + "/" + ("0" + gmonth).substr(-2) + "/" + ("0" + gday).substr(-2) + " " + ("0" + ghour).substr(-2) + ":" +
              ("0" + gmin).substr(-2) + ":" + ("0" + gsec).substr(-2) + " " + meridiem,
      epoch: new Date(gyear, gmonth, gday, ghour, gmin, gsec, 0).getTime()
    }
  }, getElement: function(epoch) {
    var epoch = epoch || Aetheryte.getEorzeaTime(),
        date = Aetheryte.getEorzeaTimeAce(epoch),
        astral = date.h % 12 > 6;

    return {
      hour: ["ice", "water", "wind", "thunder", "fire", "earth"][date.h % 6],
      day: ["wind", "thunder", "fire", "earth", "ice", "water", "astral", "umbral"][date.d % 8],
      astral: astral
    };
  }, getMoonPhase: function(epoch) {
    //again, based off http://www.toyboxarts.com/XIV/atma/atmclock.html
    var epoch = epoch || Aetheryte.getEorzeaTime(),
        time = Aetheryte.getEorzeaTimeAce(epoch),
        moons = ["new", "waxing crescent", "waxing half", "waxing gibbous", "full", "waning gibbous", "waning half", "waning crescent"],
        base = 1278950400000,
        Δ = (Date.now() - base) % 134400000,
        phase = Math.floor(Δ / 16800000);

    return {
      phase: phase,
      moon: moons[phase]
    };
  }
};

if(typeof window === "undefined") {
  exports = module.exports = Aetheryte;
}
