//Licensed under the ISC license.
//Copyright 2014 Yuki Ahmed

var request = require("request"),
    jsdom = require("jsdom").jsdom;

var ROOT        = "http://na.finalfantasyxiv.com/lodestone/",
    CHARACTER   = ROOT + "character/",
    FREECOMPANY = ROOT + "freecompany/";
    /*
    ACHIEVEMENT = "achievement/kind/",
    ACH_TYPES   = 13,
    BLOG        = "blog/",
    FRIENDS     = "friend/?order=1&page=",
    FOLLOWING   = "following/?order=1&page=";
    */

//begin character block
var CHARACTER_MAP = {
  id: null,
  picture: null,
  pictureLarge: null,
  name: ".player_name_txt h2 a",
  title: ".chara_title",
  server: ".player_name_txt h2 span",
  race: null,
  subrace: null,
  sex: null,
  nameday: ".chara_profile_list li:nth-child(1) .pr20 tr:nth-child(1) td:nth-child(2) strong",
  guardian: ".chara_profile_list li:nth-child(1) .pr20 tr:nth-child(2) td:nth-child(2) strong",
  city: ".chara_profile_list li:nth-child(2) strong",
  grandCompany: ".chara_profile_list li:nth-child(3) strong",
  freeCompany: null,
  profile: ".txt_selfintroduction",
  classes: null
}

var CHARACTER_MAP_NUMBERS = {
  hp: ".hp",
  mp: ".mp",
  tp: ".tp",
  strength: ".str",
  dexterity: ".dex",
  vitality: ".vit",
  intelligence: ".int",
  mind: ".mnd",
  piety: ".pie",
  fireResistance: ".fire .val",
  iceResistance: ".ice .val",
  windResistance: ".wind .val",
  earthResistance: ".earth .val",
  thunderResistance: ".thunder .val",
  waterResistance: ".water .val"
};

var CHARACTER_ETHNICITY = ".chara_profile_title",
    CHARACTER_FC        = ".chara_profile_list li:nth-child(4) strong a",
    CHARACTER_PIC       = ".player_name_thumb img",
    CHARACTER_PICL      = ".img_area.bg_chara_264 img",
    CHARACTER_PARM      = ".param_list li",
    CHARACTER_PRMK      = ".left",
    CHARACTER_PRMV      = ".right",
    CHARACTER_CLASS     = ".class_list tr";
//end character block

//begin freecompany block
var FC_MAP = {
  id: null,
  crest: null,
  name: ".ic_freecompany_box .crest_id .txt_brown",
  server: ".ic_freecompany_box .crest_id span:last-child",
  tag: null,
  slogan: ".area_inner_body .table_black > table:first-child > tr:nth-child(6) td",
  created: ".area_inner_body .table_black > table:first-child > tr:nth-child(2) td script",
  rank: ".area_inner_body .table_black > table:first-child > tr:nth-child(4) td",
  members: ".area_inner_body .table_black > table:first-child > tr:nth-child(3) td",
  weeklyRank: null,
  monthlyRank: null,
  focus: null,
  seeking: null,
  active: ".area_inner_body .table_black > table:first-child > tr:nth-child(9) td",
  recruiting: ".area_inner_body .table_black > table:first-child > tr:nth-child(10) td",
  estate: null
}

var FC_CREST    = ".ic_crest_64 img",
    FC_TAG      = ".area_inner_body table:first-child > tr:first-child td",
    FC_RANKING  = ".area_inner_body .table_black > table:first-child > tr:nth-child(5) td",
    FC_FOCUS    = ".focus_icon li",
    FC_SEEKING  = ".roles_icon li",
    FC_ESTATE   = ".area_inner_body .table_black > table:first-child > tr:nth-child(11) td"


var ERROR_CHECK  = ".base_visual_error",
    ERROR_FOF    = ".error_404",
    ERROR_RESULT = ".area_inner";

var createRequest = function(url, callback) {
  return request.get({url: url, json: true}, callback);
}

var createDOM = function(url, callback) {
  jsdom.env({
    url: url,
    features: {
      QuerySelector: true,
      ProcessExternalResources: false,
      SkipExternalResources: true
    },
    done: function(errs, window) {
      callback(window, window.document);
    }
  });
}

