#Documentation for Combat Engine

Combat Engine

##Flow of Combat

Combat occurs between at least two opponents on a hexagonal playing grid in which combatants fight enemies using both ranged and melee weapons.

Combat occurs in real time. The combatants are organized into "teams". There is no limit on the amount of teams that can be present on any given map.

Combantants strategize based on enemy positions to plan their attacks. Each combatant assesses the capabilities of combatants that they can detect and makes decisions based on sets of rules and behavioral algorithms given their environment.

**Flow for combatant**

1. Combatant assess options by weighing the battlefield
 * Detects Enemies
 * Assesses capabilities
2. Combatant chooses a target and course of action
 * Target is optional
 * Move
 * Attack
 * Hide
 * Retreat
3. [INTERRUPT] During action, combatant can be interrupted. If so, return to step 1.
4. Finish action
5. Reassess

###What's involved?

####**1.** Weighing the battlefield

* Receive messages from Allies
* Survey all enemies
 * From all enemies, narrow down to which the combatant can detect
 * Filter based on messages from Allies
 * Filter based on personal bias
 * See if anyone is left

 *The above describes a chain of responsibility. Each step can be a function. The function takes the array of enemy combatants. It can run filtering operations and pass it to the next function, or it can declare the process finished and not pass it along the chain. The final function is a default method of narrowing down the options. It could be a combatant-specific algorithm: random, only melee combatants (and from there random) etc.*

 Part of filtering process can be based on keywords associated with each combatant. Keywords can include:

* Melee
* Ranged
* Sniper
* Medic
* Commander
* Weak
* Sneaky

Keywords can be based on ENUMS declared as static variables somewhere...

 **Still need to figure out what to do after combatant is chosen. Maybe it doesn't matter. They can choose a target but still run away in the next phase (which is choosing a course of action)**

####**2.** Choose a course of action

* Receive messages from Allies
* Decide behavior based on algorithm specific to that character or character type
  * If action is being interrupted, determine whether or not to continue action or change course
  * Determine whether Ally messages will be used or ignored
  * If Ally messages ignored, run behavioral algorithm

**Behavioral Algorithm** should check for different conditions in a hierarchical order. When conditions are met, a prescribed action should be taken (attack, move, retreat, defend, etc.). If none of the conditions listed are met, there should be a default action.

####**3.** Send Message [OPTIONAL]

* Send message to fellow combatants

 **Note:** Messages from allies can be split into categories - choosing targets vs. course of action. Choosing Target messages can be filtering functions, Course of Action messages can be behavioral functions which use the Combatant object interface to perform actions. Or Course of Action can be strings which name possible actions, passed with a data object (if relevant). The data object would hold information such as which Hex to move to, which enemy to attack.

 **Note:** Part of a character's attributes can be a) How much influence they have with other people, b) How much they are willing to listen to others' messages. If the chances are low that a character will listen to others' messages, those messages are simply discarded unused.

 **Note:** A combatant can send messages to an enemy. Messages from enemies will rate the message based on danger. Messages to attack or move somewhere will be high danger, and so incredibly unlikely to be followed. Messages to retreat will be lower danger, so more likely to be followed (especially as health gets lower).

####**4.** Begin chosen action

####**5.** Interrupt [OPTIONAL]

* Check for interrupt events during action execution
* If combatant is being interrupted, go back to Step 1

####**6.** Finish Action

* Finish
* Go back to step 1 to reassess

##APIs

###`CombatEngine`

####Dependencies

`PIXI`

`PIXI.HexGrid`

==================================

Class

Main controller for combat engine. Holds references to all combatants. Implements spatial arrangement using `PIXI.HexGrid` extension of `PIXI`.

####Static Properties

* `battlefieldTypes` - `object` Each property is a different type of battlefield complete with `PIXI.Texture` background textures, a list of every terrain type possibly found on the battlefield, and a function which is invoked for every hex space determining which terrain types are present on it.

#####Enums

Below properties are enums (integers) for different characteristics characters can have

* `MELEE`
* `RANGED`
* `SNIPER`
* `MEDIC`
* `COMMANDER`
* `WEAK`
* `STRONG`
* `SNEAKY`
* `BRUTE`
* `ARMORED`

