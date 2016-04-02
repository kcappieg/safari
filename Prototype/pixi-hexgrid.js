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
    var hexCoords = [];
    var hexGridX = 0;
    var hexGridY = 0;
    var canvasX = 0;
    var canvasY = 0;

  //initialize array
    for (var i = 0; i < hexX; i++){
      hexCoords[i] = [];
    }

    if (rotate){
      xAxis = hexY;
      yAxis = hexX;
      hexGridX = hexX - 1;
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
      canvasX += cWidth;
      ctx.rotate(Math.PI/2);
      ctx.moveTo(0,0);
    }
    ctx.strokeStyle = gridColor;

  //create 10px of padding
    if (rotate){
      ctx.translate(radius, radius);
      canvasX+=radius;
      canvasY+=radius;
    } else {
      ctx.translate(radius/2, radius/2);
      canvasX+=radius/2;
      canvasY+=radius/2;
    }
    ctx.moveTo(0,0);

    var hexes = []; //future location for array of Hex objects
    var xStepCounter;
    var rotate60 = 60 * Math.PI / 180;
    var rotate60Counter = -1 * rotate60;

    ctx.translate(0, hexHeight/2);
    if (rotate){
      canvasX += hexHeight/2;
    } else {
      canvasY += hexHeight/2;
    }
    ctx.moveTo(0, 0);

    for (var i = 0; i < yAxis+1; i++){

      var lastRow = false;
      var translateDistance = 0;
      var j = 0;
      xStepCounter = 1;
      if (i === yAxis){
        ctx.rotate(rotate60Counter);
        ctx.moveTo(radius, 0);
        ctx.translate(radius, 0);
        xStepCounter++;
        lastRow = true; //no second pass
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
            if (!lastRow){
              if (rotate){
                hexCoords[i][j] = {x: canvasX, y: canvasY+translateDistance - radius};
              } else {
                hexCoords[j][i] = {x: canvasX+translateDistance - radius, y: canvasY};
              }
            }
            j++;
            break;
          case 4:
            ctx.rotate(rotate60Counter);
            translateDistance += radius;
            if (!lastRow){
              if (rotate){
                hexCoords[i][j] = {x: canvasX - hexHeight /2, y: canvasY+translateDistance - radius/2};
              } else {
                hexCoords[j][i] = {x: canvasX+translateDistance - radius/2, y: canvasY + hexHeight /2};
              }
            }
            j++
            break;
        }

      //ensure that no hanging lines are created when x axis has odd number of hex spaces
        if (xAxis % 2 !== 1 || !lastRow){
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
      if (lastRow && xAxis % 2 === 0){
        ctx.rotate(rotate60Counter);
        ctx.lineTo(radius, 0);
      } else if (!lastRow){
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

      ctx.translate(0, hexHeight);
      if (rotate){
        canvasX -= hexHeight;
      } else {
        canvasY += hexHeight;
      }
      ctx.moveTo(0, 0);
    }

    ctx.stroke();

    return {
      canvas: canvas,
      gridCoordinates: hexCoords
    };
  }

  /**
  * HexGrid class
  * @extends PIXI.Container
  */

  PIXI.HexGrid = function(hexX, hexY, radius, gridColor, rotate) {
    if (hexX < 1 || hexY < 1 || radius <= 0){
      throw new Error ("Dimensions or radius for hex grid not valid");
    }

    var penColor = typeof gridColor === "string" ? gridColor : "#000000";
    var isRotated = false;
    if (typeof gridColor === "boolean"){
      isRotated = gridColor;
    } else if (typeof rotate === "boolean"){
      isRotated = rotate;
    }

    var gridInfo = drawHexGrid(hexX, hexY, radius, penColor, isRotated);

  //Create sprite which we'll add to our stage
    var gridTexture = PIXI.Texture.fromCanvas(gridInfo.canvas);
    var sprite = new PIXI.Sprite(gridTexture);
    sprite.x = 0;
    sprite.y = 0;

    var stage = new PIXI.Container();
    stage.addChild(sprite);
    
    Object.defineProperty(stage, "gridSprite", {
      value: sprite,
      configurable: false,
      writable: false
    });

    Object.defineProperty(stage, "hexRadius", {
      value: radius,
      configurable: false,
      writable: false
    });

    var dim = {};
    Object.defineProperty(dim, "x", {
      value: hexX,
      configurable: false,
      writable: false
    });
    Object.defineProperty(dim, "y", {
      value: hexY,
      configurable: false,
      writable: false
    });

    Object.defineProperty(stage, "dimensions", {
      value: dim,
      configurable: false,
      writable: false
    });

    stage.moveChildTo = function(child, x, y, time){
      if (x < 0 || x >= gridInfo.gridCoordinates.length || y < 0 || y >= gridInfo.gridCoordinates[0].length){
        throw new Error ("Grid index out of bounds");
      }
      if (child.parent !== stage){
        throw new Error ("Sprite not child of Stage");
      }

      if (time && time > 0){
        var destX = gridInfo.gridCoordinates[x][y].x;
        var destY = gridInfo.gridCoordinates[x][y].y;
        var distanceX = destX - child.x;
        var distanceY = destY - child.y;

      //initialize PIXI's Ticker class which allows you to perform updates on every animation frame
        var ticker = new PIXI.ticker.Ticker();
        ticker.add(function(){
          var timeRatio = Math.abs(this.elapsedMS) / time;
          var moveX = distanceX * timeRatio;
          var moveY = distanceY * timeRatio;
          if ((child.x + moveX > destX && moveX > 0) || (child.x + moveX < destX && moveX < 0)) {
            child.x = destX;
          } else {
            child.x += moveX;
          }
          if ((child.y + moveY > destY && moveY > 0) || (child.y + moveY < destY && moveY < 0)) {
            child.y = destY;
          } else {
            child.y += moveY;
          }

          if (child.x === destX && child.y === destY){
            this.stop();
          }
        }, ticker);

        ticker.start();

      } else {
        child.x = gridInfo.gridCoordinates[x][y].x;
        child.y = gridInfo.gridCoordinates[x][y].y;
      }

      return this;
    }

    stage.coordinatesAt = function(x, y){
      return {
        x: gridInfo.gridCoordinates[x][y].x,
        y: gridInfo.gridCoordinates[x][y].y
      };
    }

    stage.distanceBetween = function(hex1, hex2){
      var xDist = Math.abs(hex1.x - hex2.x);
      var yDist = Math.abs(hex1.y - hex2.y);
      var totalDistance;

      if (isRotated) {
        totalDistance = yDist + Math.max(0, xDist - 1);
      } else {
        totalDistance = xDist + Math.max(0, yDist - 1);
      }
      return totalDistance;
    }

    return stage;
  }

})()

