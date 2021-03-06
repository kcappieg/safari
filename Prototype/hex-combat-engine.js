/******************************
Combat engine written for PIXI.js
uses PIXI.HexGrid extension

author Kevin C. Gall
******************************/

define(["./pixi-hexgrid"], function(PIXI){
  "use strict";

//below is to create a system where I can set values privately without exposing the setter to the client
//private properties must implement set method that expects the below object
  const internal = Symbol();
  function privateSetter (newVal){
    return {i: internal, n: newVal};
  }

  function CombatEngine(r){
    
  //final variables
    const combatants = {};
    const battlefields = {};

  //instance variables
    let renderer = r;

    this.addCombatant = (name, combatant) => {addCombatantTop(name, combatant, combatants); return this;};
    this.removeCombatant = (name) => removeCombatantTop(name, combatants);
    this.initializeBattlefield = (type, hexX, hexY, radius, rotate) => initializeBattlefieldTop(type, hexX, hexY, radius, rotate, battlefields);
    this.addCombatantToBattlefield = (name, battlefield, hexX, hexY) => {addCombatantToBattlefieldTop(name, combatants[name], battlefields[battlefield], hexX, hexY); return this;};
    this.removeCombatantFromBattlefield = (name, battlefield) => {removeCombatantFromBattlefieldTop(name, combatants[name], battlefields[battlefield]); return this;};
    this.clearBattlefield = (battlefield) => clearBattlefieldTop(battlefields[battlefield], combatants);
    this.deleteBattlefield = (battlefield) => {
      let r = this.clearBattlefield(battlefield);
      battlefields[battlefield].grid.destory(true);
      battlefields[battlefield] = undefined;
      return r;
    };
    this.setRenderer = (newRenderer) => {renderer = newRenderer; return this;};
    this.onCombatFinish = (battlefield, fn) => {onCombatFinishTop(battlefields[battlefield], fn); return this;};
    this.offCombatFinish = (battlefield, fn) => {offCombatFinishTop(battlefields[battlefield], fn); return this;};
    this.getBattlefieldHexGridManager = (battlefield) => battlefields[battlefield];

  //this method needs to be modified to account for the edge case where a battle is initiated when another is still going
    this.initiateCombat = (battlefield) => initiateCombatTop(battlefields[battlefield], renderer);
  }

  function initiateCombatTop(hgm, renderer){
    let go = true;
    hgm.ticker.start();
    function animate (){
      if (go){
        requestAnimationFrame(animate);

        let count = 0;
        for (let name in hgm.combatants) {
          console.log("looping for "+name);
          hgm.combatants[name].loop(hgm);
          count++;
        }
        if (count === 1){
          go = false;
          hgm.ticker.stop();
          alert("Battle over!");
        }

        renderer.render(hgm.grid);
      }
    }

    requestAnimationFrame(animate);

    return function(){
      if (go){go = !go; hgm.ticker.stop();}
      else {go = true; hgm.ticker.start(); requestAnimationFrame(animate);}
    }
  }

  function initializeBattlefieldTop (type, hexX, hexY, radius, rotate, battlefields){
    let bT = battlefieldTypes[type];
    let hgm = PIXI.HexGrid.initializeHexGrid(hexX, hexY, radius, bT.gridLines, rotate);

  //create unique symbol to identify battlefield
    let s = Symbol();
    battlefields[s] = hgm;

    if (bT.texture) {
      let background = new PIXI.Sprite(bT.texture);
      hgm.grid.addChildAt(background, 0);
    }
    if (bT.hexTerrains) {
      hgm.getAllHexSpaces().forEach(function(hs){
        var t = bT.hexTerrains.call(undefined, hs);
        t.forEach(function(name){
          hgm.addTerrain(hs.gridX, hs.gridY, name);
        });
      });
    }

  //initialize a hash map into which combatants can be added when they occupy that battlefield
    hgm.combatants = {};
  //initialize callback array for combat finish
    hgm.onCombatFinish = [];

    return s;
  }

  function onCombatFinishTop (hgm, fn){
    if (typeof fn !== "function"){
      throw new Error ("Illegal arguments");
    }
    hgm.onCombatFinish.push(fn);
  }

  function offCombatFinishTop (hgm, fn){
    if (typeof fn === "function"){
      for (let i=0; i<hgm.onCombatFinish.length; i++){
        if (hgm.onCombatFinish[i] === fn){
          hgm.onCombatFinish.splice(i, 1);
          break;
        }
      }
    } else {
      hgm.onCombatFinish = [];
    }
  }

  function addCombatantToBattlefieldTop (name, combatant, hgm, hexX, hexY){
    if (combatant.inCombat){
      throw new Error ("Combatant already registered on a battlefield");
    }

    hgm.addCitizen(combatant.sprite, name, hexX, hexY, combatant);

    hgm.combatants[name] = combatant;

    combatant.inCombat = privateSetter(true);
  }

  function removeCombatantFrombattlefieldTop(name, combatant, hgm) {
    hgm.removeCitizen(name);

    hgm.combatants[name] = undefined;
    combatant.inCombat = privateSetter(false);
  }

  function clearBattlefieldTop(hgm, combatants){
    let r = [];
    for (let name in hgm.combatants){
      r.push(hgm.combatants[name]);
      hgm.combatants.inCombat = privateSetter(false);
      hgm.removeCitizen(name);
    }

    hgm.combatants = {};
    return r;
  }

  function addCombatantTop (name, combatant, combatants){
    if (!(combatant instanceof CombatEngine.Combatant) || typeof name !== "string"){
      throw new Error ("Illegal argument exception");
    }
    if (combatants[name] !== undefined){
      throw new Error ("Name already registered");
    }

    combatants[name] = combatant;
    combatant.name = privateSetter(name);
  };

  function removeCombatantTop (name, combatants){
      if (combatants[name] === undefined){
        return null;
      }
      let c = combatants[name];
      combatants[name] = undefined;
      c.name = privateSetter("");
      return c;
    };

//Register battlefields. Can specify background texture, gridLines, and function for applying terrain types to every hex space on the grid
  const battlefieldTypes = {};
  CombatEngine.registerBattlefieldType = function(type, texture, hexTerrains, gridLines){
    if (typeof texture === "function"){
      if (typeof hexTerrains === "string"){
        gridLines = hexTerrains;
      }
      hexTerrains = texture;
      texture = null;
    } else if (typeof texture === "string"){
      gridLines = texture;
      texture = null;
    }

    if (typeof hexTerrains === "string"){
      gridLines = hexTerrains;
      hexTerrains = null;
    }

    if (!gridLines){
      gridLines = '#000000';
    }
    battlefieldTypes[type] = {
      texture: texture,
      gridLines: gridLines,
      hexTerrains: hexTerrains
    };
  };

  CombatEngine.Combatant = function(){
    let inCombat = false;
    let currentAction = null;
    let interruptChain = [];
    let preAssessMessageChain = [];
    let assessMessageChain = [];
    let assessChain = [];
    let finalAssessment = defaultFinalAssessment;
    let actionMessageChain = [];
    let actionChain = [];
    let finalAction = defaultFinalAction;
    let animations = {};
    const gear = new Map();

  //Methods
    this.chainRouter = function(chainType, data){
      switch (chainType){
        case CombatEngine.Combatant.PREASSESSMESSAGE:
          return chainCaller.call(this, preAssessMessageChain); //returns undefined
          break;
        case CombatEngine.Combatant.ASSESSMESSAGE:
          return chainCaller.call(this, assessMessageChain, undefined, data); //returns the filtered data array
          break;
        case CombatEngine.Combatant.ASSESS:
          return chainCaller.call(this, assessChain, finalAssessment, data); //returns the filtered data array
          break;
        case CombatEngine.Combatant.ACTIONMESSAGE:
          return chainCaller.call(this, actionMessageChain, actionMessageFinal, data); //returns an action or false
          break;
        case CombatEngine.Combatant.ACTION:
          return chainCaller.call(this, actionChain, finalAction, data); //returns an action
          break;
      }
    };

    this.setAssessChain = () => {assessChain = []; return setAssessChainTop(assessChain, (fn) => finalAssessment = fn);};
    this.setActionChain = () => {actionChain = []; return setActionChainTop(actionChain, (fn) => finalAction = fn);};

    this.setAnimation = (type, animation, endAnimation) => {
      animations[type] = {
        animation: animation,
        endAnimation: endAnimation
      };
    };

    this.getAnimation = (type, i) => {
      if (i !== internal){
        throw new Error ("Private method. Access restricted");
      }

      return animations[type] || {};
    };

    this.getGear = function getGear(slot){
      return gear.get(slot);
    };

    this.setGear = function setGear(slot, item){
      switch (slot){
        case CombatEngine.Combatant.HEAD:
        case CombatEngine.Combatant.ARMOR:
        case CombatEngine.Combatant.WEAPON1:
        case CombatEngine.Combatant.WEAPON2:
        case CombatEngine.Combatant.FEET:
          break;
        default:
          throw new Error("Not a valid gear slot");
      }

    //TODO: make checks that item is a correct item type
    //possibly create individual functions for each gear slot
      gear.set(slot, item);
    }

  //read-only properties
    Object.defineProperty(this, "detectionModifiers", {
      value: new Map(),
      enumerable: true
    });
    Object.defineProperty(this, "influenceModifiers", {
      value: new Map(),
      enumerable: true
    });

  //"type-safe" instance variables
    let team = Symbol("defaultTeam");
    Object.defineProperty(this, "team", {
      enumerable: true,
      get: () => team,
      set: (newVal) => {if (typeof newVal === "symbol"){team = newVal;} return team;}
    });
    let name;
    Object.defineProperty(this, "name", {
      enumerable: true,
      get: () => name,
      set: (newVal) => {if (newVal.i === internal){name = newVal.n;} return name;}
    });
    let sprite = null;
    Object.defineProperty(this, "sprite", {
      enumerable: true,
      get: () => sprite,
      set: (newVal) => {if (newVal.i === internal){sprite = newVal.n;} return sprite;}
    });
    let maxHP = 1;
    Object.defineProperty(this, "maxHP", {
      enumerable: true,
      get: () => maxHP,
      set: (newVal) => {if (typeof newVal === "number"){maxHP = newVal;} return maxHP;}
    });
    let currentHP = undefined;
    Object.defineProperty(this, "currentHP", {
      enumerable: true,
      get: () => currentHP,
      set: (newVal) => {if (typeof newVal === "number"){currentHP = newVal;} return currentHP;}
    });
    let strength = 5;
    Object.defineProperty(this, "strength", {
      enumerable: true,
      get: () => strength,
      set: (newVal) => {if (typeof newVal === "number"){strength = newVal;} return strength;}
    });
    let endurance = 5;
    Object.defineProperty(this, "endurance", {
      enumerable: true,
      get: () => endurance,
      set: (newVal) => {if (typeof newVal === "number"){endurance = newVal;} return endurance;}
    });
    let marksmanship = 5;
    Object.defineProperty(this, "marksmanship", {
      enumerable: true,
      get: () => marksmanship,
      set: (newVal) => {if (typeof newVal === "number"){marksmanship = newVal;} return marksmanship;}
    });
    let influence = 5;
    Object.defineProperty(this, "influence", {
      enumerable: true,
      get: () => influence,
      set: (newVal) => {if (typeof newVal === "number"){influence = newVal;} return influence;}
    });
    let willfulness = 5;
    Object.defineProperty(this, "willfulness", {
      enumerable: true,
      get: () => willfulness,
      set: (newVal) => {if (typeof newVal === "number"){willfulness = newVal;} return willfulness;}
    });
    let perceptiveness = 5;
    Object.defineProperty(this, "perceptiveness", {
      enumerable: true,
      get: () => perceptiveness,
      set: (newVal) => {if (typeof newVal === "number"){perceptiveness = newVal;} return perceptiveness;}
    });
    let sneakiness = 5;
    Object.defineProperty(this, "sneakiness", {
      enumerable: true,
      get: () => sneakiness,
      set: (newVal) => {if (typeof newVal === "number"){sneakiness = newVal;} return sneakiness;}
    });
    let speed = 100;
    Object.defineProperty(this, "speed", {
      enumerable: true,
      get: () => speed,
      set: (newVal) => {if (typeof newVal === "number"){speed = newVal;} return speed;}
    });
    let defense = 10;
    Object.defineProperty(this, "defense", {
      enumerable: true,
      get: () => defense,
      set: (newVal) => {if (typeof newVal === "number"){defense = newVal;} return defense;}
    });
    let backpackCapacity = 0;
    Object.defineProperty(this, "backpackCapacity", {
      enumerable: true,
      get: () => backpackCapacity,
      set: (newVal) => {if (typeof newVal === "number"){backpackCapacity = Math.floor(newVal);} return backpackCapacity;}
    });

  //privately settable properties
    Object.defineProperty(this, "inCombat", {
      enumerable: true,
      get: () => inCombat,
      set: (newVal) => {if (newVal.i === internal){inCombat = newVal.n;} return inCombat;}
    });
  };

  function setAssessChainTop(ac, finalAssessmentSetter){
    let chain = {
      then: (fn) => {ac.push(fn); return chain;},
      finally: (fn) => finalAssessmentSetter(fn)
    };

    return chain;
  }

  function setActionChainTop(ac, finalActionSetter){
    let chain = {
      then: (fn) => {ac.push(fn); return chain;},
      finally: (fn) => finalActionSetter(fn)
    };

    return chain;
  }

//Builder
  CombatEngine.Combatant.combatantBuilder = function (){
    let newC = new CombatEngine.Combatant();
    let spriteSet = false;

    let builder = {
      build: () => {
        if (!spriteSet){
          throw new Error ("Sprite not set yet. Set sprite before building!");
        }
        const temp = newC;
        newC = undefined;
        return temp;
      },
      defense: (score) => {newC.defense = score; return builder;},
      endurance: (score) => {newC.endurance = score; return builder;},
      hp: (total) => {newC.maxHP = total; newC.currentHP = total; return builder;},
      influence: (score) => {newC.influence = score; return builder;},
      marksmanship: (score) => {newC.marksmanship = score; return builder;},
      perceptiveness: (score) => {newC.perceptiveness = score; return builder;},
      sneakiness: (score) => {newC.sneakiness = score; return builder;},
      speed: (s) => {newC.speed = s; return builder;},
      sprite: (s) => {newC.sprite = privateSetter(s); spriteSet = true; return builder;},
      strength: (score) => {newC.strength = score; return builder;},
      team: (t) => {newC.team = t; return builder;},
      willfulness: (score) => {newC.willfulness = score; return builder;},
    };
    return builder;
  };

//ENUMs
  //Trait ENUMs
  CombatEngine.Combatant.MELEE = Symbol();
  CombatEngine.Combatant.RANGED = Symbol();
  CombatEngine.Combatant.SNIPER = Symbol();
  CombatEngine.Combatant.COMMANDER = Symbol();
  CombatEngine.Combatant.WEAK = Symbol();
  CombatEngine.Combatant.STRONG = Symbol();
  CombatEngine.Combatant.SNEAKY = Symbol();
  CombatEngine.Combatant.BRUTE = Symbol();
  CombatEngine.Combatant.ARMORED = Symbol();
  CombatEngine.Combatant.NOTORIOUS = Symbol();

  //Gear ENUMs
  CombatEngine.Combatant.HEAD = Symbol();
  CombatEngine.Combatant.ARMOR = Symbol();
  CombatEngine.Combatant.WEAPON1 = Symbol();
  CombatEngine.Combatant.WEAPON2 = Symbol();
  CombatEngine.Combatant.FEET = Symbol();

  //Chain ENUMs
  CombatEngine.Combatant.PREASSESSMESSAGE = Symbol();
  CombatEngine.Combatant.ASSESSMESSAGE = Symbol();
  CombatEngine.Combatant.ASSESS = Symbol();
  CombatEngine.Combatant.ACTIONMESSAGE = Symbol();
  CombatEngine.Combatant.ACTION = Symbol();

//chain helper functions

  function defaultFinalAssessment (enemies){
    if (enemies.length < 2){
      return enemies;
    }

    let randomEnemy =  Math.floor(Math.random() * (enemies.length));

    return [enemies[randomEnemy]];
  }

  function actionMessageFinal (actionBuilder){
    if (actionBuilder.ready){
      return actionBuilder.build();
    } else {
      return false;
    }
  }

  function defaultFinalAction (actionBuilder) {
    if (actionBuilder.ready) {
      return actionBuilder.build();
    } else {
      return new CombatEngine.WaitAction(0);
    }
  }

/** Below takes will and influence and outputs a boolean of whether the target is influenced
 **
 ** @param will - The integer value of the target's will against this influence
 ** @param influence - The integer value of the target's influence for this message
 **
 ** @returns boolean - is the target successfully influenced? i.e. do they run the message function
 */
  function isInfluenced(will, influence){
    //for now, just return true.
    //TODO: come up with an algorithm here
    return true;
  }

//meant to be 'call()'ed with the combatant object
  function chainCaller(chain, final, data){
    let result;
    let i = 1;
    //set a default final function
    if (typeof final !== "function"){
      final = data => data;
    }
    const next = (data) => {
      if (i >= chain.length){
        resolve(data);
      } else {
        chain[i++].call(this, next, resolve, data);
      }
    }
    const resolve = (data) => {
      result = final.call(this, data);
    }

    if (Array.isArray(chain) && chain.length > 0){
      chain[0].call(this, next, resolve, data);
    } else {
      resolve(data);
    }

  //result is returned whether or not it is undefined.
    return result;
  }

/** Message Wrapper - this method wraps messages when it needs to be determined whether or not the message will be listened to using isInfluenced
 ** @param sender - CombatEngine.Combatant object of the sender
 */
  CombatEngine.Combatant.prototype.messageWrapperGenerator = function (sender, messageFunction){
    return (next, resolve, data) => {
      let influenceModifier = this.influenceModifiers.get(sender.name);
      influenceModifier += sender.influence;

      if (this.team !== sender.team) {
        influenceModifier -= 100;
      }

      if (isInfluenced(this.willfulness, influenceModifier)) {
        messageFunction.apply(undefined, arguments);
      }
      next(data);
    }
  }

//invoked in the context of the combatant attempting to detect
  function detectionFilter(character){
    var perceptiveness = this.perceptiveness + this.detectionModifiers.get(character.name) + Math.floor(Math.random() * 30);
    var sneakiness = character.sneakiness + Math.floor(Math.random() * 30);

    return perceptiveness >= sneakiness;
  }

  CombatEngine.Combatant.prototype.detectEnemies = function(hgm){
    //temporary algorithm. Looks at perceptiveness vs. sneakiness with modifiers applied.
    //TODO: come up with a better algorithm
  //first: declare variables for this combatant
    const targets = [];
    const thisCitizen = hgm.getCitizen(this.name);
    let thisHex = thisCitizen.currentHex;

    if (thisHex === null){
      thisHex = hgm.hexAt(thisCitizen.sprite.x, thisCitizen.sprite.y);
    }
  //then: remove any allies from the list
    for (let c in hgm.combatants){
      if (hgm.combatants[c].team !== this.team){
        targets.push(hgm.combatants[c]);
      }
    }
  //then: calculate modifier for distance, proportional to the distance between the hex spaces and inversely proportional to their radii
    for (let c of targets){
      const radius = thisHex.radius;
      const targetCitizen = hgm.getCitizen(c.name);
      let targetHex = targetCitizen.currentHex;
      if (targetHex === null){
        targetHex = hgm.hexAt(targetCitizen.sprite.x, targetCitizen.sprite.y);
      }

      const distance = hgm.distanceBetween(thisHex.gridX, thisHex.gridY, targetHex.gridX, targetHex.gridY);

      const currentModifier = this.detectionModifiers.get(c.name) || 0;
      this.detectionModifiers.set(c.name, currentModifier - Math.floor((distance / radius) * 5 - 100));
    }
  //then: Using modifiers from the map and a random modifier, filter the targets array to only those the Combatant detects, and return the filtered array
    return targets.filter(detectionFilter, this);
  };

/** This is one of 2 big game logic functions.
 ** It surveys all enemies and all messages, and from there chooses a target. The target can be
 ** either a fellow combatant or a grid space.
 **
 ** Side effects include setting bonuses or penalties to detecting particular enemies, and also setting the target property
 **
 ** @param hgm - HexGridManager object for the battlefield on which the combatant is engaging. This
 ** object also has the custom 'combatants' array, which is how a given game character can locate
 ** and assess all enemies efficiently
 **
 ** @returns void
 */
  CombatEngine.Combatant.prototype.assess = function (hgm){
    let remainingTargets;

  //pre-message chain
  //works by applying side effects to the character's state (specifically modifiers)
    this.chainRouter(CombatEngine.Combatant.PREASSESSMESSAGE);

  //detection chain: initialize remaining to targets to the array of detected enemies
    remainingTargets = this.detectEnemies(hgm);

  //message chain
  //Expects the message chain to return the array of the potential enemies to target
    remainingTargets = this.chainRouter(CombatEngine.Combatant.ASSESSMESSAGE, remainingTargets);

  //assess chain
  //Expects the assess chain to return the array of the remaining potential enemies to target
    remainingTargets = this.chainRouter(CombatEngine.Combatant.ASSESS, remainingTargets);

    this.detectionModifiers.clear();

    return remainingTargets;
  };

/** This is the second big game logic function. It chooses an action based on the targets array
 ** passed through to it as well as its set behavioral algorithms and messages.
 **
 ** @param hgm - HexGridManager
 **
 ** @returns action - symbol, one of the action ENUMs on this class
 */
  CombatEngine.Combatant.prototype.chooseAction = function(targets, hgm){
  //initialize Action builder
    let actionBuilder = CombatEngine.Action.actionBuilder(targets);

  //action message chain
    let action = this.chainRouter(CombatEngine.Combatant.ACTIONMESSAGE, actionBuilder);

  //action chain (only if an action wasn't chosen from messages)
    if (!action){
      //putting WAIT as the default action
      action = this.chainRouter(CombatEngine.Combatant.ACTION, actionBuilder);
    }

    if (!(action instanceof CombatEngine.Action)){
      throw new Error ("No action was chosen");
    }
    return action;
  };

/** Below method expects an action object that hasn't entirely been worked out yet.
 ** The basic idea is that the action object has all information about the action. This action object
 ** Can track the action's current status, and can store any subsequent actions that are supposed
 ** to come after this action.
 **
 ** Each action type can expect a certain parameter to go with it.
 **
 */
  CombatEngine.Combatant.prototype.beginAction = function(action, hgm){
    //Once implemented, find the correct animations to pass to action.start

    action.start(this, hgm);
  };

/** Method checks the current action and determines whether or not it is still acting.
 **
 */
  CombatEngine.Combatant.prototype.inAction = function(){
    return !!this.currentAction && this.currentAction.inProgress;
  }


  CombatEngine.Combatant.prototype.loop = function(hgm){
  //check for death
    if (this.currentHP <= 0){
      hgm.removeCitizen(this.name);
      delete hgm.combatants[this.name];
      console.log(this.name, "is dead");
    }

    let inAction = this.inAction();

    if (inAction){
      //determine if any interrupt messages change the action
    } else {
      //add any interrupt messages to the preassess message chain
    }

    if (!inAction) {
      let targets = this.assess(hgm);
      let action = this.chooseAction(targets, hgm);
      this.beginAction(action, hgm);
    }
  };

/** Action class. Meant as an abstract class from which real classes for different action types inherit
 **
 */

  CombatEngine.Action = function(nextAction) {
    if (nextAction && !(nextAction instanceof CombatEngine.Action)) {
      throw new Error("Illegal arguments to Action constructor");
    }

    let timer;
    let inProgress = false;
    let interrupted = false;
    let thisActor = null;
    let thisHgm = null;
    let begun = false;

  //The real implementations of this method should always take an animation to be performed during the action and an end animation
    this.start = function (actor, hgm) {
      if (begun === true){
        throw new Error ("Action already begun. Can't start again");
      }

      this.inProgress = privateSetter(true);
      actor.currentAction = this;
      thisActor = actor;
      thisHgm = hgm;

      timer = new Date();
      begun = true;
    };
    this.elapsed = function (){
      return timer ? new Date() - timer : 0;
    };

    this.end = function end(){
      this.inProgress = privateSetter(false);

      if (!this.interrupted && this.nextAction){
        this.nextAction.start(thisActor, thisHgm);
      } else {
        thisActor.currentAction = null;
      }
    };

    Object.defineProperty(this, "nextAction", {
      value: nextAction,
      enumerable: true,
    });
    Object.defineProperty(this, "inProgress", {
      get: () => {return inProgress;},
      set: (input) => {if (input.i === internal){inProgress = input.n}}
    });
    Object.defineProperty(this, "interrupted", {
      get: () => {return interrupted;},
      set: (input) => {if (input.i === internal){interrupted = input.n}}
    });
  };
  CombatEngine.Action.prototype.interruptAction = function(){
    this.interrupted = privateSetter(true);
  };

  //Action ENUMs
  CombatEngine.Action.AID = Symbol();
  CombatEngine.Action.ATTACK = Symbol();
  CombatEngine.Action.DEFEND = Symbol();
  CombatEngine.Action.MOVE = Symbol();
  CombatEngine.Action.RETREAT = Symbol();
  CombatEngine.Action.WAIT = Symbol();

// Static method for CombatEngine.Action class
  CombatEngine.Action.actionBuilder = function(data) {
    let actionBuild = {
      data: data,
      actionChain: [],
      prependAction: (type, data) => {
        actionBuild.actionChain.splice(0,0, {type:type, data:data});
      },
      appendAction: (type, data) => {
        actionBuild.actionChain.push({type:type, data:data});
      },
      build: () => {
        if (actionBuild.actionChain.length === 0){
          throw new Error ("Cannot build Action object from builder: no actions in the action chain");
        }
        
      //build the action chain backwards
        let action;
        for (let i = actionBuild.actionChain.length - 1; i >= 0; i--){
          let nextAction = action ? action : undefined;
          let cD = actionBuild.actionChain[i]; //currentData
          let c = actionConstructors[cD.type]; //constructor

          action = new c (cD.data, nextAction);
        }

        return action;
      },
      ready: false
    }
    return actionBuild;
  };

/** MoveAction class. Inherits from Action. Moves the character using the set animation function and the hexgrid manager
 ** Destination might be a HexSpaceLite or Combatant object
 */
  CombatEngine.MoveAction = function MoveAction(destination, nextAction) {

  //adding a safety valve here. When too many movement actions are chained together, the game units have trouble deregistering. The 'next action' after a move is always a 10 ms rest\
    nextAction = new CombatEngine.WaitAction(10, nextAction);

    CombatEngine.Action.call(this, nextAction);

  //save super functions
    const superStart = this.start;
    const superInterruptAction = this.interruptAction;

    let destinationCombatant = destination instanceof CombatEngine.Combatant ? destination : null;
    let destinationGrid = destinationCombatant ? null : destination;

    this.start = function(actor, hgm){

      let movementInterrupt; //define the interrupt variable;
      let currentTargX;
      let currentTargY;
      let actorCitizen = hgm.getCitizen(actor.name);
      let targetCitizen = destinationCombatant ? hgm.getCitizen(destinationCombatant.name) : null;

      let a = actor.getAnimation(this.actionType, internal);
      let animation = a.animation;
      let endAnimation = a.endAnimation;

      let endMovement = () => {
        if (endAnimation) {
          endAnimation.apply(undefined, arguments);
        }
        this.end();
      }

      this.interruptAction = () => {
        superInterruptAction.call(this);
        movementInterrupt();
        delete this.interruptAction; //remove custom function reference so that it falls back to the prototypically inherited method
      };

      //if the destination is a combatant, not a hex grid space,
      //swap the animation function for one that checks the location of the combatant every animation frame
      if (destinationCombatant){
        currentTargX = targetCitizen.sprite.position.x;
        currentTargY = targetCitizen.sprite.position.y;
        destinationGrid = hgm.hexAt(currentTargX, currentTargY);

        let originalAnimation = animation;

        animation = () => {
          let newX = targetCitizen.sprite.position.x;
          let newY = targetCitizen.sprite.position.y;
          if ((newX !== currentTargX || newY !== currentTargY) && Math.sqrt(Math.pow(newX - currentTargX, 2) + Math.pow(newY - currentTargY, 2)) > hgm.hexRadius){
            currentTargX = newX;
            currentTargY = newY;
            destinationGrid = hgm.hexAt(currentTargX, currentTargY);

            let currentHex = hgm.hexAt(actorCitizen.sprite.position.x, actorCitizen.sprite.position.y);

            let distance = hgm.distanceBetween(currentHex.gridX, currentHex.gridY, destinationGrid.gridX, destinationGrid.gridY);
          //if they are close enough, end movement now
            if (distance < hgm.hexRadius / 2){
              movementInterrupt();
              return;
            }

            let time = distance / actor.speed * 1000;

            movementInterrupt = hgm.moveCitizenTo(actor.name, destinationGrid.gridX, destinationGrid.gridY, time, animation, endMovement);
            return;
          }

          originalAnimation && originalAnimation.apply(undefined, arguments);
        }
      }

      let origin = actorCitizen.currentHex || hgm.hexAt(actorCitizen.sprite.position.x, actorCitizen.sprite.position.y);

      let distance = hgm.distanceBetween(origin.gridX, origin.gridY, destinationGrid.gridX, destinationGrid.gridY);
      let time = distance / actor.speed * 1000;

    //if the target is close enough, don't bother trying to move
      superStart.call(this, actor, hgm); //start the clock...
      if (distance < hgm.hexRadius / 2){
        this.end();
      } else {
        movementInterrupt = hgm.moveCitizenTo(actor.name, destinationGrid.gridX, destinationGrid.gridY, time, animation, endMovement);
      }
    };
  };
  CombatEngine.MoveAction.prototype = Object.create(CombatEngine.Action.prototype);
  CombatEngine.MoveAction.prototype.constructor = CombatEngine.MoveAction;
  CombatEngine.MoveAction.prototype.actionType = CombatEngine.Action.MOVE;


/** WaitAction class. Inherits from Action. Takes an amount of time to delay and waits for that amount of time.
 **
 */
  CombatEngine.WaitAction = function WaitAction(delay, nextAction){
    CombatEngine.Action.call(this, nextAction);

  //save super functions
    const superStart = this.start;

    this.start = function(actor, hgm){
      let a = actor.getAnimation(this.actionType, internal);
      let animation = a.animation;
      let endAnimation = a.endAnimation;

      let ticker = hgm.ticker;
      let tElapsed = 0; //elapsed time in ms as calculated by the ticker. This is so that we can pause the game and keep the integrity of the wait action
      let waitAnimation = () => {}; //dummy function so that I can consistently remove it
      let deregisterAnimation;
      let ender = () => {
        if (typeof endAnimation === "function"){
          endAnimation({deltaTime: ticker.deltaTime, elapsedMS: ticker.elapsedMS}, hgm.getCitizen(actor.name));
        }
        this.end();
      }

      if (typeof animation === "function") {
        waitAnimation = () => {
          animation.call(undefined, {deltaTime: ticker.deltaTime, elapsedMS: ticker.elapsedMS}, deregisterAnimation);
        };
        deregisterAnimation = () => {
          ticker.remove(waitAnimation);
        };
      }

      let wait = () => {
        tElapsed += ticker.elapsedMS;
        if (tElapsed >= delay) {
          ticker.remove(waitAnimation);
          ticker.remove(wait);
          ticker.addOnce(ender);
        }
      }

      superStart.call(this, actor, hgm);
      ticker.add(wait);

      this.interruptAction = () => {
        superInterruptAction();
        ticker.addOnce(ender);
        delete this.interruptAction;
      }
    };
  };
  CombatEngine.WaitAction.prototype = Object.create(CombatEngine.Action.prototype);
  CombatEngine.WaitAction.prototype.constructor = CombatEngine.WaitAction;
  CombatEngine.WaitAction.prototype.actionType = CombatEngine.Action.WAIT;
  

/** AttackAction class. Inherits from Action. Takes a target and attempts to attack the target.
 ** If the target is out of range of the primary weapon of the actor, this action fails immediately
 */
  CombatEngine.AttackAction = function AttackAction(target, nextAction){
    //check target argument
    if (!(target instanceof CombatEngine.Combatant)){
      throw new Error ("Illegal argument: AttackAction must be passed a Combatant target");
    }

    //call the action constructor
    CombatEngine.Action.call(this, nextAction);

    //save super functions
    const superStart = this.start;
    const superInterruptAction = this.interruptAction;

    this.start = function(actor, hgm){
      const weapon = actor.getGear(CombatEngine.Combatant.WEAPON1);

      superStart.call(this, actor, hgm);
      //check to see if this action can be performed
      if (actor === target || !weapon || isNotInRange(hgm, actor, target, weapon.range) || target.currentHP <= 0){
        return this.end();
      }

      let a = actor.getAnimation(this.actionType, internal);
      let animation = a.animation;
      let endAnimation = a.endAnimation;
      let thisCitizen = hgm.getCitizen(actor.name);

      let endAnimationWrapper = () => {
        hgm.ticker.remove(animationWrapper);
        if (endAnimation){
          hgm.ticker.addOnce(() => endAnimation({deltaTime: hgm.ticker.deltaTime, elapsedMS: hgm.ticker.elapsedMS}, thisCitizen));
        }

        this.end();
      };
      let time = 0;
      let animationWrapper = () => {
        if (animation){
          animation.call(undefined,
            {deltaTime: hgm.ticker.deltaTime, elapsedMS: hgm.ticker.elapsedMS},
            thisCitizen,
            endAnimationWrapper
          );
        } else {
        //if no animation is provided, default the attack time to 1s
          time += hgm.ticker.deltaTime;
          if (time >= 1000){
            endAnimationWrapper();
          }
        }
      };

      this.interruptAction = () => {
        superInterruptAction();
        endAnimationWrapper();
        delete this.interruptAction();
      }

    //attack is performed and resolved now, despite how long it takes the animation to execute
      attack(actor, target);

      hgm.ticker.add(animationWrapper);
    }
  }
  CombatEngine.AttackAction.prototype = Object.create(CombatEngine.Action.prototype);
  CombatEngine.AttackAction.prototype.constructor = CombatEngine.AttackAction;
  CombatEngine.AttackAction.prototype.actionType = CombatEngine.Action.ATTACK;

//helper methods for AttackAction
  function attack(attacker, target){
    console.log(attacker.name,"attacking",target.name);
    let attackBonus = attacker.strength;
    attackBonus += Math.ceil(Math.random() * 20);
    if (attackBonus > target.defense) {
      target.currentHP -= calculateDamage(attacker.getGear(CombatEngine.Combatant.WEAPON1));
    }
  }

  function calculateDamage(weapon){
    let variable = weapon.damageRange[1] - weapon.damageRange[0];

    return weapon.damageRange[0] + Math.floor(Math.random() * variable);
  }

  function isNotInRange(hgm, actor, target, range){
    let actorHex = hgm.hexAt(actor.sprite.x, actor.sprite.y);
    let targetHex = hgm.hexAt(target.sprite.x, target.sprite.y);
    let dist = hgm.distanceBetween(actorHex.gridX, actorHex.gridY, targetHex.gridX, targetHex.gridY);

    return dist < range;
  }

//need Action types for AID, ATTACK, RETREAT, DEFEND

  //Needs lookup for action types
  const actionConstructors = {};
  actionConstructors[CombatEngine.Action.AID] = CombatEngine.AidAction;
  actionConstructors[CombatEngine.Action.ATTACK] = CombatEngine.AttackAction;
  actionConstructors[CombatEngine.Action.DEFEND] = CombatEngine.DefendAction;
  actionConstructors[CombatEngine.Action.MOVE] = CombatEngine.MoveAction;
  actionConstructors[CombatEngine.Action.RETREAT] = CombatEngine.RetreatAction;
  actionConstructors[CombatEngine.Action.WAIT] = CombatEngine.WaitAction;

//Items!
/** Abstract Item class
 **
 */
  class Item{
    constructor(name){
      Object.defineProperty(this, "name", {
        value: name,
        enumerable: true
      })
    }
  }

/** Weapon class - extends Item and meant to attack enemies
 **
 */
  class Weapon extends Item {
    constructor(name, type, range, damageRange) {
    //check arguments
      switch(type){
        case CombatEngine.Weapon.RANGED:
        case CombatEngine.Weapon.MELEE:
          break;
        default:
          throw new Error("Invalid Weapon type");
      }

      range = parseInt(range);
      if (range !== range){
        throw new Error("Not a valid range");
      }

      if (!Array.isArray(damageRange)){
        throw new Error("Damage range must be array of 2 numbers: minimum damage, and maximum damage");
      }

      super(name);


      Object.defineProperty(this, "type", {
        value: type,
        enumerable: true
      });
      Object.defineProperty(this, "range", {
        value: range,
        enumerable: true
      });
      Object.defineProperty(this, "damageRange", {
        value: damageRange,
        enumerable: true
      });
    }
  }

  CombatEngine.Weapon = Weapon;

/** Weapon Enums - Different types of weapons
 ** For Prototype, limit to RANGED and MELEE
 */
  CombatEngine.Weapon.RANGED = Symbol(); //
  CombatEngine.Weapon.MELEE = Symbol();

  return CombatEngine;
});