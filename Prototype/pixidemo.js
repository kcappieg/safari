"use strict";
var stage = new PIXI.Stage(0x66ff99);
var renderer = PIXI.autoDetectRenderer(800, 600);
document.body.appendChild(renderer.view);
/*
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
*/

//Attempting to create an image of a hex grid space using a canvas
var canvas = document.createElement("canvas");
canvas.width = 100;
canvas.height = 90; // dimension ratio: 10/9
var ctx = canvas.getContext('2d');

ctx.save();
ctx.strokeStyle = "#FFFFFF";
ctx.lineWidth = 5;
ctx.translate(50, 45);
ctx.beginPath();
var a = (Math.PI * 2) / 6; //get the angle of rotation for each side
var radius = 50 // Radius of polygon

ctx.moveTo(radius, 0);
for (var i=1; i<6; i++){
  ctx.lineTo(radius*Math.cos(a*i), radius*Math.sin(a*i));
}
ctx.closePath();
ctx.stroke();
ctx.restore();
//document.body.appendChild(canvas);
var hexTex = PIXI.Texture.fromCanvas(canvas);

function createHex (factor){
  //scale down by factor. Defaults to 1
  var f = factor || 1;
  var sprite
  sprite = new PIXI.Sprite(hexTex);
  sprite.height = 90/factor;
  sprite.width = 100 / factor;

  return sprite;
}
var sprite = createHex(5);
var sprite2 = createHex(5);
sprite.x = 400;
sprite.y = 300;
sprite2.x = 420;
sprite2.y = 300;

stage.addChild(sprite2);
stage.addChild(sprite);

requestAnimationFrame(animate);

function animate() {
  requestAnimationFrame(animate);

  renderer.render(stage);
};