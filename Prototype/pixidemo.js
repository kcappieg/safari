"use strict";
var stage = new PIXI.Stage(0x66ff99);
var renderer = PIXI.autoDetectRenderer(800, 600);
document.body.appendChild(renderer.view);

function onAssetLoad (){
  sprite = PIXI.Sprite.fromFrame("sonic1.png");

  //center the anchor point
  sprite.anchor.x = 0.5;
  sprite.anchor.y = 0.5;

  sprite.position.x = 400;
  sprite.position.y = 300
  console.log("loaded");
  console.log(PIXI.Texture);
  stage.addChild(sprite);
  requestAnimationFrame(animate);
}

var sprite
var loader = new PIXI.loaders.Loader("./images", 5);
loader.add('sonic-sprites', 'sonic-sprite-sheet.json');
loader.on('complete', onAssetLoad);
loader.on("progress", function(){console.log(loader);});
loader.load();

function animate() {
  requestAnimationFrame(animate);

  sprite.rotation += 0.01;

  renderer.render(stage);
};