var Lodestone = {
  preprocess: function(document, map, map_float) {
    var result = {};
    for(var key in map) {
      if(map[key] == null) {
        result[key] = "";
        continue;
      }

      var el = document.querySelector(map[key]);
      if(el != null) {
        el = el.textContent.trim();
      } else {
        el = ""
      }
      result[key] = el;
    }

    if(map_float !== undefined) {
      for(var key in map_float) {
        var el = document.querySelector(map_float[key]);
        if(el != null) {
          el = parseFloat(el.textContent.trim());
        } else {
          el = 0;
        }
        result[key] = el;
      }
    }
    return result;
  },
  getCharacterInfo: function(id, callback) {
    id = parseInt(id);

    createDOM(CHARACTER + id + "/", function(window, document) {
      if(document.querySelector(ERROR_FOF) !== null) {
        return callback(null, null);
      } else if(document.querySelector(ERROR_CHECK) !== null) {
        return callback(document.querySelector(ERROR_RESULT).textContent.trim(), null);
      }

      var result = Lodestone.preprocess(document, CHARACTER_MAP, CHARACTER_MAP_NUMBERS);

      result.id = id;

      try {
        result.picture = document.querySelector(CHARACTER_PIC).src.split("?")[0];
      } catch(ex) {}
      try {
        result.pictureLarge = document.querySelector(CHARACTER_PICL).src.split("?")[0];
      } catch(ex) {}

      try {
        var ethnicity = document.querySelector(CHARACTER_ETHNICITY).textContent.trim().split("/");
        result.race = ethnicity[0].trim();
        result.subrace = ethnicity[1].trim();
        result.sex = (ethnicity[2].trim() == "♀") ? "F" : "M";
      } catch(ex) {}

      result.server = result.server.trim().substr(1, result.server.length - 2);

      try {
        result.grandCompany = {
          name: result.grandCompany.split("/")[0],
          rank: result.grandCompany.split("/")[1]
        }
      } catch(ex) {}
      result.freeCompany = "none";
      try {
        result.freeCompany = {
          name: document.querySelector(CHARACTER_FC).textContent.trim(),
          id: parseInt(document.querySelector(CHARACTER_FC).href.split("/").splice(-2).shift())
        };
      } catch(ex) {}

      var els = document.querySelectorAll(".param_list li");
      for(var i = 0; i < els.length; ++i) {
        try {
          var el = els[i];
          var key = el.querySelector(CHARACTER_PRMK).textContent.trim(),
              value = el.querySelector(CHARACTER_PRMV).textContent.trim();

          key = key.split(" ").join("");
          key = key.substr(0, 1).toLowerCase() + key.substr(1);
          result[key] = parseInt(value);
        } catch(ex) {
          continue;
        }
      }

      result.classes = {};
      var rows = document.querySelectorAll(".class_list tr");
      for(var i = 0; i < rows.length; ++i) {
        var row = rows[i];
        for(var j = 0; j < row.children.length; j += 3) {
          if(row.children.length < j + 2) {
            break;
          }

          try {
            var name = row.children[j].textContent.trim().toLowerCase().trim();
            if(name.length == 0) {
              continue;
            }
            result.classes[name] = {
              level: parseInt(row.children[j + 1].textContent.trim().trim()) || 0,
              exp: parseInt(row.children[j + 2].textContent.trim().split("/")[0].trim()) || 0
            }
          } catch(ex) {
            continue;
          }
        }
      }

      callback(null, result);
    });
  },
  getFreeCompanyInfo: function(id, callback) {
    createDOM(FREECOMPANY + id + "/", function(window, document) {
      if(document.querySelector(ERROR_FOF) !== null) {
        return callback(null, null);
      } else if(document.querySelector(ERROR_CHECK) !== null) {
        return callback(document.querySelector(ERROR_RESULT).textContent.trim(), null);
      }

      var result = Lodestone.preprocess(document, FC_MAP);

      result.id = id;

      try {
        result.crest = [];
        var crest = document.querySelectorAll(FC_CREST);
        for(var i = 0; i < crest.length; ++i) {
          result.crest.push(crest[i].src);
        }
      } catch(ex) {}

      try {
        result.server = result.server.substr(1, result.server.length - 2);
      } catch(ex) {}

      try {
        result.tag = document.querySelector(FC_TAG).childNodes[2].textContent.trim();
      } catch(ex) {}

      try {
        result.created = parseInt(result.created.split("ftime(")[1].split(",")[0]) * 1000;
      } catch(ex) {}


      try {
        var ranking_ = document.querySelector(FC_RANKING).textContent.trim().split("\n");
        var ranking = [];
        for(var i = 0; i < ranking_.length; ++i) {
          ranking_[i] = ranking_[i].trim();
          if(ranking_[i].length > 0) {
            ranking.push(ranking_[i]);
          }
        }
        result.weeklyRank = parseInt(ranking[0].split(": ")[1].split(" ")[0]);
        result.monthlyRank = parseInt(ranking[1].split(": ")[1].split(" ")[0]);
      } catch(ex) {}

      try {
        result.focus = {};
        var focuses = document.querySelectorAll(FC_FOCUS);
        for(var i = 0; i < focuses.length; ++i) {
          var focus = focuses[i];
          var enabled = !(focus.className == "icon_off");
          var name = focus.children[0].title;
          result.focus[name.toLowerCase().split("-").join("")] = enabled;
        }
      } catch(ex) {}

      try {
        result.seeking = {};
        var roles = document.querySelectorAll(FC_SEEKING);
        for(var i = 0; i < roles.length; ++i) {
          var role = roles[i];
          var enabled = !(role.className == "icon_off");
          var name = role.children[0].title;
          result.seeking[name.toLowerCase()] = enabled;
        }
      } catch(ex) {}

      try {
        result.active = result.active.toLowerCase();
      } catch(ex) {}

      try {
        result.recruiting = result.recruiting.toLowerCase();
      } catch(ex) {}

      try {
      result.estate = {
          name: "",
          address: {
            region: "",
            ward: 0,
            plot: 0,
            size: ""
          },
          greeting: ""
        };
        var estate = document.querySelector(FC_ESTATE);
        result.estate.name = estate.children[0].textContent.trim();
        result.estate.greeting = estate.children[4].textContent.trim();
        var address = estate.children[2].textContent.trim().split(",");
        result.estate.address.plot = parseInt(address[0].split(" ")[1]);
        result.estate.address.ward = parseInt(address[1].split(" ")[1]);
        result.estate.address.region = address[2].split("(")[0].trim();
        result.estate.address.size = address[2].split("(")[1].split(")")[0].toLowerCase();
      } catch(ex) {}
      return callback(null, result);
    });
  }
};

exports = module.exports = Lodestone;
