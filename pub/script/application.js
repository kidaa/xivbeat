var GET = function(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.responseType = "json";
  xhr.onreadystatechange = function() {
    if(xhr.readyState == 4) {
      if(xhr.status !== 200) {
        alert("An unexpected error occurred, sorry.")
      }
      callback(xhr.status, xhr.response);
    }
  }
  xhr.send();
};

var domain = location.host.split(".").splice(-2)[0],
    tld = location.host.split(".").splice(-1)[0];

var ROOT = "http://api." + domain + "." + tld + "/";

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
}
var slim = [];
var load =  function() {
  if(metadata === null) {
    metadata = 1;
    return;
  }
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
  check();
};

GET(ROOT + "server_map.json", function(status, response) {
  console.log(status);
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
