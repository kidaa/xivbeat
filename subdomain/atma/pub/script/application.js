//All credit goes to http://www.toyboxarts.com/XIV/atma/atmclock.html

(function(data, window, undefined) {
  var workspace = document.getElementById("workspace"),
      time = document.getElementById("time"),
      footer = document.getElementsByTagName("footer")[0],
      time_ez = time.children[0],
      time_lo = time.children[1];
  var render = function(template, object) {
    var t = template;
    for(var key in object) {
      var reg = new RegExp("{{" + key + "}}", "ig");
      t = t.replace(reg, object[key]);
    }
    var dummy = document.createElement("body");
    dummy.innerHTML = t;
    return dummy.children;
  }, toggle = function(event) {
    this.classList.toggle("invert");
    window.localStorage[this.id] = this.classList.contains("invert").toString();
  }, tick = function() {
    var start = Date.now(),
        ace = Aetheryte.getEorzeaTimeAce();

    time_ez.textContent = Aetheryte.formatTime(Aetheryte.getEorzeaTime()).string;
    time_lo.textContent = Aetheryte.formatTime(start).string;

    var d = (ace.d - 1) % 8 + 1,
        m = ace.M,
        e = parseInt(ace.h/2),
        u = new Date(start).getUTCHours() % 12,
        j = ((u + 9) % 24) % 12;
    for(var i = 0; i < data.length; ++i) {
      var set = data[i];

      var M = set.m == m,
          D = (set.d == d) || (set.affinity ? (d == 8) : (d == 7)),
          E = set.h[0] == e || set.h[1] == e,
          U = set.h[0] == u || set.h[1] == u,
          J = set.h[0] == j || set.h[1] == j;

      var s = set.row.children[1].children[0].children;
      s[0].className = M ? "active" : "";
      s[1].className = D ? "active" : "";
      s[2].className = E ? "active" : "";
      s[3].className = U ? "active" : "";
      s[4].className = J ? "active" : "";
    }

    var next =  50 - (Date.now() - start);
    if(next < 5) {
      next = 100;
    }
    setTimeout(tick, next);
  }, init = function() {
    var tmpl = document.getElementById("row-template").textContent.trim();
    for(var i = 0; i < data.length; ++i) {
      var ob = render(tmpl, data[i]);
      data[i].row = ob[0];
      workspace.appendChild(ob[0]);
      if(window.localStorage[data[i].row.id] === "true") {
        data[i].row.classList.add("invert");
      }

      var h = data[i].h;
      data[i].h = [h];
      if(h % 2) {
        h--;
      } else {
        h++;
      }
      data[i].h.push(h);
    }
    workspace.appendChild(footer);

    var rows = workspace.children;
    for(var i = 1; i < rows.length; ++i) {
      rows[i].addEventListener("click", toggle, false);
    }

    tick();
  };

  init();
})(window.data, window, undefined);
