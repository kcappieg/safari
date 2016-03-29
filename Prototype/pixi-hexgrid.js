/******************************
Extension for PIXI.js
HexGrid

author Kevin C. Gall
******************************/
if (typeof PIXI !== "object"){
  throw new Error ("Failed to find PIXI object. Be sure PIXI.js is loaded before this extension");
}

(function(){
"use strict";

  function drawHexGrid(hexX, hexY, radius, gridColor, rotate){
    var hexHeight = 2 * Math.cos(30 * (Math.PI / 180)) * radius;
    var xAxis = hexX;
    var yAxis = hexY;

    if (rotate){
      xAxis = hexY;
      yAxis = hexX;
    }

    var cWidth = (Math.floor(xAxis / 2) * radius * 3) + (xAxis % 2 === 1 ? radius * 2 : 0) + 2*radius;
    var cHeight = (yAxis * hexHeight) + 2*radius;

    if (rotate) {
      var trans = cWidth;
      cWidth = cHeight;
      cHeight = trans;
    }


  //initialize texture for grid (using canvas)
    var canvas = document.createElement('canvas');
    canvas.width = cWidth;
    canvas.height = cHeight;
    var ctx = canvas.getContext('2d');

    ctx.beginPath();
    if (rotate){
      ctx.translate(cWidth, 0);
      ctx.rotate(Math.PI/2);
      ctx.moveTo(0,0);
    }
    if (gridColor){
      ctx.strokeStyle = gridColor;
    }

  //create 10px of padding
    if (rotate){
      ctx.translate(radius, radius);
    } else {
      ctx.translate(radius/2, radius/2);
    }
    ctx.moveTo(0,0);

    var hexes = []; //future location for array of Hex objects
    var lineX = 0;
    var lineY = hexHeight / 2;
    var xStepCounter;
    var rotate60 = 60 * Math.PI / 180;
    var rotate60Counter = -1 * rotate60;

    ctx.translate(lineX, lineY);
    ctx.moveTo(0, 0);

    for (var i = 0; i < yAxis+1; i++){

      var noSecondPass = false;
      var translateDistance = 0;
      var j = 0;
      xStepCounter = 1;
      if (i === yAxis){
        ctx.rotate(rotate60Counter);
        ctx.moveTo(radius, 0);
        ctx.translate(radius, 0);
        xStepCounter++;
        noSecondPass = true;
      }

    //first pass for this row
      while (j < xAxis){
        switch(xStepCounter){
          case 1:
            ctx.rotate(rotate60Counter);
            translateDistance += radius / 2;
            break;
          case 2:
            ctx.rotate(rotate60);
            translateDistance += radius;
            break;
          case 3:
            ctx.rotate(rotate60);
            translateDistance += radius / 2;
            j++;
            break;
          case 4:
            ctx.rotate(rotate60Counter);
            translateDistance += radius;
            j++
            break;
        }

      //ensure that no hanging lines are created when x axis has odd number of hex spaces
        if (xAxis % 2 !== 1 || !noSecondPass){
          ctx.lineTo(radius, 0);
          ctx.translate(radius, 0);
        }
        if (xStepCounter < 4){
          xStepCounter++;
        } else {
          xStepCounter = 1;
        }
      }
    //need to reset canvas rotation
      if (xAxis % 2 === 0 && i !== 0){
      //first, stroke extra line if necessary
        ctx.rotate(rotate60Counter);
        ctx.lineTo(radius, 0);
        ctx.rotate(rotate60);
      } else if (xAxis % 2 === 1) {
        ctx.rotate(rotate60Counter);
      }
    //second pass for this row
      if (noSecondPass && xAxis % 2 === 0){
        ctx.rotate(rotate60Counter);
        ctx.lineTo(radius, 0);
      } else if (!noSecondPass){
      //regroup
        ctx.translate(-1* translateDistance, 0);
        ctx.moveTo(0, 0);

        j = 0;
        translateDistance = 0;
        xStepCounter = 1;
        while (j < xAxis) {
          switch(xStepCounter){
            case 1:
              ctx.rotate(rotate60);
              translateDistance += radius / 2;
              break;
            case 2:
              ctx.rotate(rotate60Counter);
              translateDistance += radius;
              break;
            case 3:
              ctx.rotate(rotate60Counter);
              translateDistance += radius / 2;
              j++;
              break;
            case 4:
              ctx.rotate(rotate60);
              translateDistance += radius;
              j++
              break;
          }
          ctx.lineTo(radius, 0);
          ctx.translate(radius, 0);
          if (xStepCounter < 4){
            xStepCounter++;
          } else {
            xStepCounter = 1;
          }
        }
        if (xAxis % 2 === 0 && i !== yAxis){
          ctx.rotate(rotate60);
          ctx.lineTo(radius, 0);
          ctx.rotate(rotate60Counter);
        } else if (xAxis % 2 === 1){
          ctx.rotate(rotate60);
        }

        ctx.translate(-1 * translateDistance, 0);
      }

      //lineY += hexHeight;
      ctx.translate(0, hexHeight);
      ctx.moveTo(0, 0);
    }

    ctx.stroke();

    return {canvas: canvas};
  }

  /**
  * HexGrid class
  * @extends PIXI.Container
  */

  PIXI.HexGrid = function(hexX, hexY, radius, gridColor, rotate) {
    if (hexX < 1 || hexY < 1 || radius <= 0){
      throw new Error ("Dimensions or radius for hex grid not valid");
    }

    //First, create the PIXI renderer by either using the provided dimensions or calculating based on Hexes and radius

    var gridInfo = drawHexGrid(hexX, hexY, radius, gridColor, rotate);

  //Create sprite which we'll add to our stage
    var gridTexture = PIXI.Texture.fromCanvas(gridInfo.canvas);
    var sprite = new PIXI.Sprite(gridTexture);
    sprite.x = 0;
    sprite.y = 0;

    var stage = new PIXI.Container();
    stage.addChild(sprite);
    stage.gridSprite = sprite;

    return stage;
  }

})()

