"use strict";
var stage = new PIXI.HexGrid(26, 21, 30, false);
//var renderer = PIXI.autoDetectRenderer(stage.width, stage.height, {backgroundColor: 0x66ff99});
var renderer = PIXI.autoDetectRenderer(stage.width, stage.height, {backgroundColor: 0xffffff, antialias: true});
document.body.appendChild(renderer.view);

stage.interactive = true;


/*var linkTexture = new PIXI.Texture(PIXI.BaseTexture.fromImage("/images/link.jpg"));
var lSprite = new PIXI.Sprite(linkTexture);
stage.addChild(lSprite);
lSprite.x = 40;
lSprite.y = 40;
lSprite.height= 25;
lSprite.width = 25;
lSprite.anchor.x = 0.5;
lSprite.anchor.y = 0.5;

var sonic = new PIXI.BaseTexture.fromImage("/images/sonic-sprites.png");
var sonic1 = new PIXI.Rectangle(0, 0, 90, 120);
var standingSonicTexture = new PIXI.Texture(sonic, sonic1, sonic1);
var standingSonic = new PIXI.Sprite(standingSonicTexture);
standingSonic.height = 32;
standingSonic.width = 24;
standingSonic.anchor.x = 0.5;
standingSonic.anchor.y = 0.5;
stage.addChild(standingSonic);
stage.moveChildTo(lSprite, 1, 1).moveChildTo(standingSonic, 1, 2);
*/

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

stage.addCitizen(bowmanSprite, "bowman", 0, 0);

//stage.addChild(bowmanSprite);
//stage.moveChildTo(bowmanSprite, 2, 2);

requestAnimationFrame(animate);

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

/*function fireBow (){
  var ticker = new PIXI.ticker.Ticker();
  var elapsed = 0;
  var frame = 0;
  var order = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 2, 1, 0];
  ticker.add(function(){
    console.log(arguments);
    console.log(this.deltaTime);
    elapsed += this.deltaTime
    if (elapsed >= 1){
      bowmanSprite.texture = bowmanTextures[order[frame]];
      frame++;
      elapsed = 0;
      if (frame === order.length){
        ticker.stop();
      }
    }
  }, ticker);

  ticker.speed = 0.3;
  ticker.start();
}*/

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

var upperLeft = stage.coordinatesAt(0, 0);
var g = new PIXI.Graphics();
stage.addChild(g);
g.lineStyle(2);
stage.on("click", function(e){
  g.moveTo(upperLeft.x, upperLeft.y);
  g.lineTo(e.data.global.x, e.data.global.y);
});

function animate() {
  requestAnimationFrame(animate);

  renderer.render(stage);
}