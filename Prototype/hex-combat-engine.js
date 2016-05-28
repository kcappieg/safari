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

  function CombatEngine(renderer){
    
  //final variables
    const combatants = {};
    const battlefields = {};

  //instance variables
    let renderer = renderer;

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

    this.initiateCombat = (battlefield) => initiateCombatTop(battlefields[battlefield], renderer);
  }

  function initiateCombatTop(hgm, renderer){
    let go = true;
    function animate (){
      while (go){
        requestAnimationFrame(animate);

        for (let name in hgm.combatants) {
          assess.call(hgm.combatants[name], hgm);
        }

        renderer.render(hgm.grid);
      }
    }

    requestAnimationFrame(animate);

    return function(){
      if (go){go = !go;}
      else {go = true; requestAnimationFrame(animate);}
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
    if (combatant.inCombat >= 0){
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
    if (combatant.constructor !== CombatEngine.Combatant || typeof name !== "string"){
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
  CombatEngine.registerBattlefield = function(type, texture, hexTerrains, gridLines){
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
    let target = null;
    let preAssessMessages = [];
    let assessMessages = [];
    let assessStream = [];
    let finalAssessment = defaultFinalAssessment;

    this.detectionModifiers = {};
    this.influenceModifiers = {};

    this.streamFactory = function(streamType, combatnats){
      const combatantsCopy = [];
      for (let i=0; i<hgm.combatants; i++){
        combatantsCopy[i] = combatants[i];
      }

      switch (streamType){
        case CombatEngine.Combatant.PREASSESSMESSAGE:
          return streamGenerator.call(this, preAssessMessages);
          break;
        case CombatEngine.Combatant.ASSESSMESSAGE:
          return streamGenerator.call(this, assessMessages, [combatantsCopy]);
          break;
        case CombatEngine.Combatant.ASSESS:
          return streamGenerator.call(this, assessStream, [combatantsCopy]);
          break;
      }
    };

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
    Object.defineProperty(this, "target", {
      enumerable: true,
      get: () => target;
      set: (newVal) => {if (newVal.i === internal){target = newVal.n;} return target;}
    });
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

  //Stream ENUMs
  CombatEngine.Combatant.PREASSESSMESSAGE = Symbol();
  CombatEngine.Combatant.ASSESSMESSAGE = Symbol();
  CombatEngine.Combatant.ASSESS = Symbol();

  function defaultFinalAssessment (enemies){
    if (enemies.length < 2){
      return enemies;
    }

    let randomEnemy =  Math.floor(Math.random() * (enemies.length));

    return [enemies[randomEnemy]];
  }

//meant to be 'call()'ed with the combatant object
  function* streamGenerator(stream, arguments){
    let args;
    let argsForStream = arguments
    for (let i=0;i<stream.length;i++){
      if (args !== undefined){
        argsForStream = args;
      }
      args = yield stream[i].apply(this, argsForStream);
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

/** This is one of 2 big game logic functions. Assess is called (.call) with a combatant.
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
    let stream, iteration, remainingTargets;

  //pre-message stream
  //works by applying side effects to the character's state
    stream = this.streamFactory(CombatEngine.Combatant.PREASSESSMESSAGE);
    iteration = stream.next();
    while (!iteration.done){
      iteration = stream.next();
    }

  //message stream
  //Expects the message stream to return the array of the potential enemies to target
    stream = this.streamFactory(CombatEngine.Combatant.ASSESSMESSAGE, hgm.combatants);
    iteration = stream.next();
    while (!iteration.done){
      remainingTargets = iteration.value;
      iteration = stream.next(remainingTargets);
    }

  //assess stream
  //Expects the assess stream to return the array of the remaining potential enemies to target
    stream = this.streamFactory(CombatEngine.Combatant.ASSESS, remainingTargets);
    iteration = stream.next();
    while(!iteration.done){
      remainingTargets = iteration.value;
      iteration = stream.next(remainingTargets);
    }
  }

  return CombatEngine;
});