####Constructors

#####`new CombatEngine([renderer])`

Creates a new instance of `CombatEngine`, optionally with the renderer to be used

Arguments | Type    | Notes
----------|---------|---------
`renderer` | `type:PIXI.SystemRenderer` | **Optional** The renderer to be used as the view for battlefield combat.

####Methods

#####`addCombatant(name, combatant)`

Adds a combatant to the `Combat Engine`, registering it with a unique name. Throws an error if the name is already registered.

Arguments | Type    | Notes
----------|---------|---------
`name` | `string` | The unique name of the new combatant registered on the `CombatEngine`
`combatant` | `type:CombatEngine.Combatant` | An instance of combatant

**Returns** `this` for chaining

==========================================

#####`removeCombatant(name)`

Removes a combatant from the `Combat Engine`.

Arguments | Type    | Notes
----------|---------|---------
`name` | `string` | The unique name of the new combatant registered on the `CombatEngine`

**Returns** `type:CombatEngine.Combatant` The combatant just removed

==========================================

#####`initializeBattleField(type, hexX, hexY, radius[, rotate])`

Initializes a battlefield at the specified dimensions and size. The type determines the kinds of terrain and background image for the battlefield.

Arguments | Type    | Notes
----------|---------|---------
`type` | `string` | Identifier for the type of battlefield to be randomly generated and loaded.
`hexX`      | `number:Integer` | Width in hex spaces
`hexY`      | `number:Integer` | Height in hex spaces
`radius`    | `number:Integer` | Radius of each hex space in pixels
`rotate`    | `boolean` | **Optional** Should the Hex Grid be rotated? This changes the orientation of the hex space. The `hexX` and `hexY` parameters will still be calculated from the user's perspective (i.e. the x and y axes won't be rotated)

**Returns** `number:Integer` Integer identifier unique to this instance of `CombatEngine` which will identify the battlefield just created.

==========================================

#####`addCombatantToBattleField(name, battlefield)`

Arguments | Type    | Notes
----------|---------|---------
`name` | `string` | Unique name of the combatant. Must be a combatant already registered with the `CombatEngine`
`battleField` | `number:Integer` | Unique identifier for the battlefield.

**Returns** `object` - Includes a single method, `add(name)`, which takes the name (a `string`) of another combatant to add to the battlefield. This is meant for chaining.

==========================================

#####`initiateCombat(battleField)`

Initiate the combat event loop for a particular battlefield. The battlefield is rendered in the current renderer (`type:PIXI.SystemRenderer`) associated with the `CombatEngine` instance.

Arguments | Type    | Notes
----------|---------|---------
`battleField` | `number:Integer` | Unique identifier for the battlefield.

**Returns** `function` Interrupt function which pauses all game logic

==========================================

#####`onCombatFinish(fn)`

Set a callback function to be run when combat finishes. This function is invoked when combat finishes for any battlefield.

Arguments | Type    | Notes
----------|---------|---------
`fn` | `function` | Callback invoked when combat finishes. Takes arguments (described below)

**Arguments passed to callback function `fn`**

* `deadCombatants` - `ARRAY:type:Combatant` Array of combatants killed during fight that just ended

**Returns** `this`

==========================================

#####`offCombatFinish([fn])`

Removes either a particular callback or all callback functions registered to fire when combat finishes.

Arguments | Type    | Notes
----------|---------|---------
`fn` | `function` | **Optional** Callback which was previously registered using `onCombatFinish()`

**Returns** `this`

###CombatEngine.Combatant

==========================================

#####`setRenderer(renderer)`

Set the `PIXI.SystemRenderer` that will render the battlefield combats. Replaces any previous renderer set or passed to the constructor.

Arguments | Type    | Notes
----------|---------|---------
`renderer` | `type:PIXI.SystemRenderer` | Renderer (either WebGL or Canvas) which will render the views of the battlefield combats

**Returns** `this`

==========================================

Class

Main combatant class instantiated for each combatant in an instance of `CombatEngine`. Combatants have many variable properties and attributes including physical / skill stats and behavioral algorithms which determine their decision-making in combat.

####Properties

####Methods