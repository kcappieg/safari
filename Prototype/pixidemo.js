"use strict";
var stage = new PIXI.HexGrid(20, 15, 30, false);
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

stage.addCitizen(bowmanSprite, "bowman", 0, 0);
stage.addCitizen(bowmanSprite2, "bowman2", 0, 1);

var elapsed = 0;
var frame = 0;
var order = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 2, 1, 0];
function fireBow(tickerLite, sprite, deregister){
  elapsed += tickerLite.deltaTime;
  if (elapsed >= 3){
    sprite.texture = bowmanTextures[order[frame]];
    frame++;
    elapsed = 0;
    if (frame === order.length){
      frame = 0;
      elapsed = 0;
      deregister();
    }
  }
}
function fireBowInterrupt(tickerLite, sprite){
  sprite.texture = bowmanTextures[0];
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
  fragility: 1,
  maxOccupancy: -1
}, "overlay");
//Register broken tree terrain
PIXI.HexGrid.Terrain.registerNewType("broken tree", brokenTreeTexture, {
  cover: -1,
  concealment: -2,
  fragility: 0,
  maxOccupancy: -1
});

stage.addTerrain(6, 13, "broken tree");
stage.addTerrain(10, 3, "tree");

/* Former test of nearest neighbor function
var upperLeft = stage.hexAt(10, 10);
var g = new PIXI.Graphics();
stage.addChild(g);
stage.on("click", function(e){
  try{
    var destinationHex = dev.kd.nearestNeighbor(e.data.global.x, e.data.global.y);

    g.clear();
    g.lineStyle(2, 0x000000);
    g.moveTo(upperLeft.x, upperLeft.y);
    g.lineTo(destinationHex.x, destinationHex.y);

    var hexes = stage.hexesBetween(upperLeft.gridX, upperLeft.gridY, destinationHex.gridX, destinationHex.gridY);
    g.lineStyle(2, 0x00FF00);

    hexes.forEach(function(el){
      g.beginFill(0xFFFFFF, 0.0);
      g.drawCircle(el.x, el.y, 20);
      g.endFill();
    });
  } catch(e){
    console.log(e.stack)
    console.log(e)
  }
});
*/

function animate() {
  requestAnimationFrame(animate);

  renderer.render(stage);
}

requestAnimationFrame(animate);