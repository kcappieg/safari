/******************************
Extension for PIXI.js
HexGrid

author Kevin C. Gall
******************************/
if (typeof PIXI !== "object"){
  throw new Error ("Failed to find PIXI object. Be sure PIXI.js is loaded before this extension");
}
var dev = {};

(function(){
"use strict";

//UTILITIES
  //below Class is meant to flatten a regular rectangular 2-d grid (where the length of every array is uniform)
  function Flat2dGrid(array){
    var flatArray = [];
    Object.defineProperty(this, "columns", {
      writable: false,
      configurable: false,
      value: array.length,
      enumerable: true
    });
    Object.defineProperty(this, "rows", {
      writable: false,
      configurable: false,
      value: array[0].length,
      enumerable: true
    });
  //Getter - retrieves a copied array (not the flat array created by the constructor)
    Object.defineProperty(this, "flattenedArray", {
      configurable: false,
      get: function(){
        var newArray = [];
        for (var i=0; i<flatArray.length; i++){
          newArray[i] = flatArray[i];
        }
        return newArray;
      },
      enumerable: true
    });

    for (var i=0; i<array.length; i++){
      for (var j=0; j<array[i].length; j++){
        var index = i * array[i].length + j;
        flatArray[index] = array[i][j];
      }
    }

  //Get the item at the position as if the two-dimensional array[x][y]
    this.getAt = function(x, y){
      if (x >= this.columns || y >= this.rows || x < 0 || y < 0){
        throw new Error ("Index out of bounds");
      }
      var index = x*this.rows + y;
      return flatArray[index];
    }
  }

//implementation of the K-d data structure for 2 dimensions
  //Utility class for the KdTree class
  function Node (o){
    this.item = o;
    this.less = null;
    this.more = null;
  };
  function KdTree (array){
    shuffle(array);
    var rootNode = new Node(array[0]);
    for (var i=1; i<array.length; i++){
      var newNode = new Node(array[i]);
      var xAxis = true;
      var currentNode = rootNode;
      while (currentNode !== null){
        var gte;
        var nextNode;
        if (xAxis){
          gte = newNode.item.x >= currentNode.item.x;
        } else {
          gte = newNode.item.y >= currentNode.item.y;
        }
        if (gte){
          if (currentNode.more === null){
            currentNode.more = newNode;
            currentNode = null;
          } else {
            currentNode = currentNode.more;
          }
        } else {
          if (currentNode.less === null){
            currentNode.less = newNode;
            currentNode = null;
          } else {
            currentNode = currentNode.less;
          }
        }
        xAxis = !xAxis;
      }
    }

  //get hex grid space whose center is closest to the point (x, y)
    this.nearestNeighbor = function(x, y){
      var dist = KdTree.squaredDistanceBetween(x, y, rootNode.item.x, rootNode.item.y);
      var nearestNode = kdSearch(rootNode, x, y, true, rootNode, dist);
      return nearestNode.item;
    };
  }
  //kd search algorithm
  function kdSearch (node, x, y, vertical, currentBest, bestDist){
    var bestShot, alternate;
    var nDist = KdTree.squaredDistanceBetween(x, y, node.item.x, node.item.y);
    if (nDist < bestDist){
      currentBest = node;
      bestDist = nDist;
    }
    if (node.less === null && node.more === null){
      return currentBest;
    }
    if (vertical){
      if (x < node.item.x){
        bestShot = node.less;
        alternate = node.more;
      } else {
        bestShot = node.more;
        alternate = node.less;
      }
    } else {
      if (y < node.item.y){
        bestShot = node.less;
        alternate = node.more;
      } else {
        bestShot = node.more;
        alternate = node.less;
      }
    }
    if (bestShot !== null){
      currentBest = kdSearch(bestShot, x, y, !vertical, currentBest, bestDist);
    }
    bestDist = KdTree.squaredDistanceBetween(x, y, currentBest.item.x, currentBest.item.y);

    if (alternate !== null){
      var shouldContinue = vertical ? bestDist > Math.pow(x - node.item.x, 2) : bestDist > Math.pow(y - node.item.y, 2);
      if (shouldContinue){
        currentBest = kdSearch(alternate, x, y, !vertical, currentBest, bestDist);
      }
    }
    return currentBest;
  }
  //static utility: calculates the squared distance between (x1, y1) and (x2, y2)
  KdTree.squaredDistanceBetween = function (x1, y1, x2, y2){
    return Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2);
  }
  //Calculate the x and y increments based on a known polling distance and using the origin and destination points (ox, oy) and (dx, dy) respectively
  KdTree.pollingDistance = function (ox, oy, dx, dy, pollD){
    var increments = {};
    var backX = false, backY = false;
    var x = dx - ox;
    var y = dy - oy;
    if (x < 0) {backX = true;}
    if (y < 0) {backY = true;}
    var angle = Math.atan(Math.abs(y/x));
    increments.x = pollD * Math.cos(angle);
    increments.y = pollD * Math.sin(angle);
    increments.x *= backX ? -1 : 1;
    increments.y *= backY ? -1 : 1;

    return increments;
  };

  //Simple shuffling algorithm to randomize an array
  function shuffle(array){
    if (!Array.isArray(array)){
      throw new Error("Can't shuffle an object that is not an array");
    }
    for (var i=0, random, temp; i < array.length-1; i++){
      random = Math.floor(Math.random() * (array.length - i)) + i;
      temp = array[i];
      array[i] = array[random];
      array[random] = temp;
    }
    return array;
  }

  //Draw the hex grid into a canvas 2d context and instantiate the HexSpace objects for the class
  function drawHexGrid(hexX, hexY, radius, gridColor, rotate){
    var hexHeight = 2 * Math.cos(30 * (Math.PI / 180)) * radius;
    var xAxis = hexX;
    var yAxis = hexY;
    var hexSpaces = [];
    var hexGridX = 0;
    var hexGridY = 0;
    var canvasX = 0;
    var canvasY = 0;

  //initialize array
    for (var i = 0; i < hexX; i++){
      hexSpaces[i] = [];
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
                hexSpaces[i][j] = new HexSpace(/*x param*/canvasX, /*y param*/canvasY+translateDistance - radius, /*gridX*/i, /*gridY*/j, /*radius*/ radius);
              } else {
                hexSpaces[j][i] = new HexSpace(/*x param*/canvasX+translateDistance - radius, /*y param*/canvasY, /*gridX*/j, /*gridY*/i, /*radius*/ radius);
              }
            }
            j++;
            break;
          case 4:
            ctx.rotate(rotate60Counter);
            translateDistance += radius;
            if (!lastRow){
              if (rotate){
                hexSpaces[i][j] = new HexSpace(/*x param*/canvasX - hexHeight /2, /*y param*/canvasY+translateDistance - radius/2, /*gridX*/i, /*gridY*/j, /*radius*/ radius);
              } else {
                hexSpaces[j][i] = new HexSpace(/*x param*/canvasX+translateDistance - radius/2, /*y param*/canvasY + hexHeight /2, /*gridX*/j, /*gridY*/i, /*radius*/ radius);
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
      hexSpaces: hexSpaces
    };
  }

  //calculates the angle that describes the direction indicated by a vector described by distanceX and distanceY
  //returns the angle in radians of the direction: Left: 0, down: Math.PI/2, right: Math.PI, up: Math.PI * (3/2)
  function calculateDirectionAngle(distanceX, distanceY){
  //Absolute value of the base angle so that we can use a full 2*pi radian circle
    var angle = Math.abs(Math.atan(distanceY / distanceX));
  //several cases don't need to be coded at the beginning as the default cases
    if (distanceX > 0 && distanceY < 0){
      angle = Math.PI - angle;
    } else if (distanceX > 0 && distanceY === 0) {
      angle = Math.PI;
    } else if (distanceX > 0 && distanceY > 0){
      angle = Math.PI + angle;
    } else if (distanceX === 0 && distanceY > 0){
      angle = Math.PI * (3/2);
    } else if (distanceX < 0 && distanceY > 0){
      angle = 2*Math.PI - angle;
    }

    return angle;
  }

  //function for moving a sprite using a ticker object
  //endAnimation will be called when the movement is completed, and so can include other wrap-up functionality
  //returns object with 2 properties:
  //  interrupt: a function which will interrupt the movement and call the endAnimation function
  //  facing: angle (in radians) of the direction the sprite is moving - Left: 0, down: Math.PI/2, right: Math.PI, up: Math.PI * (3/2)
  function moveSprite(sprite, destX, destY, time, movingAnimation, endAnimation){
  //check for invalid parameters
    if (sprite.constructor !== PIXI.Sprite){
      throw new Error ("Not a valid sprite object");
    }
    destX = parseInt (destX);
    destY = parseInt (destY);
    if (destX !== destX || destY !== destY){
      throw new Error ("Not a valid destination");
    }
    if (typeof time !== "number" || time < 0){
      throw new Error("Not a valid time");
    }
    var distanceX = destX - sprite.x;
    var distanceY = destY - sprite.y;
  //calculate the direction the sprite should be facing
    var angle = calculateDirectionAngle(distanceX, distanceY);

  //initialize PIXI's Ticker class which allows you to perform updates on every animation frame
    var ticker = new PIXI.ticker.Ticker();

    ticker.add(function(){
      var timeRatio = Math.abs(this.elapsedMS) / time;
      var moveX = distanceX * timeRatio;
      var moveY = distanceY * timeRatio;
      if ((sprite.x + moveX > destX && moveX > 0) || (sprite.x + moveX < destX && moveX < 0)) {
        sprite.x = destX;
      } else {
        sprite.x += moveX;
      }
      if ((sprite.y + moveY > destY && moveY > 0) || (sprite.y + moveY < destY && moveY < 0)) {
        sprite.y = destY;
      } else {
        sprite.y += moveY;
      }

      if (sprite.x === destX && sprite.y === destY){
        if (typeof endAnimation === "function"){
          this.remove();
          this.addOnce(function(){
            endAnimation({deltaTime: this.deltaTime, elapsedMS: this.elapsedMS}, sprite);
            this.stop();
          }, ticker);
        } else{
          this.remove();
        }

      }
    }, ticker);

    if (typeof movingAnimation === "function"){
      var registerAnimation = function(){
        movingAnimation({deltaTime: ticker.deltaTime, elapsedMS: ticker.elapsedMS}, sprite, deregisterAnimation);
      };
      var deregisterAnimation = function(){
        ticker.remove(registerAnimation);
      };
      ticker.add(registerAnimation);
    }

    ticker.start();
    return {
      interrupt: function(){
        if (typeof endAnimation === "function"){
          ticker.remove();
          ticker.addOnce(function(){
            endAnimation({deltaTime: ticker.deltaTime, elapsedMS: ticker.elapsedMS}, sprite);
            ticker.stop();
          });
        } else {
          ticker.stop();
        }
      },
      facing: angle
    };
  }

//CLASSES

/**
 * Below is an unfinished first pass. Many unresolved needs. Doesn't account for GameCharacter interface.
 */
  function HexSpace(x, y, gridX, gridY, radius){
    
    Object.defineProperty(this, "x", {
      value: x,
      writable: false,
      configurable: false,
      enumerable: true,
    });
    Object.defineProperty(this, "y", {
      value: y,
      writable: false,
      configurable: false,
      enumerable: true,
    });
    
    Object.defineProperty(this, "gridX", {
      value: gridX,
      writable: false,
      configurable: false,
      enumerable: true,
    });
    Object.defineProperty(this, "gridY", {
      value: gridY,
      writable: false,
      configurable: false,
      enumerable: true,
    });
    Object.defineProperty(this, "radius", {
      value: radius,
      writable: false,
      configurable: false,
      enumerable: true,
    });

    var maxOccupancy = globalMaxOcc; //See the PIXI.HexGrid class for this variable initialization and setting
    Object.defineProperty(this, "maxOccupancy", {
      configurable: false,
      enumerable: true,
      get: function(){return maxOccupancy;},
      set: function(){throw new Error("Cannot set maxOccupancy property");}
    });

    var occupants = [];
    this.getOccupants = function(){
      var o = [];
      for (var i=0; i<occupants.length; i++){
        o[i] = occupants[i];
      }
      return o;
    };

    this.occupy = function(newOccupant){
      if (newOccupant.constructor !== Citizen){
        throw new Error("Illegal occupant: must be citizen of the grid");
      }
      if (occupants.length >= maxOccupancy){
        return false;
      } else {
        occupants.push(newOccupant);
        newOccupant.moving = false;
        newOccupant.currentHex = this;

        this.reorient();

        return true;
      }
    };

    this.vacate = function(formerOccupant){
      for (var i=0; i<occupants.length; i++){
        if (occupants[i] === formerOccupant){
          occupants.splice(i, 1);
        }
        break;
      }

      this.reorient();
    };

    this.reorient = function(){
      if (occupants.length < 1){
        return;
      }
      var newOccupant = occupants[occupants.length - 1];
      var f = newOccupant.facing;
      switch (occupants.length){
        case 1:
          moveSprite(newOccupant.sprite, this.x, this.y, 500);
          break;
        case 2:
          var left, right;
          if (f > Math.PI/2 && f <=Math.PI * 3/2) {
            left = newOccupant;
            right = occupants[0];
          } else {
            left = occupants[0];
            right = newOccupant;
          }

          moveSprite(left.sprite, this.x - this.radius/2, this.y, 500);
          moveSprite(right.sprite, this.x + this.radius/2, this.y, 500);
          break;
        default: //this is here as the default for now, but this section should be built out to cover any number of occupants
          moveSprite(newOccupant.sprite, this.x, this.y, 500);
          break;
      }
    };

    var terrainFeatures = {};
    this.addTerrain = function(name){
      var terrainObject;
      if (typeof name === "string"){
        if(!terrainRegister[name]){
          throw new Error ("Terrain not registered! Can't be added to Hex Space");
        }
        terrainObject = new PIXI.HexGrid.Terrain(name);
      } else if (typeof name === "object" && name.constructor === PIXI.HexGrid.Terrain){
        terrainObject = name;
      } else {
        throw new Error ("Invalid argument passed")
      }

      if (terrainFeatures[terrainObject.name]){
        return;
      }
      if (terrainObject.attributes.maxOccupancy){
        maxOccupancy = Math.max(0, maxOccupancy + terrainObject.attributes.maxOccupancy);
      }

      terrainFeatures[terrainObject.name] = terrainObject;
      return terrainObject;
    };

    this.removeTerrain = function(name){
      if (typeof name !== "string"){throw new Error ("Invalid argument");}
      var retObject = terrainFeatures[name];

      if (retObject.maxOccupancy){
        maxOccupancy = Math.max(0, maxOccupancy - retObject.maxOccupancy);
      }

      delete terrainFeatures[name];
      return retObject;
    };

    this.getTerrainAttributes = function(){
      var attr = {};
      for (var name in terrainFeatures){
        attr[name] = terrainFeatures[name];
      }

      return attr;
    };
  }

  function Citizen(sprite, name, gridParent){
    //instance variables
    var currentHex;
    var parent = gridParent;
    var moving = false;
    var facing = Math.PI;

  //the direction the citizen is facing, usually based on its last movement direction. Left: 0, down: Math.PI/2, right: Math.PI, up: Math.PI * (3/2)
    Object.defineProperty(this, "facing", {
      configurable: false,
      enumerable: true,
      get: function(){return facing;},
      set: function(newVal){
        var n = parseFloat(newVal);
        if (n === n && n >= 0 && n <= (2*Math.PI)){
          facing = n;
        }
      }
    });

    Object.defineProperty(this, "moving", {
      configurable: false,
      enumerable: true,
      get: function(){return moving;},
      set: function(boo) {
        if (typeof boo === "boolean"){
          moving = boo;
        }
      }
    });

    Object.defineProperty(this, "currentHex", {
      configurable: false,
      enumerable: true,
      get: function(){return currentHex;},
      set: function(hex){
        if (hex.constructor === HexSpace){
          currentHex = hex;
        }
      }
    });

  //final variables
    Object.defineProperty(this, "sprite", {
      value: sprite,
      writable: false,
      configurable: false,
      enumerable: true
    });
    Object.defineProperty(this, "name", {
      value: name,
      writable: false,
      configurable: false,
      enumerable: true
    });
  }

  /**
  * HexGrid class
  * @extends PIXI.Container
  */

  PIXI.HexGrid = function(hexX, hexY, radius, gridColor, rotate) {
    if (hexX < 1 || hexY < 1 || radius <= 0){
      throw new Error ("Dimensions or radius for hex grid not valid");
    }

  //instance variables
    var population = {};
    var stage = new PIXI.Container();
    var hexArray, sprite, kdTree, gridInfo;

    var penColor = typeof gridColor === "string" ? gridColor : "#000000";
    var isRotated = false;
    if (typeof gridColor === "boolean"){
      isRotated = gridColor;
    } else if (typeof rotate === "boolean"){
      isRotated = rotate;
    }

    gridInfo = drawHexGrid(hexX, hexY, radius, penColor, isRotated);
    hexArray = new Flat2dGrid(gridInfo.hexSpaces);
    kdTree = new KdTree(hexArray.flattenedArray);

  //Create sprite which we'll add to our stage
    var gridTexture = PIXI.Texture.fromCanvas(gridInfo.canvas);
    sprite = new PIXI.Sprite(gridTexture);
    sprite.x = 0;
    sprite.y = 0;

    stage.addChild(sprite);
    
  //Final variables
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

  //Methods
    stage.pointAt = function(x, y){
      var hex = hexArray.getAt(x,y);
      return new PIXI.Point(hex.x, hex.y);
    }

    stage.distanceBetween = function(x1, y1, x2, y2){
      if (x1 < 0 || y1 < 0 || x2 < 0 || y2 < 0 || x1 > this.dimensions.x || y1 > this.dimensions.y || x2 > this.dimensions.x || y2 > this.dimensions.y){
        throw new Error ("Out of bounds of grid");
      }

      var xDist = Math.abs(x1 - x2);
      var yDist = Math.abs(y1 - y2);
      var totalDistance;

      if (isRotated) {
        totalDistance = yDist + Math.max(0, xDist - 1);
      } else {
        totalDistance = xDist + Math.max(0, yDist - 1);
      }
      return totalDistance;
    };

    stage.adjacentHexes = function(x, y){
      var adjacentHexArray = [];
      for (var i=-1; i<=1; i++){
        for (var k=-1; k<=1; k++){
          try {
            if (this.distanceBetween(x, y, x+i, y+k) === 1){
              adjacentHexArray.push(hexArray.getAt(x+i, y+k));
            }
          } catch (e){}
        }
      }
    };

  //caches the last 10 paths to save on repetitive computation
    var hexPathCache = {};
    var hexPathCacheKeys = [];
    stage.hexesBetween = function(x1, y1, x2, y2){
      //if cached, return the cached value
      var id = ""+x1+y1+x2+y2;
      if (hexPathCache[id]){
        var iH = hexPathCache[id];
        for (var i=0; i<iH.length; i++){
          iH[i].attributes = hexArray.getAt(iH[i].gridX, iH[i].gridY).getTerrainAttributes();
        }
        return iH;
      }

      var intersectingHexes = [];
      var origin = hexArray.getAt(x1, y1);
      var destination = hexArray.getAt(x2, y2);
      var lastHex = origin;
      var currentHex = null;
      var pollingDistance = radius / 5;

      var pollIncrement = KdTree.pollingDistance(origin.x, origin.y, destination.x, destination.y, pollingDistance);
      var totalDistance = Math.sqrt(KdTree.squaredDistanceBetween(origin.x, origin.y, destination.x, destination.y));
      var currentDistance = 0;
      var currentX = origin.x+pollIncrement.x;
      var currentY = origin.y+pollIncrement.y;
      while (currentDistance < totalDistance){
        currentHex = kdTree.nearestNeighbor(currentX, currentY);
        if (currentHex !== lastHex){
          intersectingHexes.push({
            gridX: currentHex.gridX,
            gridY: currentHex.gridY,
            attributes: currentHex.getTerrainAttributes()
          });
          if (currentHex === destination){
            break;
          }
          lastHex = currentHex;
        }

        currentX += pollIncrement.x;
        currentY += pollIncrement.y;
        currentDistance += pollingDistance;
      }

    //cache values for repetitive calls
      hexPathCacheKeys.push(id);
      hexPathCache[id] = intersectingHexes;
      if (hexPathCacheKeys.length > 10){
        var oldId = hexPathCacheKeys.shift();
        delete hexPathCache[oldId];
      }

      return intersectingHexes;
    }

    stage.addCitizen = function(sprite, name, x, y){
      if (sprite.constructor !== PIXI.Sprite){
        throw new Error ("New citizen must be of the class PIXI.Sprite");
      }
      var x1 = x, y1 = y;
      if (typeof x !== "number" || typeof y !== "number"){
        x1 = 0;
        y1 = 0;
      }

      var newCitizen = new Citizen(sprite, name, this);
      var initialHex = hexArray.getAt(x1,y1);

      population[name] = newCitizen;
      this.addChild(newCitizen.sprite);

      this.moveCitizenTo(name, x, y, 0);

      return this;
    };
    stage.addCitizenFromTexture = function(texture, name, x, y, height, width){
      var citizen = new PIXI.Sprite(texture);
      citizen.anchor.x = 0.5;
      citizen.anchor.y = 0.5;
      citizen.height = height || hexRadius;
      citizen.width = width || hexRadius;
      return this.addCitizen(citizen, name, x, y);      
    };

  //Breadth-first search for an unoccupied space to occupy
    function occupy(hexSpace, citizen, stage){
      var success, next, adjacent;
      var stack = [hexSpace];
      var progressTracker = [];
      progressTracker[hexSpace.gridX] = [];
      progressTracker[hexSpace.gridX][hexSpace.gridY] = true;

      while (stack.length > 0){
        next = stack.shift();
        success = next.occupy(citizen);
        if (success){
          break;
        } else {
          adjacent = stage.adjacentHexes(next);
          shuffle(adjacent);
          for (var i=0; i<adjacent.length; i++){
            var a = adjacent[i];
            progressTracker[a.gridX] = progressTracker[a.gridX] || [];
            if (!progressTracker[a.gridX][a.gridY]){
              progressTracker[a.gridX][a.gridY] = true;
              stack.push(a);
            }
          }
        }
      }
      return success;
    }

    stage.moveCitizenTo = function(citizen, x, y, time, animation, endAnimation){
      if (x < 0 || x >= hexArray.columns || y < 0 || y >= hexArray.rows){
        throw new Error ("Grid index out of bounds");
      }
      if (!population[citizen]){
        throw new Error("Citizen not a member of this grid");
      }
      if (typeof time !== "number" && time !== undefined){
        throw new Error("Not a valid time");
      }
      var that = this;
      var c = population[citizen];
      var hex = hexArray.getAt(x, y);
      var originHex = c.currentHex;
      var moveSpriteObject;

    //create wrapper function for the endAnimation argument that occupies the hex grid
      var ea2 = function(tickerLite, sprite){
        var landingHex = kdTree.nearestNeighbor(sprite.x, sprite.y);
        if (originHex){
          if (!landingHex.occupy(c)){
            var path = that.hexesBetween(originHex.gridX, originHex.gridY, hex.gridX, hex.gridY);
            var lastHexProxy = path[path.length-2];
            var lastHex = hexArray.getAt(lastHexProxy.gridX, lastHexProxy.gridY);
            occupy(lastHex, c, that);
          }
        } else {
          occupy(landingHex, c, that);
        }
        if (typeof endAnimation === "function"){
          endAnimation(tickerLite, sprite);
        }
      };

      c.moving = true;
      if (originHex){
        originHex.vacate(c);
      }
    //returns an object with: interrupt - function to stop the movement, facing: angle of the direction their facing
      moveSpriteObject = moveSprite(c.sprite, hex.x, hex.y, (time || 0), animation, ea2);
      c.facing = moveSpriteObject.facing;
      return moveSpriteObject.interrupt;
    };

  //Citizen accessor functions
    stage.getCitizenSprite = function(name){
      return population[name].sprite;
    }
    stage.getCitizenDirection = function(name){
      return population[name].facing;
    }
    stage.isCitizenMoving = function(name){
      return population[name].moving;
    }

    stage.addTerrain = function(hx, hy, name){
      var hex = hexArray.getAt(hx, hy);

      var newTerrain = null;
      try {
        newTerrain = hex.addTerrain(name);
      } catch (e){}
      if (newTerrain !== null){
        stage.addChild(newTerrain.sprite);
        newTerrain.sprite.x = hex.x;
        newTerrain.sprite.y = hex.y;
        newTerrain.sprite.alpha = 0.5;
      }
      return this;
    }

    stage.removeTerrain = function(hx, hy, name){
      var hex = hexArray.getAt(hx, hy);

      var terrain = hex.removeTerrain(name);
      this.removeChild(terrain.sprite);
      return this;
    }

    return stage;
  }

  var globalMaxOcc = 2;
  PIXI.HexGrid.setMaxOccupancy = function(newVal){
    var n = parseInt(newVal);
    if (n === n){
      globalMaxOcc = n;
    }
  };

  PIXI.HexGrid.Terrain = function(name){
    if (!terrainRegister[name]){
      throw new Error("This terrain type has not been registered");
    }

    this.sprite = new PIXI.Sprite(terrainRegister[name].texture);
    this.sprite.anchor.x = 0.5;
    this.sprite.anchor.y = 0.5;
    var attributes = {};
    for (var attr in terrainRegister[name].attributes){
      attributes[attr] = terrainRegister[name].attributes[attr];
    }
    this.attributes = attributes;
    this.name = name;
  };

  var terrainRegister = {};
  PIXI.HexGrid.Terrain.registerNewType = function(name, texture, attributes){
    terrainRegister[name] = {
      texture: texture,
      attributes: attributes
    };
    return PIXI.HexGrid.Terrain;
  };

})();