//Licensed under the ISC license.
//Copyright 2014 Yuki Ahmed

var request = require("request"),
    jsdom = require("jsdom").jsdom;

var ROOT        = "http://na.finalfantasyxiv.com/lodestone/",
    CHARACTER   = ROOT + "character/";
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
  grandCompanyRank: ".chara_profile_list li:nth-child(3) strong",
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
  getCharacterInfo: function(id, callback) {
    id = parseInt(id);

    createDOM(CHARACTER + id + "/", function(window, document) {
      if(document.querySelector(ERROR_FOF) !== null) {
        return callback(null, null);
      } else if(document.querySelector(ERROR_CHECK) !== null) {
        return callback(document.querySelector(ERROR_RESULT).textContent, null);
      }

      var result = {};
      for(var key in CHARACTER_MAP) {
        if(CHARACTER_MAP[key] == null) {
          result[key] = "";
          continue;
        }

        var el = document.querySelector(CHARACTER_MAP[key]);
        if(el != null) {
          el = el.textContent;
        } else {
          el = ""
        }
        result[key] = el;
      }

      for(var key in CHARACTER_MAP_NUMBERS) {
        var el = document.querySelector(CHARACTER_MAP_NUMBERS[key]);
        if(el != null) {
          el = parseInt(el.textContent);
        } else {
          el = 0;
        }
        result[key] = el;
      }

      result.id = id;

      try {
        result.picture = document.querySelector(CHARACTER_PIC).src.split("?")[0];
      } catch(ex) {}
      try {
        result.pictureLarge = document.querySelector(CHARACTER_PICL).src.split("?")[0];
      } catch(ex) {}

      try {
        var ethnicity = document.querySelector(CHARACTER_ETHNICITY).textContent.split("/");
        result.race = ethnicity[0].trim();
        result.subrace = ethnicity[1].trim();
        result.sex = (ethnicity[2].trim() == "♀") ? "F" : "M";
      } catch(ex) {}

      result.server = result.server.trim().substr(1, result.server.length - 3);

      result.freeCompany = "none";
      try {
        result.freeCompany = {
          name: document.querySelector(CHARACTER_FC).textContent,
          id: parseInt(document.querySelector(CHARACTER_FC).href.split("/").splice(-2).shift())
        };
      } catch(ex) {}

      var els = document.querySelectorAll(".param_list li");
      for(var i = 0; i < els.length; ++i) {
        try {
          var el = els[i];
          var key = el.querySelector(CHARACTER_PRMK).textContent,
              value = el.querySelector(CHARACTER_PRMV).textContent;

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
            var name = row.children[j].textContent.toLowerCase().trim();
            if(name.length == 0) {
              continue;
            }
            result.classes[name] = {
              level: parseInt(row.children[j + 1].textContent.trim()) || 0,
              exp: parseInt(row.children[j + 2].textContent.split("/")[0].trim()) || 0
            }
          } catch(ex) {
            continue;
          }
        }
      }

      callback(null, result);
    });
  }
};

exports = module.exports = Lodestone;
