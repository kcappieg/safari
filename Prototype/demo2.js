var dev = {};
requirejs(['./pixi-hexgrid', './hex-combat-engine'], function(PIXI, CE){
  "use strict";
  let renderer = PIXI.autoDetectRenderer(800, 800, {backgroundColor: 0xffffff, antialias: true});
  document.body.appendChild(renderer.view);

  PIXI.HexGrid.setMaxOccupancy(4);

//initialize Combat Engine
  let cE = new CE(renderer);

//initialize Combatants
  
  dev.flag = false;
  //define wait action
  function setWaitAction(next, resolve, actionBuilder){
    if (!dev.flag){
      actionBuilder.appendAction(CE.Action.WAIT, 1000);
      actionBuilder.ready = true;
      return resolve(actionBuilder);
    }

    next(actionBuilder);
  }

  //define setMoveAction function
  function setMoveAction(next, resolve, actionBuilder){
    if (actionBuilder.data.length < 1){
      return next(actionBuilder);
    }

    actionBuilder.appendAction(CE.Action.MOVE, actionBuilder.data[0]);
    actionBuilder.ready = true;
    resolve(actionBuilder);
  }  

  function moveAndAttack(next, resolve, actionBuilder){
    if (actionBuilder.data.length < 1){
      return next(actionBuilder);
    }

    actionBuilder.appendAction(CE.Action.MOVE, actionBuilder.data[0]);
    actionBuilder.appendAction(CE.Action.ATTACK, actionBuilder.data[0]);
    actionBuilder.ready = true;
    resolve(actionBuilder);
  }

  function setMoveAction2(next, resolve, actionBuilder){
    let gridX = Math.floor((Math.random() * 15));
    let gridY = Math.floor((Math.random() * 15));

    actionBuilder.appendAction(CE.Action.MOVE, {gridX:gridX, gridY:gridY});
    actionBuilder.ready = true;
    resolve(actionBuilder);
  }

//attack animation
  function initializeFireBow(){
    var elapsed = 0;
    var frame = 0;
    var order = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 2, 1, 0];

    return function fireBow(tickerLite, citizen, deregister){
      elapsed += tickerLite.deltaTime;
      if (elapsed >= 3){
        citizen.sprite.texture = bowmanTextures[order[frame]];
        frame++;
        elapsed = 0;
        if (frame === order.length){
          frame = 0;
          elapsed = 0;
          deregister();
        }
      }
    }
  }
  

//create the weapon. We'll say sword even though they're bowmen
  const sword = new CE.Weapon("sword", CE.Weapon.MELEE, 0, [4, 10]);

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
    .speed(50)
    .build();

  b1.setAnimation(CE.Action.ATTACK, initializeFireBow());
  b1.setGear(CE.Combatant.WEAPON1, sword);

  b1.setActionChain()
    .then(setWaitAction)
    .then(moveAndAttack);

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
    .speed(60)
    .build();

  b2.setAnimation(CE.Action.ATTACK, initializeFireBow());
  b2.setGear(CE.Combatant.WEAPON1, sword);

  b2.setActionChain()
    .then(setWaitAction)
    .then(moveAndAttack);


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
    .speed(55)
    .build();

  b3.setAnimation(CE.Action.ATTACK, initializeFireBow());
  b3.setGear(CE.Combatant.WEAPON1, sword);

  b3.setActionChain()
    .then(setWaitAction)
    .then(moveAndAttack);


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
    .speed(40)
    .build();

  b4.setAnimation(CE.Action.ATTACK, initializeFireBow());
  b4.setGear(CE.Combatant.WEAPON1, sword);

  b4.setActionChain()
    .then(setWaitAction)
    .then(moveAndAttack);

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


  let bf = cE.initializeBattlefield("default", 15, 15, 30);
  cE.addCombatantToBattlefield("bowman1", bf, 10, 0)
    .addCombatantToBattlefield("bowman2", bf, 5, 8)
    .addCombatantToBattlefield("bowman3", bf, 3, 10)
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