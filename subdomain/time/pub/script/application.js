var EZ_TIME_CONSTANT = 20.571428571428574,
    logicdata = new Array(24),
    last_hour = -1,
    data = undefined,
    eorzea_time = document.getElementById("eorzea_time").children[1],
    real_time = document.getElementById("real_time"),
    left = document.getElementById("left").children[1],
    search = document.getElementById("left").children[0].children[0],
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
    ltimer = document.getElementById("leve"),
    sup = document.getElementById("eorzea_time").children[0],
    moonel = document.getElementById("eorzea_time").children[2];

var getSearchResults = function(query) {
  var query = query.toLowerCase();
  var resultset = [];
  if(query.length == 0) {
    return resultset;
  }
  for(var time in window.nodes) {
    var _ = window.nodes[time];
    for(var i = 0; i < _.length; ++i) {
      var n = _[i];
      if(n.item.toLowerCase().indexOf(query) > -1) {
        resultset.push([parseInt(time), i]);
      }
    }
  }
  return resultset;
}, regenTimers = function() {
  currents = Date.now();
  daily = (Math.floor((currents - 54000000) / 86400000) + 1) * 86400000 + 54000000;
  weekly = (Math.floor((currents - 460800000) / 604800000) + 1) * 604800000 + 460800000;
  leve = (Math.floor((currents - 43200000) / 86400000) + 1) * 86400000 + 43200000;
}, getEorzeaTime = function() {
  return Math.floor((Date.now() - 26127360000000) * EZ_TIME_CONSTANT);
}, formatTime = function(epoch, days, shmrd) {
  var date = new Date(epoch);
  var h = date.getUTCHours(), m = date.getUTCMinutes();
  var meridiem = "AM";
  if(h > 12 && !shmrd) {
    if(!days) {
      h -= 12;
    }
    meridiem = "PM";
  }

  if(days && date.getUTCDate() > 1) {
    h += (date.getUTCDate() - 1) * 24
  }

  var H = ("0" + h).substr(-2);
  if(h > 99) {
    H = h;
  }
  var str = H + ":" + ("0" + m).substr(-2) + ":" + ("0" + date.getUTCSeconds()).substr(-2);

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
}, createSearch = function() {
  var s_ul = document.createElement("ul");
  s_ul.id = "searchresult";
  if(document.getElementById("searchresult") !== null) {
    var el = document.getElementById("searchresult");
    s_ul.className = el.className;
    el.parentNode.removeChild(el);
  }

  var now = getEorzeaTime(),
      date = new Date(now),
      hour = date.getUTCHours();

  var results = getSearchResults(search.value);
  for(var i = 0; i < results.length; ++i) {
    var _ = results[i];
    var n = logicdata[_[0]].nodes[_[1]];
    var timeDifference = calculateHours(last_hour, _[0]);
    var timeLeft = document.createElement("span");
    timeLeft.dataset.fh = timeDifference;
    var minuteDifference = 60 - date.getUTCMinutes();
    timeDifference -= (1 - (minuteDifference / 60));
    timeLeft.textContent = Math.floor(remaining(timeDifference));
    if(timeLeft.textContent == "0") {
      timeLeft.textContent = "< 1";
    }
    timeLeft.textContent = timeLeft.textContent + " MINS";
    if(_[0] == last_hour) {
      timeLeft.textContent = "NOW";
    }

    timeLeft.dataset.class = i;
    var h = _[0];
    if(h > 12) {
      h -= 12;
    }
    timeLeft.textContent = n.class + " / " + timeLeft.textContent + " / " + (h)+" "+(_[0] > 12 ? "PM" : "AM");
    timeLeft.className = "class srch";

    var item = document.createElement("span");
    item.textContent = n.item;
    item.className = "item";

    var slot = document.createElement("span");
    slot.className = "slot";
    if("slot" in n) {
      slot.textContent = "Slot #"+n.slot;
    }

    var loc = document.createElement("span");
    loc.className = "location";
    if("location" in n) {
      loc.textContent = n.location + " (" + n.coordinates[0] + ", " + n.coordinates[1] + ")";
    }

    var li = document.createElement("li");
    li.appendChild(timeLeft);
    li.appendChild(item);
    li.appendChild(slot);
    li.appendChild(loc);
    s_ul.appendChild(li);
  }
  right.appendChild(s_ul);
}, updateSearch = function() {
  var query = document.querySelectorAll("srch");
  for(var i = 0; i < query.length; ++i) {
    var _ = results[i];
    var n = logicdata[_[0]].nodes[_[1]];
    var timeDifference = calculateHours(last_hour, _[0]);
    var timeLeft = document.createElement("span");
    var minuteDifference = 60 - date.getUTCMinutes();
    timeDifference -= (1 - (minuteDifference / 60));
    str = Math.floor(remaining(timeDifference));
    if(timeLeft.textContent == "0") {
      str = "< 1";
    }
    if(n.hour == last_hour) {
      str = "NOW";
    }

    timeLeft.dataset.class = i;
    str = n.class + " / " + str;
    srch.innerText = str;
  }
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
    for(var i = 0; i <= 24; ++i) {
      var n = data[i];
      if(n === undefined) {
        continue;
      }
      var li = document.createElement("li");
      var hour = n.hour,
          meridiem = "AM";
      if(hour > 12) {
        hour -= 12;
        meridiem = "PM";
      }

      li.textContent = ("0" + hour).substr(-2) + ":00 " + meridiem;

      var timeDifference = calculateHours(last_hour, n.hour);
      var timeLeft = document.createElement("span");
      timeLeft.dataset.fh = timeDifference;
      var minuteDifference = 60 - date.getUTCMinutes();
      timeDifference -= (1 - (minuteDifference / 60));
      timeLeft.textContent = Math.floor(remaining(timeDifference));
      if(timeLeft.textContent == "0") {
        timeLeft.textContent = "LESS THAN 1";
      }
      timeLeft.className = "countdown";
      if(n.hour == last_hour) {
        li.classList.add("active");
        li.classList.add("now");
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

        n_li.className = c.textContent = node.class;
        it.textContent = node.item;
        if("location" in node) {
          l.textContent = node.location + " (" + node.coordinates[0] + ", " + node.coordinates[1] + ")";
        }

        if("slot" in node) {
          s.textContent = "Slot #"+node.slot;
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
        document.querySelector(".active").classList.remove("active");
        event.target.classList.add("active");
      }, false);
    }
    createSearch();
    left.appendChild(ul);
    left.children[0].children[0].classList.add("active");

    var ace = Aetheryte.getEorzeaTimeAce(),
        element = Aetheryte.getElement(ace),
        moon = "moon_"+["0", "-25", "-50", "-75", "100", "+75", "+50", "+25"][Aetheryte.getMoonPhase(ace).phase]+".png",
        nightday = "night";
    if(ace.h >= 6 && ace.h < 18) {
      nightday = "day";
    }

    moonel.className = "phase " + nightday;
    moonel.children[1].src = "/cycle/"+moon;
    moonel.children[0].title = moonel.children[1].title = Aetheryte.getMoonPhase(ace).moon;

    sup.children[0].src = "/cycle/"+element.hour+".png";
    sup.children[0].title = (element.astral ? "astral" : "umbral") + " " + element.hour;
  } else {
    var cds = document.querySelectorAll(".countdown");
    for(var i = 0; i < cds.length; ++i) {
      var minuteDifference = 60 - date.getUTCMinutes();
      var timeDifference = parseInt(cds[i].dataset.fh) - (1 - (minuteDifference / 60));
      cds[i].textContent = Math.floor(remaining(timeDifference));
      if(cds[i].textContent == "0") {
        cds[i].textContent = "LESS THAN 1";
      }

      if(["0", "1"].indexOf(cds[i].textContent) > -1) {
        cds[i].classList.add("single");
      } else {
        cds[i].classList.remove("single");
      }
    }
  }

  eorzea_time.textContent = formatTime(now);
  real_time.textContent = formatTime(start) + " UTC";

  if(daily === null || weekly === null || leve === null ||
     daily - start < 0 || weekly - start < 0 || leve - start < 0) {
    regenTimers();
  }

  dtimer.textContent = formatTime(daily - start, false, true);
  wtimer.textContent = formatTime(weekly - start, true, true);
  ltimer.textContent = formatTime(leve - start, false, true);
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
    if(rt > 12) {
      rt -= 12;
      meridiem = "PM";
    }
    rowTime.textContent = ("00" + rt).substr(-2) + ":00 " + meridiem;
    row.appendChild(rowTime);

    var span1 = document.createElement("span");
    span1.textContent = " | Sound Effect #";
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
    span2.textContent = " | ";
    row.appendChild(span2);

    var button = document.createElement("button");
    button.textContent = "Test";
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

  var ifnc = function(event) {
    document.querySelector(".show").className = ""
    document.getElementById("searchresult").className = "show";
    document.querySelector(".active").classList.remove("active");
    event.target.classList.add("active");
  }
  left.parentNode.children[0].addEventListener("mouseenter", ifnc, false);
  search.addEventListener("keyup", function(event) {
    ifnc({target: left.parentNode.children[0]});
    createSearch();
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
