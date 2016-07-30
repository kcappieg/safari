/******************************
Extension for PIXI.js
HexGrid

author Kevin C. Gall
******************************/

define(["./node_modules/pixi.js/bin/pixi"], function(PIXI){
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
  function drawHexGrid(parentHgm, hexX, hexY, radius, gridColor, rotate){
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
      //canvasX += cWidth;
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
                hexSpaces[i][j] = new HexSpace(/*parent hexGridManager*/parentHgm,/*x param*/canvasX, /*y param*/canvasY+translateDistance - radius, /*gridX*/i, /*gridY*/j, /*radius*/ radius);
              } else {
                hexSpaces[j][i] = new HexSpace(/*parent hexGridManager*/parentHgm,/*x param*/canvasX+translateDistance - radius, /*y param*/canvasY, /*gridX*/j, /*gridY*/i, /*radius*/ radius);
              }
            }
            j++;
            break;
          case 4:
            ctx.rotate(rotate60Counter);
            translateDistance += radius;
            if (!lastRow){
              if (rotate){
                hexSpaces[i][j] = new HexSpace(/*parent hexGridManager*/parentHgm,/*x param*/canvasX + hexHeight /2, /*y param*/canvasY+translateDistance - radius/2, /*gridX*/i, /*gridY*/j, /*radius*/ radius);
              } else {
                hexSpaces[j][i] = new HexSpace(/*parent hexGridManager*/parentHgm,/*x param*/canvasX+translateDistance - radius/2, /*y param*/canvasY + hexHeight /2, /*gridX*/j, /*gridY*/i, /*radius*/ radius);
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
        canvasX += hexHeight;
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

  //function for moving a citizen's sprite using a ticker object
  //endAnimation will be called when the movement is completed, and so can include other wrap-up functionality
  //returns object with 2 properties:
  //  interrupt: a function which will interrupt the movement and call the endAnimation function
  //  facing: angle (in radians) of the direction the sprite is moving - Left: 0, down: Math.PI/2, right: Math.PI, up: Math.PI * (3/2)
  function moveCitizen(hgm, citizen, destX, destY, time, movingAnimation, endAnimation){
    if (citizen.moving){
      var oldEndAnimation = citizen.interrupt(true);
      if (typeof endAnimation !== "function"){
        endAnimation = oldEndAnimation;
      }
    }

    var ticker = hgm.ticker; //hgm has the central ticker for the whole grid
    var sprite = citizen.sprite;
    var registerAnimation = function(){}; //sets up a blank function so that it can always be added and removed from the ticker consistently
    var deregisterAnimation;
    var distanceX, distanceY, angle;

    destX = parseInt (destX);
    destY = parseInt (destY);
    if (destX !== destX || destY !== destY){
      throw new Error ("Not a valid destination");
    }
    if (typeof time !== "number" || time < 0){
      throw new Error("Not a valid time");
    }
    distanceX = destX - sprite.x;
    distanceY = destY - sprite.y;
  //calculate the direction the sprite should be facing
    angle = calculateDirectionAngle(distanceX, distanceY);

    if (typeof movingAnimation === "function"){
    //added to ticker with context of ticker, so use this for consistency
      registerAnimation = function(){
        movingAnimation({deltaTime: this.deltaTime, elapsedMS: this.elapsedMS}, citizen.getCitizenLite(), deregisterAnimation);
      };
      deregisterAnimation = function(){
        ticker.remove(registerAnimation);
      };
    }

    function movingCitizen(){
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

    //destination has been reached - clean up
      if (sprite.x === destX && sprite.y === destY){
        citizen.clearInterrupt();
        citizen.moving = false;
        this.remove(registerAnimation);
        this.remove(movingCitizen);
        if (typeof endAnimation === "function"){
          this.addOnce(function(){
            endAnimation({deltaTime: this.deltaTime, elapsedMS: this.elapsedMS}, citizen.getCitizenLite());
          }, ticker);
        }
      }
    }

    ticker.add(registerAnimation, ticker);
    ticker.add(movingCitizen, ticker);

    citizen.moving = true;
    citizen.facing = angle;

  //if still moving, doesn't call the endAnimation. Instead returns it so that it could be reused
    citizen.setInterrupt(function(stillMoving){
      ticker.remove(registerAnimation);
      ticker.remove(movingCitizen);
      if (typeof endAnimation === "function" && !stillMoving){
        ticker.addOnce(function(){
          endAnimation({deltaTime: this.deltaTime, elapsedMS: this.elapsedMS}, sprite);
        }, ticker);
      } else {
        return endAnimation;
      }
    });
  }

//takes the center point, the radius, and the offset angle (how much it is rotated) in radians and returns the radial point.
//Rotation of 0 is straight up on the y-axis and it goes clockwise
  function calculateRadialPoint (center, radius, rotation) {
    var angle, xMod, yMod, x, y;

    rotation = rotation || 0;
    if (rotation === 0) {
      return new PIXI.Point(center.x, center.y - radius);
    } else if (rotation < Math.PI/2){
      xMod = 1, yMod = -1;
      angle = Math.PI/2 - rotation;
    } else if (rotation === Math.PI/2){
      return new PIXI.Point(center.x+radius, center.y);
    } else if (rotation < Math.PI){
      xMod = 1, yMod = 1;
      angle = rotation - Math.PI/2;
    } else if (rotation === Math.PI){
      return new PIXI.Point(center.x, center.y + radius);
    } else if (rotation < Math.PI * (3/2)){
      xMod = -1, yMod = 1;
      angle = Math.PI * (3/2) - rotation;
    } else if (rotation === Math.PI * (3/2)){
      return new PIXI.Point(center.x-radius, center.y);
    } else {
      xMod = -1, yMod = -1;
      angle = rotation - Math.PI * (3/2);
    }

    x = Math.cos(angle) * radius * xMod;
    y = Math.sin(angle) * radius * yMod;

    return new PIXI.Point(center.x + x, center.y+y);
  }

//CLASSES

/**
 * Below is a first pass. Creates a proxy object for the HexSpace accessible to clients
 */
  function HexSpace(parentHgm, x, y, gridX, gridY, radius){
    var that = this;
    
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
      get: function(){return Math.max(maxOccupancy, 0);},
      set: function(){throw new Error("Cannot set maxOccupancy property");}
    });

    var occupants = [];
    this.getOccupants = function(){
      var o = [];
      for (var i=0; i<occupants.length; i++){
        o[i] = occupants[i].getCitizenLite();
      }
      return o;
    };

    this.occupy = function(newOccupant){
      if (newOccupant.constructor !== Citizen){
        throw new Error("Illegal occupant: must be citizen of the grid");
      }
      if (newOccupant.currentHex === this) {
        return true;
      }
      if (occupants.length >= maxOccupancy){
        return false;
      } else {
        occupants.push(newOccupant);
        newOccupant.currentHex = this;
        newOccupant.moving = false;

        this.reorient();

        return true;
      }
    };

    this.vacate = function(formerOccupant, setCurrentHex){
      var success = false;
      for (var i=0; i<occupants.length; i++){
        if (occupants[i] === formerOccupant){
          occupants.splice(i, 1);
          success = true;
          break;
        }
      }

      if (success){this.reorient();}
      return success;
    };

    this.reorient = function(){
      if (occupants.length < 1){
        return;
      }
      var newOccupant = occupants[occupants.length - 1];
      var f = newOccupant.facing;
      switch (occupants.length){
        case 1:
          moveCitizen(parentHgm, newOccupant, this.x, this.y, 250);
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

          moveCitizen(parentHgm, left, this.x - this.radius/2, this.y, 250);
          moveCitizen(parentHgm, right, this.x + this.radius/2, this.y, 250);
          break;
        default:
          var increment = Math.PI * (2 / occupants.length);
          var r = this.radius * 0.6;
          var center = new PIXI.Point(this.x, this.y);
          for (var i=0; i<occupants.length; i++){
            var newPoint = calculateRadialPoint(center, r, increment * i);
            moveCitizen(parentHgm, occupants[i], newPoint.x, newPoint.y, 250);
          }
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
        return terrainObject;
      }
      maxOccupancy += terrainObject.maxOccupancyModifier;

      terrainFeatures[terrainObject.name] = terrainObject;
      return terrainObject;
    };

    this.removeTerrain = function(name){
      if (typeof name !== "string"){throw new Error ("Invalid argument");}
      var retObject = terrainFeatures[name];

      if (retObject.maxOccupancy){
        maxOccupancy = maxOccupancy - retObject.maxOccupancy;
      }

      delete terrainFeatures[name];
      return retObject;
    };

    this.getTerrainFeatures = function(){
      var attr = {};
      for (var name in terrainFeatures){
        attr[name] = terrainFeatures[name];
      }

      return attr;
    };

    var lite;
    this.getHexLite = function(){
      if (!lite){
        lite = new HexGrid.HexLite(this);
      }
      return lite;
    };
  }

  HexGrid.HexSpaceLite = function (hexSpace) {
    if (!(hexSpace instanceof HexSpace)) {
      throw new Error ("HexSpaceLite cannot be constructed from an object that's not a HexSpace");
    }

    let lite = this;

    Object.defineProperty(lite, "x", {
      value: hexSpace.x,
      writable: false,
      configurable: false,
      enumerable: true,
    });
    Object.defineProperty(lite, "y", {
      value: hexSpace.y,
      writable: false,
      configurable: false,
      enumerable: true,
    });
    
    Object.defineProperty(lite, "gridX", {
      value: hexSpace.gridX,
      writable: false,
      configurable: false,
      enumerable: true,
    });
    Object.defineProperty(lite, "gridY", {
      value: hexSpace.gridY,
      writable: false,
      configurable: false,
      enumerable: true,
    });
    Object.defineProperty(lite, "radius", {
      value: hexSpace.radius,
      writable: false,
      configurable: false,
      enumerable: true,
    });
    Object.defineProperty(lite, "getTerrainFeatures", {
      value: hexSpace.getTerrainFeatures,
      writable: false,
      configurable: false,
      enumerable: true,
    });
    Object.defineProperty(lite, "getOccupants", {
      value: hexSpace.getOccupants,
      writable: false,
      configurable: false,
      enumerable: true,
    });
  };

  function Citizen(sprite, name, extAttributes){
    //instance variables
    var currentHex;
    var moving = false;
    var facing = Math.PI;
    var attributes = extAttributes ? extAttributes : {};
    var that = this;

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
        if (hex && hex.constructor === HexSpace){
          currentHex = hex;
        } else {
          currentHex = null;
        }
      }
    });

  //final variables
    Object.defineProperty(this, "sprite", {
      value: sprite,
      enumerable: true
    });
    Object.defineProperty(this, "name", {
      value: name,
      enumerable: true
    });

  //METHODS

  //interruptMovementMethod with closure-based function it calls
    var interruptFunctionDefault = function(){};
    var interruptFunction = interruptFunctionDefault;
    this.setInterrupt = function(fn){
      interruptFunction = fn;
    };
    this.clearInterrupt = function(){
      interruptFunction = interruptFunctionDefault;
    };
    this.interrupt = function(){
      var fn = interruptFunction;
      interruptFunction = interruptFunctionDefault;
      return fn.apply(undefined, arguments);
    };

    var lite;
    this.getCitizenLite = function(){
      if (!lite){
        lite = {};
        Object.defineProperty(lite, "facing", {
          configurable: false,
          enumerable: true,
          get: function(){return facing;}
        });
        Object.defineProperty(lite, "moving", {
          configurable: false,
          enumerable: true,
          get: function(){return moving;}
        });
        Object.defineProperty(lite, "currentHex", {
          configurable: false,
          enumerable: true,
          get: function(){return currentHex ? currentHex.getHexLite() : null;}
        });

        Object.defineProperty(lite, "sprite", {
          value: that.sprite,
          writable: false,
          configurable: false,
          enumerable: true
        });
        Object.defineProperty(lite, "name", {
          value: that.name,
          writable: false,
          configurable: false,
          enumerable: true
        });
        Object.defineProperty(lite, "attributes", {
          value: extAttributes,
          writable: false,
          configurable: false,
          enumerable: true
        });
        Object.defineProperty(lite, "interrupt", {
          value: that.interrupt,
          writable: false,
          configurable: false,
          enumerable: true
        });
      }
      return lite;
    }
  }

  /**
  * HexGrid definition. initializeHexGrid() returns the HexGridManager controller object
  */

  PIXI.HexGrid = {};
  PIXI.HexGrid.initializeHexGrid = function(hexX, hexY, radius, gridColor, rotate) {
    if (hexX < 1 || hexY < 1 || radius <= 0){
      throw new Error ("Dimensions or radius for hex grid not valid");
    }

  //Controller object
    var hexGridManager = {};

  //instance variables
    var population = {};
    //stage
    var stage = new PIXI.Container();
    //utility variables
    var hexArray, kdTree;

  //grid drawing variables
    var penColor = typeof gridColor === "string" ? gridColor : "#000000";
    var isRotated = false;
    if (typeof gridColor === "boolean"){
      isRotated = gridColor;
    } else if (typeof rotate === "boolean"){
      isRotated = rotate;
    }

  //initialize grid texture and utility variables from hex data
    var gridInfo = drawHexGrid(hexGridManager, hexX, hexY, radius, penColor, isRotated);
    hexArray = new Flat2dGrid(gridInfo.hexSpaces);
    kdTree = new KdTree(hexArray.flattenedArray);
    var gridTexture = PIXI.Texture.fromCanvas(gridInfo.canvas);

  //Create sprite which we'll add to our stage
    var gridSprite = new PIXI.Sprite(gridTexture);
    gridSprite.x = 0;
    gridSprite.y = 0;

  //create other containers to add to the stage
    var underLayer = new PIXI.Container();
    var citizenLayer = new PIXI.Container();
    var overLayer = new PIXI.Container();
    
  //Final variables
    Object.defineProperty(hexGridManager, "gridSprite", {
      value: gridSprite,
      enumerable: true
    });
    Object.defineProperty(hexGridManager, "ticker", {
      value: new PIXI.ticker.Ticker(),
      enumerable: true
    });
    Object.defineProperty(hexGridManager, "grid", {
      value: stage,
      enumerable: true
    });
    Object.defineProperty(hexGridManager, "underLayer", {
      value: underLayer,
      enumerable: true
    });
    Object.defineProperty(hexGridManager, "citizenLayer", {
      value: citizenLayer,
      enumerable: true
    });
    Object.defineProperty(hexGridManager, "overLayer", {
      value: overLayer,
      enumerable: true
    });
    Object.defineProperty(hexGridManager, "hexRadius", {
      value: radius,
      enumerable: true
    });

    var dim = {};
    Object.defineProperty(dim, "gridX", {
      value: hexX,
      enumerable: true
    });
    Object.defineProperty(dim, "gridY", {
      value: hexY,
      enumerable: true
    });

    Object.defineProperty(hexGridManager, "dimensions", {
      value: dim,
      enumerable: true
    });

  //Methods
    hexGridManager.pointAt = function(gridX, gridY){
      var hex = hexArray.getAt(gridX,gridY);
      return new PIXI.Point(hex.x, hex.y);
    }

    hexGridManager.hexAt = function(x, y){
      var hex = kdTree.nearestNeighbor(x, y);
      return hex.getHexLite();
    }

    hexGridManager.getAllHexSpaces = function(){
      var result = [];
      var temp = hexArray.flattenedArray;
      for (var i=0; i<temp.length; i++){
        result[i] = temp[i].getHexLite();
      }
      return result;
    }

    hexGridManager.distanceBetween = function(gridX1, gridY1, gridX2, gridY2){
      if (gridX1 < 0 || gridY1 < 0 || gridX2 < 0 || gridY2 < 0 || gridX1 >= this.dimensions.gridX || gridY1 >= this.dimensions.gridY || gridX2 >= this.dimensions.gridX || gridY2 >= this.dimensions.gridY){
        throw new Error ("Out of bounds of grid");
      }

      var hex1 = hexArray.getAt(gridX1, gridY1);
      var hex2 = hexArray.getAt(gridX2, gridY2);
      var squaredD = KdTree.squaredDistanceBetween(hex1.x, hex1.y, hex2.x, hex2.y);

      return Math.sqrt(squaredD);
    };

    hexGridManager.adjacentHexes = function(x, y){
      var adjacentHexArray = [];
      var xM=x-1, xP=x+1, yM=y-1, yP=y+1;
      var xMe=xM>=0, xPe=xP<this.dimensions.gridX, yMe=yM>=0, yPe=yP<this.dimensions.gridY;
      if (xMe){adjacentHexArray.push(hexArray.getAt(xM, y).getHexLite());}
      if (xPe){adjacentHexArray.push(hexArray.getAt(xP, y).getHexLite());}
      if (yMe) {adjacentHexArray.push(hexArray.getAt(x, yM).getHexLite());}
      if (yPe) {adjacentHexArray.push(hexArray.getAt(x, yP).getHexLite());}

      if (!isRotated){
        if (x % 2 === 0 && yPe){
          if (xMe){adjacentHexArray.push(hexArray.getAt(xM, yP).getHexLite());}
          if (xPe){adjacentHexArray.push(hexArray.getAt(xP, yP).getHexLite());}
        } else if (x % 2 === 1 && yMe){
          if (xMe){adjacentHexArray.push(hexArray.getAt(xM, yM).getHexLite());}
          if (xPe){adjacentHexArray.push(hexArray.getAt(xP, yM).getHexLite());}
        }
      } else {
        if (y % 2 === 0 && xMe){
          if (yMe){adjacentHexArray.push(hexArray.getAt(xM, yM).getHexLite());}
          if (yPe){adjacentHexArray.push(hexArray.getAt(xM, yP).getHexLite());}
        } else if (y % 2 === 1 && xPe){
          if (yMe){adjacentHexArray.push(hexArray.getAt(xP, yM).getHexLite());}
          if (yPe){adjacentHexArray.push(hexArray.getAt(xP, yP).getHexLite());}
        }
      }
      
      return adjacentHexArray;
    };

  //caches the last 10 paths to save on repetitive computation
    var hexPathCache = {};
    var hexPathCacheKeys = [];
    hexGridManager.hexesBetween = function(gridX1, gridY1, gridX2, gridY2){
      //if cached, return the cached value
      var id = ""+gridX1+gridY1+gridX2+gridY2;
      if (hexPathCache[id]){
        return hexPathCache[id];
      }

      var intersectingHexes = [];
      var origin = hexArray.getAt(gridX1, gridY1);
      var destination = hexArray.getAt(gridX2, gridY2);
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
          intersectingHexes.push(currentHex.getHexLite());
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

    hexGridManager.addCitizen = function(sprite, name, x, y, extAttributes){
      if (population[name]){
        throw new Error ("Name already registered! Can't create citizen");
      }
      var x1 = x, y1 = y;
      if (typeof x !== "number" || typeof y !== "number"){
        x1 = 0;
        y1 = 0;
      }

      var newCitizen = new Citizen(sprite, name, extAttributes);
      var initialHex = hexArray.getAt(x1,y1);

      population[name] = newCitizen;
      citizenLayer.addChild(newCitizen.sprite);

      this.moveCitizenTo(name, x, y, 0);

      return this;
    };
    hexGridManager.removeCitizen = function(name){
      var c = population[name];
      if (!c){
        return;
      }

      delete population[name];

      return citizenLayer.removeChild(c.sprite);
    };

  //Breadth-first search for an unoccupied space to occupy
    function occupy(hexSpace, citizen, hexGridManager){
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
          adjacent = hexGridManager.adjacentHexes(next.gridX, next.gridY);
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

    hexGridManager.moveCitizenTo = function(name, x, y, time, animation, endAnimation){
      if (x < 0 || x >= hexArray.columns || y < 0 || y >= hexArray.rows){
        throw new Error ("Grid index out of bounds");
      }
      if (!population[name]){
        throw new Error("Citizen not a member of this grid");
      }
      if (typeof time !== "number" && time !== undefined){
        throw new Error("Not a valid time");
      }
      var that = this;
      var c = population[name];
      var hex = hexArray.getAt(x, y);
      var originHex = c.currentHex;

    //if time is 0 or undefined, simply jump to the destination immediately
      if ((time || 0) === 0) {
        var success = hex.occupy(c);
        if (success && originHex && originHex !== hex){
          originHex.vacate(c);
        }
        return success;
      }


    //create wrapper function for the endAnimation argument that occupies the hex grid
      var ea2 = (tickerLite, citizen) => {
        var landingHex = kdTree.nearestNeighbor(citizen.sprite.x, citizen.sprite.y);
        if (originHex){
          if (!landingHex.occupy(c)){
            var path = that.hexesBetween(originHex.gridX, originHex.gridY, hex.gridX, hex.gridY);
            var lastHexProxy = path[path.length-2];
            var lastHex;
            if (lastHexProxy){
              lastHex = hexArray.getAt(lastHexProxy.gridX, lastHexProxy.gridY);
            } else {
              lastHex = originHex;
            }
            occupy(lastHex, c, that);
          }
        } else {
          occupy(landingHex, c, that);
        }
        if (typeof endAnimation === "function"){
          endAnimation(tickerLite, citizen);
        }
      };

      if (originHex){
        originHex.vacate(c);
        c.currentHex = null;
      }
    //Sets facing, moving and interrupt on the passed citizen object
      moveCitizen(this, c, hex.x, hex.y, (time || 0), animation, ea2);
      return c.interrupt;
    };

  //Citizen accessor functions
    hexGridManager.getCitizen = function(name){
      return population[name].getCitizenLite();
    };

    hexGridManager.addTerrain = function(hx, hy, name){
      var hex = hexArray.getAt(hx, hy);

      var newTerrain = null;
      try {
        newTerrain = hex.addTerrain(name);
      } catch (e){}
      if (newTerrain !== null){
        if (newTerrain.layer === "overlay"){
          overLayer.addChild(newTerrain.sprite);
        } else if (newTerrain.layer === "underlay"){
          underLayer.addChild(newTerrain.sprite);
        }

        newTerrain.sprite.x = hex.x;
        newTerrain.sprite.y = hex.y;
      }
      return newTerrain;
    };

    hexGridManager.removeTerrain = function(hx, hy, name){
      var hex = hexArray.getAt(hx, hy);
      var terrain = hex.removeTerrain(name);

      if (terrain.layer === "overlay"){
        overLayer.removeChild(terrain.sprite);
      } else if (terrain.layer === "underlay"){
        underLayer.removeChild(terrain.sprite);
      }

      return this;
    };

    stage.addChild(gridSprite);
    stage.addChild(underLayer);
    stage.addChild(citizenLayer);
    stage.addChild(overLayer);

    return hexGridManager;
  }

  var globalMaxOcc = 2;
  PIXI.HexGrid.setMaxOccupancy = function(newVal){
    var n = parseInt(newVal);
    if (n === n){
      globalMaxOcc = n;
    }

    return PIXI.HexGrid;
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
    Object.defineProperty(this, "layer", {
      value: terrainRegister[name].layer,
      configurable: false,
      writable: false,
      enumerable: true
    });
    Object.defineProperty(this, "maxOccupancyModifier", {
      value: terrainRegister[name].maxOccupancyModifier,
      configurable: false,
      writable: false,
      enumerable: true
    });
  };

  var terrainRegister = {};
  PIXI.HexGrid.Terrain.registerNewType = function(name, texture, attributes, layer, maxOccupancyModifier){
    if (typeof layer === "number"){
      maxOccupancyModifier = layer;
      layer = "underlay";
    } else if (layer !== "overlay"){
      layer = "underlay";
      maxOccupancyModifier = 0;
    }

    terrainRegister[name] = {
      texture: texture,
      attributes: attributes,
      layer: layer,
      maxOccupancyModifier: maxOccupancyModifier
    };
    return PIXI.HexGrid.Terrain;
  };

  return PIXI;
});