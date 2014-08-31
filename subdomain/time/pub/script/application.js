var EZ_TIME_CONSTANT = 20.571428571428574,
    logicdata = new Array(24),
    last_hour = -1,
    data = undefined,
    eorzea_time = document.getElementById("eorzea_time"),
    real_time = document.getElementById("real_time"),
    left = document.getElementById("left"),
    right = document.getElementById("right"),
    settingsRows = document.getElementById("rows"),
    settings = document.getElementById("settings"),
    blacken = document.getElementById("blacken"),
    currents = null,
    daily = null,
    weekly = null,
    leve = null,
    dtimer = document.getElementById("daily"),
    wtimer = document.getElementById("weekly"),
    ltimer = document.getElementById("leve");

var DateUTC = function(year, month, day, hour, minute, second) {
  var d = new Date(0);
  d.setFullYear(year);
  d.setUTCMonth(month);
  d.setUTCDate(day);
  d.setUTCHours(hour);
  d.setUTCMinutes(minute);
  d.setUTCSeconds(second);
  return d;
}, regenTimers = function() {
  currents = new Date();
  daily = DateUTC(currents.getFullYear(), currents.getUTCMonth(), currents.getUTCDate(), 16, 0, 0).getTime();
  if(currents.getTime() > daily) {
    daily = DateUTC(currents.getFullYear(), currents.getUTCMonth(), currents.getUTCDate() + 1, 16, 0, 0).getTime();
  }

  var distance = currents.getUTCDay();
  distance -= 1;
  if(distance < 0) {
    distance = Math.abs(distance);
  }
  weekly = DateUTC(currents.getFullYear(), currents.getUTCMonth(), currents.getUTCDate() + distance, 8, 0, 0).getTime();

  leve = DateUTC(currents.getFullYear(), currents.getUTCMonth(), currents.getUTCDate(), 0, 0, 0).getTime();
  if(currents.getTime() > leve) {
    leve = DateUTC(currents.getFullYear(), currents.getUTCMonth(), currents.getUTCDate(), 12, 0, 0).getTime();
    if(currents.getTime() > leve) {
      leve = DateUTC(currents.getFullYear(), currents.getUTCMonth(), currents.getUTCDate() + 1, 0, 0, 0).getTime();
    }
  }
}, getEorzeaTime = function() {
  return Math.floor(Date.now() * EZ_TIME_CONSTANT);
}, formatTime = function(epoch, days, shmrd) {
  var date = new Date(epoch);
  var h = date.getUTCHours(), m = date.getUTCMinutes();
  var meridiem = "AM";
  if(h > 11 && !shmrd) {
    h -= 12;
    meridiem = "PM";
  }

  if(days && date.getUTCDate() > 0) {
    h += date.getUTCDate() * 24
  }

  var str = ("0" + h).substr(-2) + ":" + ("0" + m).substr(-2) + ":" + ("0" + date.getUTCSeconds()).substr(-2);

  if(!shmrd) {
    str += " " + meridiem;
  }
  return str;
}, remaining = function(futureHours) {
  return new Date(175 * futureHours * 1000).getTime() / 1000 / 60;
}, calculateHours = function(last, hour) {
  var timeDifference = 0;
  if(hour == last || hour == last + 1) {
    timeDifference = 1;
  } else {
    timeDifference = hour - last;
    if(timeDifference < 1) {
      timeDifference += 24;
    }
  }
  return timeDifference;
}, playSound = function(se) {
  var se = "/se/"+se+".mp3";
  var a = new Audio();
  a.addEventListener("canplay", function(){
    a.play();
  }, false);
  a.src = se;
  a.volume = 1;
}, tick = function() {
  var start = Date.now();
  var now = getEorzeaTime(),
      date = new Date(now),
      hour = date.getUTCHours();

  if(last_hour != hour) {
    data = sortByTime(hour);
    last_hour = hour;
    while(left.children.length) {
      left.removeChild(left.children[0]);
    }
    while(right.children.length) {
      right.removeChild(right.children[0]);
    }

    if(document.getElementById("seenabled"+hour) !== null && document.getElementById("seenabled"+hour).checked) {
      playSound(document.getElementById("se"+hour).value);
    }

    var ul = document.createElement("ul");
    for(var i = 0; i < 24; ++i) {
      var n = data[i];
      if(n === undefined) {
        continue;
      }
      var li = document.createElement("li");
      var hour = n.hour,
          meridiem = "AM";
      if(hour > 11) {
        hour -= 12;
        meridiem = "PM";
      }

      li.innerText = ("0" + hour).substr(-2) + ":00 " + meridiem;

      var timeDifference = calculateHours(last_hour, n.hour);
      var timeLeft = document.createElement("span");
      timeLeft.dataset.fh = timeDifference;
      var minuteDifference = 60 - date.getUTCMinutes();
      timeDifference -= (1 - (minuteDifference / 60));
      timeLeft.innerText = Math.floor(remaining(timeDifference));
      if(timeLeft.innerText == "0") {
        timeLeft.innerText = "LESS THAN 1";
      }
      timeLeft.className = "countdown";
      if(n.hour == last_hour) {
        timeLeft.className += " active";
      }
      li.dataset.fh = n.hour;
      li.appendChild(timeLeft);
      ul.appendChild(li);

      var n_ul = document.createElement("ul");
      n_ul.id = "nodes"+n.hour;
      for(var j = 0; j < n.nodes.length; ++j) {
        var node = n.nodes[j];
        var n_li = document.createElement("li");
        var c = document.createElement("span"),
            it = document.createElement("span"),
            s = document.createElement("span"),
            l = document.createElement("span");

        c.className = "class";
        it.className = "item";
        s.className = "slot";
        l.className = "location";

        n_li.className = c.innerText = node.class;
        it.innerText = node.item;
        if("location" in node) {
          l.innerText = node.location + " (" + node.coordinates[0] + ", " + node.coordinates[1] + ")";
        }

        if("slot" in node) {
          s.innerText = "Slot #"+node.slot;
        }

        n_li.appendChild(c);
        n_li.appendChild(it);
        n_li.appendChild(s);
        n_li.appendChild(l);

        n_ul.appendChild(n_li);
      }
      right.appendChild(n_ul);

      right.children[0].className = "show";
      li.addEventListener("mouseenter", function(event) {
        document.querySelector(".show").className = ""
        document.getElementById("nodes"+event.target.dataset.fh).className = "show";
        document.querySelector("li.active").className = "";
        event.target.className = "active";
      }, false);

    }
    left.appendChild(ul);
    left.children[0].children[0].className = "active";
  } else {
    var cds = document.querySelectorAll(".countdown");
    for(var i = 0; i < cds.length; ++i) {
      var minuteDifference = 60 - date.getUTCMinutes();
      var timeDifference = parseInt(cds[i].dataset.fh) - (1 - (minuteDifference / 60));
      cds[i].innerText = Math.floor(remaining(timeDifference));
      if(cds[i].innerText == "0") {
        cds[i].innerText = "LESS THAN 1";
      }
    }
  }

  eorzea_time.innerText = formatTime(now);
  real_time.innerText = formatTime(start) + " UTC";

  if(daily === null || weekly === null || leve === null ||
     daily - start < 0 || weekly - start < 0 || leve - start < 0) {
    regenTimers();
  }

  dtimer.innerText = formatTime(daily - start, false, true);
  wtimer.innerText = formatTime(weekly - start, true, true);
  ltimer.innerText = formatTime(leve - start, false, true);
  var next =  50 - (Date.now() - start);
  if(next < 5) {
    next = 100;
  }
  setTimeout(tick, next);
}, init = function() {
  for(var key in window.nodes) {
    var number = parseInt(key);
    logicdata[number] = {hour: number, nodes: window.nodes[key]};

    var row = document.createElement("div");
    row.className = "row";
    var checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = "seenabled"+number;
    checkbox.checked = localStorage[checkbox.id] || false;
    checkbox.addEventListener("mousedown", function(event) {
      localStorage[event.target.id] = event.target.checked;
    }, false);
    row.appendChild(checkbox);

    var rowTime = document.createElement("span");

    var rt = number, meridiem = "AM";
    if(rt > 11) {
      rt -= 12;
      meridiem = "PM";
    }
    rowTime.innerText = ("00" + rt).substr(-2) + ":00 " + meridiem;
    row.appendChild(rowTime);

    var span1 = document.createElement("span");
    span1.innerText = " | Sound Effect #";
    row.appendChild(span1);

    var rowNumber = document.createElement("input");
    rowNumber.id = "se"+number;
    rowNumber.min = 1;
    rowNumber.max = 16;
    rowNumber.value = localStorage[rowNumber.id] || 1;
    rowNumber.type = "number";
    rowNumber.addEventListener("change", function(event) {
      localStorage[event.target.id] = event.target.value;
    }, false);
    row.appendChild(rowNumber);

    var span2 = document.createElement("span");
    span2.innerText = " | ";
    row.appendChild(span2);

    var button = document.createElement("button");
    button.innerText = "Test";
    button.id="sebutton"+number;
    row.appendChild(button);
    button.addEventListener("mouseup", function(event) {
      playSound(document.getElementById("se"+event.target.id.replace("sebutton", "")).value);
    }, false);

    settingsRows.appendChild(row);
  }

  document.getElementById("close").addEventListener("mousedown", function() {
    settings.style.display = blacken.style.display = "none";
  }, false);

  document.getElementById("cog").addEventListener("mousedown", function() {
    settings.style.display = blacken.style.display = "block";
  }, false);

  tick();
}, sortByTime = function(hours) {
  var _ = logicdata.concat([]);
  for(var i = 0; i < hours; ++i) {
    _.push(_.shift());
  }
  return _;
}

init();
