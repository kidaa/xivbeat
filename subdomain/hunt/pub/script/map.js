var hunt = function(query, id, language) {
  this.regions = {};
  for(var i = 0; i < hunt.configuration.regions.length; ++i) {
    var r = hunt.configuration.regions[i];
    this.regions[r.id] = i;
  }

  this.e = document.querySelector(query);
  this.l = language;
  this.id = this.regions[id];

  var opt = {
    minZoom: hunt.configuration.min,
    maxZoom: hunt.configuration.max,
    inPng: true,
    mapTypeControl: false,
    center: new google.maps.LatLng(0, 0),
    streetViewControl: false,
    zoom: hunt.configuration.min,
    draggableCursor: "default",
    backgroundColor: "#000000",
    mapTypeControlOptions: {
      mapTypeIds: [google.maps.MapTypeId.ROADMAP, "eorzea"]
    }
  };

  var self = this;
  this.tile = new google.maps.ImageMapType({
    name: "Eorzea",
    minZoom: hunt.configuration.min,
    maxZoom: hunt.configuration.max,
    getTileUrl: function(c, z) {
      var url = null;
      if(c.x >= 0 && c.x <= hunt.configuration.span[z][0]) {
        if(c.y >= 0 && c.y <= hunt.configuration.span[z][1]) {
          url = hunt.configuration.base + hunt.configuration.regions[self.id].map + "/" + z + "_" + c.x + "_" + c.y + "." + hunt.configuration.ext;
        }
      }
      return url;
    },
    tileSize: new google.maps.Size(256, 256)
  });
  var m = new google.maps.Map(this.e, opt);
  m.mapTypes.set("eorzea", this.tile);
  m.setMapTypeId("eorzea");

  var xyc = document.createElement("div");
  xyc.style.fontFamily = "Arial, sans-serif";
  xyc.style.fontSize = "40px",
  xyc.style.textAlign = "center";
  xyc.style.background = "rgba(0, 0, 0, 0.5)";
  xyc.style.color = "white";
  xyc.style.padding = "5px";
  xyc.innerHTML = "(00, 00)";
  this.coords = xyc;

  m.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(xyc);

  google.maps.event.addListener(m, "mousemove", function(event) {
    self.updateCoords(event.ia);
  });

  this.map = m;
  this.heatmap = new google.maps.visualization.HeatmapLayer({data: [], dissipating: false, radius: 2});
  this.heatmap.setMap(m);
}

hunt.prototype.updateCoords = function(coords) {
  var x = Math.floor(coords.x/(256/42));
  var y = Math.floor(coords.y/(256/42));
  if(x > 41 || y > 41 || x < 0 || y < 0) {
    return;
  }
  x = ("0"+x).substr(-2);
  y = ("0"+y).substr(-2);
  this.coords.innerHTML = "("+([x,y].join(", "))+")";
}
