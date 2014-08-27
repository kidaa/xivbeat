    //byte 1
var MASK_TANK  = 1,
    MASK_HEAL  = 2,
    MASK_MELEE = 4,
    MASK_RANGE = 8, //DPS = 4 | 8 = 12
    //byte 2
    MASK_HEAD  = 1,
    MASK_BODY  = 2,
    MASK_HAND  = 4,
    MASK_BELT  = 8,
    MASK_LEGS  = 16,
    MASK_FEET  = 32,
    MASK_MHAND = 64,
    MASK_OHAND = 128,
    MASK_NECK  = 256,
    MASK_EAR   = 512,
    MASK_WRIST = 1024,
    MASK_RING  = 2048,
    MASK_OTHER = 4096;


var traditional = [ //Syrcus Tower
  [1, 2, 2, 12, 12, 12, 12, 12], //tank heal heal dps dps dps dps dps
  [1, 2, 2, 12, 12, 12, 12, 12],
  [1, 2, 2, 12, 12, 12, 12, 12],
];

var matching = [ //what loot do they want?
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0]
], typing = [    //what are they?
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0]
], naming = [    //who are they?
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""]
];

var client = new Faye.Client('/faye', {
    retry: 5
});

client.disable("websocket");
