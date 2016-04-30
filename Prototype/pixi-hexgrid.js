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

    this.getAt = function(x, y){
      if (x >= this.columns || y >= this.rows || x < 0 || y < 0){
        throw new Error ("Index out of bounds");
      }
      var index = x*this.rows + y;
      return flatArray[index];
    }
  }

  //implementation of the K-d data structure for 2 dimension
  function KdTree (array){
    function Node (o){
      this.item = o;
      this.less = null;
      this.more = null;
    };
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

    this.nearestNeighbor = function(x, y){
      var dist = KdTree.squaredDistanceBetween(x, y, rootNode.item.x, rootNode.item.y);
      var nearestNode = kdSearch(rootNode, x, y, true, rootNode, dist);
      return nearestNode.item;
    };
  }
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
  KdTree.squaredDistanceBetween = function (x1, y1, x2, y2){
    return Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2);
  }
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

  dev.KdTree = KdTree;

  function drawHexGrid(hexX, hexY, radius, gridColor, rotate, HexSpaceClass){
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
                hexSpaces[i][j] = new HexSpaceClass(/*x param*/canvasX, /*y param*/canvasY+translateDistance - radius, /*gridX*/i, /*gridY*/j);
              } else {
                hexSpaces[j][i] = new HexSpaceClass(/*x param*/canvasX+translateDistance - radius, /*y param*/canvasY, /*gridX*/j, /*gridY*/i);
              }
            }
            j++;
            break;
          case 4:
            ctx.rotate(rotate60Counter);
            translateDistance += radius;
            if (!lastRow){
              if (rotate){
                hexSpaces[i][j] = new HexSpaceClass(/*x param*/canvasX - hexHeight /2, /*y param*/canvasY+translateDistance - radius/2, /*gridX*/i, /*gridY*/j);
              } else {
                hexSpaces[j][i] = new HexSpaceClass(/*x param*/canvasX+translateDistance - radius/2, /*y param*/canvasY + hexHeight /2, /*gridX*/j, /*gridY*/i);
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

//CONSTRUCTORS

/**
 * Below is an unfinished first pass. Many unresolved needs. Doesn't account for GameCharacter interface.
 */
  function HexSpace(x, y, gridX, gridY){
    
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

    var maxOccupancy = 2;
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
        newOccupant.sprite.x = this.x;
        newOccupant.sprite.y = this.y;
        return true;
      }
    };
  }

  function Citizen(sprite, name, gridParent){
    //instance variables
    var currentHex;
    var parent = gridParent;
    var moving = false;

    Object.defineProperty(this, "moving", {
      configurable: false,
      get: function(){return moving;}
    });

  //final variables
    Object.defineProperty(this, "sprite", {
      value: sprite,
      writable: false,
      configurable: false
    });
    Object.defineProperty(this, "name", {
      value: name,
      writable: false,
      configurable: false
    });

    this.moveToSpace = function(hexSpace, time, animation, endAnimation){
      if (hexSpace.constructor !== parent.hexSpaceClass){
        throw new Error("Illegal arguments. HexSpace is not valid");
      }
      var that = this;

      if (time && time > 0){
        var destX = hexSpace.x;
        var destY = hexSpace.y;
        var distanceX = destX - that.sprite.x;
        var distanceY = destY - that.sprite.y;
        moving = true;

      //initialize PIXI's Ticker class which allows you to perform updates on every animation frame
        var ticker = new PIXI.ticker.Ticker();

        ticker.add(function(){
          var timeRatio = Math.abs(this.elapsedMS) / time;
          var moveX = distanceX * timeRatio;
          var moveY = distanceY * timeRatio;
          if ((that.sprite.x + moveX > destX && moveX > 0) || (that.sprite.x + moveX < destX && moveX < 0)) {
            that.sprite.x = destX;
          } else {
            that.sprite.x += moveX;
          }
          if ((that.sprite.y + moveY > destY && moveY > 0) || (that.sprite.y + moveY < destY && moveY < 0)) {
            that.sprite.y = destY;
          } else {
            that.sprite.y += moveY;
          }

          if (that.sprite.x === destX && that.sprite.y === destY){
            moving = false;
            hexSpace.occupy(that);
            
            if (typeof endAnimation === "function"){
              this.remove();
              this.addOnce(function(){
                endAnimation({deltaTime: this.deltaTime, elapsedMS: this.elapsedMS}, that.sprite);
                this.stop();
              }, ticker);
            } else{
              this.remove();
            }

          }
        }, ticker);

        if (typeof animation === "function"){
          var registerAnimation = function(){
            animation({deltaTime: ticker.deltaTime, elapsedMS: ticker.elapsedMS}, that.sprite, deregisterAnimation);
          };
          var deregisterAnimation = function(){
            ticker.remove(registerAnimation);
          };
          ticker.add(registerAnimation);
        }

        ticker.start();
        return function(){
          if (typeof endAnimation === "function"){
            ticker.remove();
            ticker.addOnce(function(){
              endAnimation({deltaTime: ticker.deltaTime, elapsedMS: ticker.elapsedMS}, that.sprite);
              ticker.stop();
            });
          } else {
            ticker.stop();
          }
        };

      } else {
        return hexSpace.occupy(that);
      }
    }
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
    var hexArray, sprite;

    var penColor = typeof gridColor === "string" ? gridColor : "#000000";
    var isRotated = false;
    if (typeof gridColor === "boolean"){
      isRotated = gridColor;
    } else if (typeof rotate === "boolean"){
      isRotated = rotate;
    }

    var gridInfo = drawHexGrid(hexX, hexY, radius, penColor, isRotated, hexSpaceClass);
    hexArray = new Flat2dGrid(gridInfo.hexSpaces);

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

    Object.defineProperty(stage, "hexSpaceClass", {
      value: hexSpaceClass,
      configurable: false,
      writable: false
    });

    var kdTree = new KdTree(hexArray.flattenedArray);
    dev.kd = kdTree;

  //Methods
    stage.moveChildTo = function(child, x, y, time){
      if (x < 0 || x >= hexArray.columns || y < 0 || y >= hexArray.rows){
        throw new Error ("Grid index out of bounds");
      }
      if (child.parent !== stage){
        throw new Error ("Sprite not child of Stage");
      }
      
      var destinationHex = hexArray.getAt(x,y);

      if (time && time > 0){
        var destX = destinationHex.x;
        var destY = destinationHex.y;
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
        child.x = destinationHex.x;
        child.y = destinationHex.y;
      }

      return this;
    };

    stage.hexAt = function(x, y){
      return hexArray.getAt(x,y);
    }

    stage.distanceBetween = function(x1, y1, x2, y2){
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

    stage.hexesBetween = function(x1, y1, x2, y2){
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
          intersectingHexes.push(currentHex);
          lastHex = currentHex;
        }

        currentX += pollIncrement.x;
        currentY += pollIncrement.y;
        currentDistance += pollingDistance;
      }

      return intersectingHexes;
    }

    stage.addCitizen = function(sprite, name, x, y){
      if (sprite.constructor !== PIXI.Sprite){
        throw new Error ("New citizen must be of the class PIXI.Sprite");
      }
      var x1, y1;
      if (!x || !y){
        x1 = 0;
        y1 = 0;
      }

      var newCitizen = new Citizen(sprite, name, this);
      var initialHex = hexArray.getAt(x1,y1);

      while(!newCitizen.moveToSpace(initialHex)){
        if (++x1 < this.dimensions.x){
          initialHex = hexArray.getAt(x1,y1);
        } else if (++y1 < this.dimensions.y){
          x1 = 0;
          initialHex = hexArray.getAt(x1,y1);
        } else {
          throw new Error ("Full grid is occupied. Can't add child");
        }
      }
      population[name] = newCitizen;
      this.addChild(newCitizen.sprite);

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

    stage.moveCitizenTo = function(citizen, x, y, time, animation, endAnimation){
      if (x < 0 || x >= hexArray.columns || y < 0 || y >= hexArray.rows){
        throw new Error ("Grid index out of bounds");
      }
      if (!population[citizen]){
        throw new Error("Citizen not a member of this grid");
      }
      if (typeof time !== "number"){
        throw new Error("Not a valid time");
      }
      var c = population[citizen];

      return c.moveToSpace(hexArray.getAt(x,y), time, animation, endAnimation);
    };

    stage.getCitizenSprite = function(name){
      return population[name].sprite;
    }

    return stage;
  }

  var hexSpaceClass = HexSpace;
  PIXI.HexGrid.setHexSpaceClass = function(newClass){
    hexSpaceClass = newClass;
  };
  PIXI.HexGrid.resetHexSpaceClass = function(){
    hexSpaceClass = HexSpace;
  };

  PIXI.HexGrid.Terrain = function(name){
    if (!terrainRegister[name]){
      throw new Error("This terrain type has not been registered");
    }

    this.sprite = PIXI.Sprite(terrainRegister[name].texture);
    var attributes = {};
    for (var attr in terrainRegister[name].attributes){
      attributes[attr] = terrainRegister[name].attributes[attr];
    }
    this.attributes = attributes;
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