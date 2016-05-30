var dev = {};
requirejs(['./pixi-hexgrid', './hex-combat-engine'], function(PIXI, CE){
  "use strict";
  let renderer = PIXI.autoDetectRenderer(800, 800, {backgroundColor: 0xffffff, antialias: true});
  document.body.appendChild(renderer.view);

//initialize Combat Engine
  let cE = new CE(renderer);

//initialize Combatants

  let bowman = new PIXI.BaseTexture.fromImage("/images/bowman.png");
  let bowmanTextures = [];
  let down = 64*19;
  for (let i = 0; i < 13; i++){
    let rect = new PIXI.Rectangle(64*i, down, 64, 64);
    let texture = new PIXI.Texture(bowman, rect);
    bowmanTextures[i] = texture;
  }

  let bowmanSprite = new PIXI.Sprite(bowmanTextures[0]);
  bowmanSprite.width = 50;
  bowmanSprite.height = 50;
  bowmanSprite.anchor.x = .5;
  bowmanSprite.anchor.y = .5;

  let b1 = CE.Combatant.combatantBuilder()
    .sprite(bowmanSprite)
    .hp(100)
    .influence(40)
    .speed(200)
    .build();


  let bowmanSprite2 = new PIXI.Sprite(bowmanTextures[0]);
  bowmanSprite2.width = 50;
  bowmanSprite2.height = 50;
  bowmanSprite2.anchor.x = .5;
  bowmanSprite2.anchor.y = .5;
  bowmanSprite2.tint = 0x00ff00;

  let b2 = CE.Combatant.combatantBuilder()
    .sprite(bowmanSprite2)
    .hp(150)
    .willfulness(40)
    .speed(250)
    .build();


  let bowmanSprite3 = new PIXI.Sprite(bowmanTextures[0]);
  bowmanSprite3.width = 50;
  bowmanSprite3.height = 50;
  bowmanSprite3.anchor.x = .5;
  bowmanSprite3.anchor.y = .5;
  bowmanSprite3.tint = 0xff0000;

  let b3 = CE.Combatant.combatantBuilder()
    .sprite(bowmanSprite3)
    .hp(90)
    .endurance(40)
    .speed(150)
    .build();


  let bowmanSprite4 = new PIXI.Sprite(bowmanTextures[0]);
  bowmanSprite4.width = 50;
  bowmanSprite4.height = 50;
  bowmanSprite4.anchor.x = .5;
  bowmanSprite4.anchor.y = .5;
  bowmanSprite4.tint = 0x0000ff;

  let b4 = CE.Combatant.combatantBuilder()
    .sprite(bowmanSprite4)
    .hp(900)
    .marksmanship(60)
    .speed(350)
    .build();

  cE.addCombatant("bowman1", b1)
    .addCombatant("bowman2", b2)
    .addCombatant("bowman3", b3)
    .addCombatant("bowman4", b4);

  //Terrain Textures

//tree
  var c = document.createElement("canvas");
  c.width = 50;
  c.height = 50;
  var ctx = c.getContext("2d");
  ctx.fillStyle = "green";

  ctx.beginPath();
  ctx.arc(25, 25, 25, 0, Math.PI*2, false);
  ctx.fill();
  ctx.closePath();

  var treeTexture = PIXI.Texture.fromCanvas(c);

//broken tree
  c = document.createElement("canvas");
  c.width = 50;
  c.height = 50;
  ctx = c.getContext("2d");
  ctx.fillStyle = "green";
  ctx.beginPath();
  ctx.arc(25, 25, 25, 0, Math.PI*2, false);
  ctx.fill();
  ctx.closePath();

  ctx.globalCompositeOperation = "destination-out";
  ctx.fillStyle = "rgb(255, 255, 255, 1)";
  ctx.beginPath();
  ctx.arc(25, 25, 10, 0, Math.PI*2, false);
  ctx.fill();
  ctx.closePath();

  var brokenTreeTexture = PIXI.Texture.fromCanvas(c);

  //Register tree terrain
  PIXI.HexGrid.Terrain.registerNewType("tree", treeTexture, {
    cover: -5,
    concealment: -2,
    fragility: 1
  }, "overlay", -1);
  //Register broken tree terrain
  PIXI.HexGrid.Terrain.registerNewType("broken_tree", brokenTreeTexture, {
    cover: -1,
    concealment: -2,
    fragility: 0
  }, -1);
  //register max occupancy terrain modifier
  PIXI.HexGrid.Terrain.registerNewType("maxOccMod", brokenTreeTexture, {}, "overlay", 4);

  CE.registerBattlefieldType("default", undefined, (hl) => {
    let terrains = [];

    if (Math.floor(Math.random() * 6) === 0){
      terrains.push("tree");
    }
    if (Math.floor(Math.random() * 5) === 0){
      terrains.push("broken_tree");
    }
    if (Math.floor(Math.random() * 7) === 0){
      terrains.push("maxOccMod");
    }

    return terrains;
  });


  let bf = cE.initializeBattlefield("default", 10, 10, 30);
  cE.addCombatantToBattlefield("bowman1", bf, 0, 0)
    .addCombatantToBattlefield("bowman2", bf, 0, 1)
    .addCombatantToBattlefield("bowman3", bf, 0, 2)
    .addCombatantToBattlefield("bowman4", bf, 0, 3);

  let hgm = cE.getBattlefieldHexGridManager(bf);
  hgm.overLayer.alpha = 0.5;

  dev.playPause = cE.initiateCombat(bf);

  dev.cE = cE;
  dev.bf = bf;
  dev.b1 = b1;
  dev.b2 = b2;
  dev.b3 = b3;
  dev.b4 = b4;
  dev.renderer = renderer;
  dev.hgm = hgm;
  dev.CE = CE;
});