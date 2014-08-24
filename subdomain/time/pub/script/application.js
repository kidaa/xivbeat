var EZ_TIME_CONSTANT = 20.571428571428574;

var getEorzeaTime = function() {
    return Math.floor(Date.now() * EZ_TIME_CONSTANT);
}, formatTime: function(epoch) {
  var date = new Date(epoch);
  var h = date.getUTCHours(), m = date.getUTCMinutes();
  var meridiem = "AM";
  if(h > 11) {
    meridiem = "PM";
  }

  return ("0" + h).substr(-2) + ":" + ("0" + m).substr(-2) + " " + meridiem;
}, remaining = function(futureHours) {
  return new Date(175 * futureHours * 1000)).getTime() / 1000 / 60`;
}, tick = function() {

};
