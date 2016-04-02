"use strict";
var stage = new PIXI.HexGrid(26, 21, 30, "#000000", false);
//var renderer = PIXI.autoDetectRenderer(stage.width, stage.height, {backgroundColor: 0x66ff99});
var renderer = PIXI.autoDetectRenderer(stage.width, stage.height, {backgroundColor: 0x66ff99});
document.body.appendChild(renderer.view);


var linkTexture = new PIXI.Texture(PIXI.BaseTexture.fromImage("/images/link.jpg"));
var lSprite = new PIXI.Sprite(linkTexture);
stage.addChild(lSprite);
lSprite.x = 40;
lSprite.y = 40;
lSprite.height= 25;
lSprite.width = 25;
lSprite.anchor.x = 0.5;
lSprite.anchor.y = 0.5;

//stage.swapChildren(stage.gridSprite, lSprite);

var stage2 = new PIXI.Container();
//stage2.addChild(stage.gridSprite);
//stage2.addChild(lSprite);


requestAnimationFrame(animate);

var moveDist = 0.5;

function animate() {
  requestAnimationFrame(animate);
/*
  lSprite.x += moveDist;
  lSprite.y += moveDist;

  lSprite.rotation += 0.1;
*/
  if (lSprite.x > renderer.width || lSprite.y > renderer.height){
    moveDist = -1*moveDist;
  }

  renderer.render(stage);
};