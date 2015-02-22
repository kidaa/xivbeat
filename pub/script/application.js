  var GET = function(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.responseType = "json";
  xhr.onreadystatechange = function() {
    if(xhr.readyState == 4) {
      if(xhr.status !== 200) {
        for(var i = 0; i < metadata.order.length; ++i) {
          for(var world in map[metadata.order[i]]) {
            document.getElementById(world).className = classes[0] + " " + (showIP ? "ip" : "name");
          }
        }
        return setTimeout(check, 1000 * 15 * 1);
      }
      callback(xhr.status, xhr.response);
    }
  }
  xhr.send();
};


var domain = location.host.split(".").splice(-2)[0],
    tld = location.host.split(".").splice(-1)[0];

var ROOT = location.protocol+"//api." + domain + "." + tld + "/frontier/1.0/";

var metadata = map = null;

var showIP = false;

var classes = ["offline", "online", "partial", "maintenance"];
var refresh = function() {
  var figures = document.getElementById("status").getElementsByTagName("figure");
  for(var i = 0; i < figures.length; ++i) {
    var figure = figures[i];
    figure.className = figure.className.split(" ")[0] + " " + (showIP ? "ip" : "name");
  }
};
var check = function() {
  GET(ROOT + "slim.json", function(status, response) {
    var time = response.shift();
    document.getElementById("timer").children[0].children[0].textContent = (new Date(time)).toUTCString();
    for(var i = 0; i < response.length; ++i) {
      var world = slim[i];
      var el = document.getElementById(world);
      if(el !== null) {
        el.className = classes[response[i]] + " " + (showIP ? "ip" : "name");
      }
    }
    document.getElementById("timer").children[1].textContent = (new Date(Date.now() + (1000 * 15 * 1))).toUTCString();
    setTimeout(check, 1000 * 15 * 1);
  });
};
var padZero = function(number) {
  return ("00" + number).substr(-2);
}
var maintenance_cache = {};
var maintenance_do = function() {
  if(maintenance_cache === null) {
    return maintenance();
  }

  var list = document.querySelector("#affected #list");

  if(list.children.length == 0 && maintenance_cache.services.length > 0) {
    document.getElementById("affected").style.display = "block";
    var span = document.createElement("div");
    span.textContent = maintenance_cache.services.shift();
    list.appendChild(span);

    if(maintenance_cache.services.length > 0) {
      var additional = document.createElement("div");
      additional.id = "additional";

      for(var i = 0; i < maintenance_cache.services.length; ++i) {
        var span = document.createElement("div");
        span.textContent = maintenance_cache.services[i];
        additional.appendChild(span);
      }
      list.appendChild(additional);
      var toggle = document.createElement("div");
      toggle.id = "toggle";
      toggle.textContent = "Show more...";
      toggle.addEventListener("mousedown", function(event) {
        if(event.target.textContent == "Show more...") {
          document.getElementById("additional").style.display = "block"
          event.target.textContent = "Show less..."
        } else {
          document.getElementById("additional").style.display = "none"
          event.target.textContent = "Show more...";
        }
      }, false);
      list.appendChild(toggle);
    }
    if(maintenance_cache.start - 900000 - Date.now() <= 0 && document.getElementById("maintenance").style.backgroundColor != "#C24545") {
      document.getElementById("maintenance").style.backgroundColor = "#C24545";
    }
    if(maintenance_cache.id.length) {
      document.getElementById("planned-maintenance").children[0].children[0].href =
      document.getElementById("ongoing-maintenance").children[0].children[0].href = "http://eu.finalfantasyxiv.com/lodestone/news/detail/" + maintenance_cache.id;
      document.getElementById("planned-maintenance").children[0].children[0].textContent =
      document.getElementById("ongoing-maintenance").children[0].children[0].textContent = "Lodestone";
    } else {
      document.getElementById("planned-maintenance").children[0].children[0].href =
      document.getElementById("ongoing-maintenance").children[0].children[0].href = "";
      document.getElementById("planned-maintenance").children[0].children[0].textContent =
      document.getElementById("ongoing-maintenance").children[0].children[0].textContent = "";
    }
  }

  var now = Date.now();
  var timeUntil = maintenance_cache.start - now,
      timeLeft = maintenance_cache.end - now,
      length = (maintenance_cache.end - maintenance_cache.start) / 3600000,
      duration = (maintenance_cache.end - now) / 3600000;
  if(timeUntil > 0) {
    var date = new Date(timeUntil);
    document.getElementById("ongoing-maintenance").style.display = "none";
    document.getElementsByTagName("section")[0].style.display =
    document.getElementById("planned-maintenance").style.display = "block";
    if(timeUntil > 86400000) {
      document.getElementById("timeleft").textContent = "about " + Math.ceil(timeUntil / 86400000) + " day" + (Math.ceil(timeUntil / 86400000) == 1 ? "" : "s");
    } else {
      document.getElementById("timeleft").textContent = padZero(date.getUTCHours()) + ":" + padZero(date.getUTCMinutes()) + ":" + padZero(date.getUTCSeconds());
    }
    document.getElementById("timeleft").textContent += " and will last " + length + " hour" + (length != 1 ? "s" : "");
  } else if(timeLeft > 0) {
    var date = new Date(timeLeft);
    document.getElementById("planned-maintenance").style.display = "none";
    document.getElementsByTagName("section")[0].style.display =
    document.getElementById("ongoing-maintenance").style.display = "block";
    document.getElementById("ongoing-timeleft").textContent = padZero(Math.floor(duration)) + ":" + padZero(date.getUTCMinutes()) + ":" + padZero(date.getUTCSeconds());
  } else {
    document.getElementsByTagName("section")[0].style.display =
    document.getElementById("ongoing-maintenance").style.display =
    document.getElementById("planned-maintenance").style.display = "none";
    maintenance_cache = null;
    for(var i = 0; i < list.children.length; ++i) {
      list.removeChild(list.children[i]);
    }
  }
  return setTimeout(maintenance_do, 250);
};
var maintenance = function() {
  GET(ROOT + "maintenance.json", function(status, response) {
    if(status == 200) {
      maintenance_cache = response;
      maintenance_do();
    }
  });
}
var slim = [];
var load =  function() {
  if(metadata === null) {
    metadata = 1;
    return;
  }
  var footer = document.getElementsByTagName("footer")[0];
  var status = document.getElementById("status");
  for(var i = 0; i < metadata.order.length; ++i) {
    var article = document.createElement("article");
    var header = document.createElement("header");
    header.textContent = metadata.order[i];
    article.appendChild(header);
    for(var world in map[metadata.order[i]]) {
      var a = document.createElement("a");
      a.href = ("#/world/" + metadata.order[i] + "/" + world).toLowerCase();
      a.title = world;
      var figure = document.createElement("figure");
      figure.id = world;
      slim.push(world);
      figure.className = "offline " + (showIP ? "ip" : "name");
      var ip = document.createElement("span"), empty = document.createElement("span"), name = document.createElement("span");
      ip.textContent = map[metadata.order[i]][world];
      name.textContent = world;

      a.appendChild(figure);
      figure.appendChild(name);
      figure.appendChild(ip);
      figure.appendChild(empty);
      article.appendChild(a);
    }
    status.appendChild(article);
  }
  status.appendChild(footer);
  maintenance();
  check();
};

GET(ROOT + "server_map.json", function(status, response) {
  document.getElementById("names").addEventListener("click", function(event) {
    event.preventDefault();
    this.className = "selected";
    document.getElementById("ips").className = "";
    showIP = false;
    refresh();
  });
  document.getElementById("ips").addEventListener("click", function(event) {
    event.preventDefault();
    this.className = "selected";
    document.getElementById("names").className = "";
    showIP = true;
    refresh();
  });

  map = response;
  if(metadata == 1) {
    metadata = response.metadata;
    return load();
  }
  metadata = response.metadata;
});

document.addEventListener("DOMContentLoaded", load);
