////Licensed under the ISC license.
//Copyright 2014 Yuki Ahmed

//Tool to download map parts from XIVDB.com
//Thanks XIVDB!

var fs = require("fs"),
    ph = require("path"),
    rq = require("request"),
    dt = require("./conversion_table"),
    kt = Object.keys(dt);

var layers = [
  [0, 0, 1, 1, 1],
  [0, 0, 3, 3, 2],
  [0, 0, 7, 7, 3]
];

var root = ph.resolve(__dirname, "..", "pub", "regions");
var base = "http://xivdbimg.zamimg.com/modules/maps/Tiles/";

var next = function(f, l, x, y) {
  if(f === undefined && l === undefined && x === undefined && y === undefined) {
    return next(kt.shift(), 0, layers[0][0], layers[0][1]);
  }

  if(f === undefined) {
    console.log("Done");
  }

  if(l >= layers.length) {
    return next(kt.shift(), 0, layers[0][0], layers[0][1]);
  }

  if(x > layers[l][2]) {
    return next(f, l, layers[l][0], y + 1);
  }

  if(y > layers[l][3]) {
    return next(f, l + 1, layers[l][0], layers[l][1]);
  }

  var path = ph.resolve(root, f);
  if(!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }

  console.log(f, "L"+(l+1)+"X"+x+"Y"+y);


  var name = layers[l][4] + "_" + (layers[l][0]+x) + "_" + (layers[l][1]+y) + ".png";
  var url = base + dt[f] + "/" + name;
  if(fs.existsSync(ph.resolve(path, name))) {
    return next(f, l, x + 1, y);
  }
  var stream = fs.createWriteStream(ph.resolve(path, name));
  stream.on("finish", function() {
    next(f, l, x + 1, y);
  });
  rq(url).pipe(stream);
}

next();
