var dev = {};
requirejs(['./pixi-hexgrid'], function(PIXI){
  "use strict";
  var hexGridManager = PIXI.HexGrid.initializeHexGrid(20, 15, 30, true);
  var stage = hexGridManager.grid;
  hexGridManager.ticker.start();
  //var renderer = PIXI.autoDetectRenderer(stage.width, stage.height, {backgroundColor: 0x66ff99});
  var renderer = PIXI.autoDetectRenderer(stage.width, stage.height, {backgroundColor: 0xffffff, antialias: true});
  document.body.appendChild(renderer.view);

  stage.interactive = true;

  var bowman = new PIXI.BaseTexture.fromImage("/images/bowman.png");
  var bowmanTextures = [];
  var down = 64*19;
  for (var i = 0; i < 13; i++){
    var rect = new PIXI.Rectangle(64*i, down, 64, 64);
    var texture = new PIXI.Texture(bowman, rect);
    bowmanTextures[i] = texture;
  }

  var bowmanSprite = new PIXI.Sprite(bowmanTextures[0]);
  bowmanSprite.width = 50;
  bowmanSprite.height = 50;
  bowmanSprite.anchor.x = .5;
  bowmanSprite.anchor.y = .5;

  var bowmanSprite2 = new PIXI.Sprite(bowmanTextures[0]);
  bowmanSprite2.width = 50;
  bowmanSprite2.height = 50;
  bowmanSprite2.anchor.x = .5;
  bowmanSprite2.anchor.y = .5;
  bowmanSprite2.tint = 0x00ff00;

  var bowmanSprite3 = new PIXI.Sprite(bowmanTextures[0]);
  bowmanSprite3.width = 50;
  bowmanSprite3.height = 50;
  bowmanSprite3.anchor.x = .5;
  bowmanSprite3.anchor.y = .5;
  bowmanSprite3.tint = 0xff0000;

  var bowmanSprite4 = new PIXI.Sprite(bowmanTextures[0]);
  bowmanSprite4.width = 50;
  bowmanSprite4.height = 50;
  bowmanSprite4.anchor.x = .5;
  bowmanSprite4.anchor.y = .5;
  bowmanSprite4.tint = 0x0000ff;

  hexGridManager.addCitizen(bowmanSprite, "bowman", 0, 0);
  hexGridManager.addCitizen(bowmanSprite2, "bowman2", 0, 1);
  hexGridManager.addCitizen(bowmanSprite3, "bowman3", 0, 2);
  hexGridManager.addCitizen(bowmanSprite4, "bowman4", 0, 3);

  var elapsed = 0;
  var frame = 0;
  var order = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 2, 1, 0];
  function fireBow(tickerLite, citizen, deregister){
    elapsed += tickerLite.deltaTime;
    if (elapsed >= 3){
      citizen.sprite.texture = bowmanTextures[order[frame]];
      frame++;
      elapsed = 0;
      if (frame === order.length){
        frame = 0;
        elapsed = 0;
        //deregister();
      }
    }
  }
  function fireBowInterrupt(tickerLite, citizen){
    citizen.sprite.texture = bowmanTextures[0];
    frame = 0;
    elapsed = 0;
  }

  function neverStop(){
    var ticker = new PIXI.ticker.Ticker();
    var elapsed = 0;
    var frame = 0;
    ticker.add(function(){
      elapsed += this.deltaTime
      if (elapsed >= 1){
        bowmanSprite.texture = bowmanTextures[frame];
        frame++;
        elapsed = 0;
        if (frame === 13){
          frame = 4;
        }
      }
    }, ticker);

    ticker.speed = 0.3;
    ticker.start();
    return ticker;
  }

  //Terrain Textures

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
  PIXI.HexGrid.Terrain.registerNewType("broken tree", brokenTreeTexture, {
    cover: -1,
    concealment: -2,
    fragility: 0
  }, -1);
  //register max occupancy terrain modifier
  PIXI.HexGrid.Terrain.registerNewType("maxOccMod", brokenTreeTexture, {}, 4);

  var brokenTree = hexGridManager.addTerrain(6, 13, "broken tree");
  var tree = hexGridManager.addTerrain(10, 3, "tree");
  var maxOcc = hexGridManager.addTerrain(0,0, "maxOccMod");
  maxOcc.sprite.alpha = 0;
  tree.sprite.alpha = 0.5;

  var toggle = true;
  hexGridManager.grid.on("click", function(e){
    if (toggle){
      hexGridManager.moveCitizenTo("bowman2", 0, 0, 1000);
      hexGridManager.moveCitizenTo("bowman3", 0, 0, 1000);
      hexGridManager.moveCitizenTo("bowman4", 0, 0, 1000);
    } else {
      hexGridManager.moveCitizenTo("bowman2", 0, 1, 500);
      hexGridManager.moveCitizenTo("bowman3", 0, 2, 500);
      hexGridManager.moveCitizenTo("bowman4", 0, 3, 500);
    }
    toggle = !toggle;
  });

  function animate() {
    requestAnimationFrame(animate);

    renderer.render(stage);
  }

  requestAnimationFrame(animate);
  dev.hgm = hexGridManager;
  dev.fireBow = fireBow;
  dev.fireBowInterrupt = fireBowInterrupt;
  dev.neverStop = neverStop;
});