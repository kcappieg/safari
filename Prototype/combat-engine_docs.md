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
 * (Target is optional)
 * Move
 * Attack
 * Hide
 * Retreat
 * Defend
 * Do Nothing
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

####Staic Methods

#####`registerBattlefieldType(type, texture, hexterrains[, gridLines])`

Registers a battlefield type using the `data` object.

Arguments | Type    | Notes
----------|---------|---------
`type` | `string` | The name for the battlefield type you are registering.
`texture` | `type:PIXI.Texture` | Texture to be used as the battlefield's background.
`hexTerrains` | `function(hexLite)` | Takes a `HexLite` object (see `PIXI.HexGrid` docs). This function is invoked for every hex space on the grid with the primary goal of adding terrain features to the grid.
`gridLines` | `string` | **Optional** Color string to be used for the grid lines of the battlefield. Defaults to `#000000`

**Returns** `this`

==========================================

####Constructors

#####`new CombatEngine([renderer])`

Creates a new instance of `CombatEngine`, optionally with the renderer to be used

Arguments | Type    | Notes
----------|---------|---------
`renderer` | `type:PIXI.SystemRenderer` | **Optional** The renderer to be used as the view for battlefield combat.

####Methods

#####`addCombatant(name, combatant)`

Adds a combatant to the `CombatEngine`, registering it with a unique name. Throws an error if the name is already registered.

Arguments | Type    | Notes
----------|---------|---------
`name` | `string` | The unique name of the new combatant registered on the `CombatEngine`
`combatant` | `type:CombatEngine.Combatant` | An instance of combatant

**Returns** `this` for chaining

==========================================

#####`removeCombatant(name)`

Removes a combatant from the `CombatEngine`.

Arguments | Type    | Notes
----------|---------|---------
`name` | `string` | The unique name of the new combatant registered on the `CombatEngine`

**Returns** `type:CombatEngine.Combatant` The combatant just removed

==========================================

#####`initializeBattlefield(type, hexX, hexY, radius[, rotate])`

Initializes a battlefield at the specified dimensions and size. The type determines the kinds of terrain and background image for the battlefield.

Arguments | Type    | Notes
----------|---------|---------
`type` | `string` | Identifier for the type of battlefield to be randomly generated and loaded.
`hexX`      | `number:Integer` | Width in hex spaces
`hexY`      | `number:Integer` | Height in hex spaces
`radius`    | `number:Integer` | Radius of each hex space in pixels
`rotate`    | `boolean` | **Optional** Should the Hex Grid be rotated? This changes the orientation of the hex space. The `hexX` and `hexY` parameters will still be calculated from the user's perspective (i.e. the x and y axes won't be rotated)

**Returns** `symbol` Unique identifier for the battlefield just created.

==========================================

#####`addCombatantToBattlefield(name, battlefield, hexX, hexY)`

Add a registered `Combatant` to the battlefield.

Arguments | Type    | Notes
----------|---------|---------
`name` | `string` | Unique name of the combatant. Must be a combatant already registered with the `CombatEngine`
`battleField` | `symbol` | Unique identifier for the battlefield.
`hexX` | `number:Integer` | The x-coordinate in hex spaces for the combatant to start on
`hexY` | `number:Integer` | The y-coordinate in hex spaces for the combatant to start on

**Returns** `this` for chaining.

**Note** A particular combatant can only be added to one battlefield at a time. If the combatant is already a member of another battlefield, this method will throw an error.

==========================================

#####`removeCombatantFromBattlefield(name, battlefield)`

Remove a `Combatant` from a battlefield. If `Combatant` is not on this battlefield, does nothing.

Arguments | Type    | Notes
----------|---------|---------
`name` | `string` | Unique name of the combatant. Must be a combatant already added to the battlefield identified with `battlefield`
`battleField` | `symbol` | Unique identifier for the battlefield.

**Returns** `this` for chaining.

==========================================

#####`clearBattlefield(battlefield)`

Clear all `Combatant`s from a battlefield.

Arguments | Type    | Notes
----------|---------|---------
`battleField` | `symbol` | Unique identifier for the battlefield.

**Returns** `ARRAY[string]` Array of the names of all combatants removed from the battlefield

==========================================

#####`deleteBattlefield(battlefield)`

Clear all `Combatant`s from a battlefield, then deletes it from the register.

Arguments | Type    | Notes
----------|---------|---------
`battleField` | `symbol` | Unique identifier for the battlefield.

**Returns** `ARRAY[string]` Array of the names of all combatants removed from the battlefield

==========================================

#####`initiateCombat(battleField)`

Initiate the combat event loop for a particular battlefield. The battlefield is rendered in the current renderer (`type:PIXI.SystemRenderer`) associated with the `CombatEngine` instance.

Arguments | Type    | Notes
----------|---------|---------
`battleField` | `symbol` | Unique identifier for the battlefield.

**Returns** `function` Play/pause function: when invoked, either pauses the game logic or resumes it depending on its previous state.

==========================================

#####`onCombatFinish(battlefield, fn)`

Set a callback function to be run when combat finishes. This function is invoked when combat finishes for a particluar battlefield.

Arguments | Type    | Notes
----------|---------|---------
`battleField` | `symbol` | Unique identifier for the battlefield.
`fn` | `function` | Callback invoked when combat finishes. Takes arguments (described below)

**Arguments passed to callback function `fn`**

* `deadCombatants` - `ARRAY:type:Combatant` Array of combatants killed during fight that just ended

**Returns** `this`

==========================================

#####`offCombatFinish(battlefield[, fn])`

Removes either a particular callback or all callback functions registered to fire when combat finishes for a particluar battlefield.

Arguments | Type    | Notes
----------|---------|---------
`battleField` | `symbol` | Unique identifier for the battlefield.
`fn` | `function` | **Optional** Callback which was previously registered using `onCombatFinish()`

**Returns** `this`

==========================================

#####`setRenderer(renderer)`

Set the `PIXI.SystemRenderer` that will render the battlefield combats. Replaces any previous renderer set or passed to the constructor.

Arguments | Type    | Notes
----------|---------|---------
`renderer` | `type:PIXI.SystemRenderer` | Renderer (either WebGL or Canvas) which will render the views of the battlefield combats

**Returns** `this`

==========================================

###CombatEngine.Combatant

Class

Main combatant class instantiated for each combatant in an instance of `CombatEngine`. Combatants have many variable properties and attributes including physical / skill stats and behavioral algorithms which determine their decision-making in combat.

####Static Properties

#####Enums

Below properties are enums (`symbol`) for different characteristics characters can have

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
* `NOTORIOUS`

Below enums are static `symbol` objects used for gear slots

* `HEAD`
* `ARMOR`
* `WEAPON1`
* `WEAPON2`
* `FEET`

####Static Methods

#####`combatantBuilder()`

Initializes combatant builder object used to construct a `Combatant` object

Arguments | Type    | Notes
----------|---------|---------

**Returns** `object` Builder object, described below

######Builder Object Methods

* `build()` - Builds the `Combatant` object and returns it
* `hp(total)` - `total`: `number:Integer`; sets max and initial HP value
* `

####Constructors

None. Uses Builder Pattern (see `combatantBuilder` above)

####Properties

#####`inCombat`

`number:Integer` **Read-only** If this combatant is registered on a battlefield already, this value will be `-1`. Otherwise, it will be `>=0`

----------------------------

#####`sprite`

`type:PIXI.DisplayContainer` **Read-only** The display container object (usually a sprite) associated with this combatant.

----------------------------

#####`maxHP`

`number:Integer` **Read-only** Maximum HP; *Default: `1`*

----------------------------

#####`currentHP`

`number:Integer` Current HP; *Default: value of `maxHP`*

----------------------------

#####`strength`

`number:Integer` Strength score; *Default: `5`*

----------------------------

#####`endurance`

`number:Integer` Endurance score; *Default: `5`*

----------------------------

#####`marksmanship`

`number:Integer` Marksmanship score; *Default: `5`*

----------------------------

#####`influence`

`number:Integer` Influence score; *Default: `5`*

----------------------------

#####`willfulness`

`number:Integer` Willfulness score; *Default: `5`*

----------------------------

#####`perceptiveness`

`number:Integer` Perceptiveness score; *Default: `5`*

----------------------------

#####`sneakiness`

`number:Integer` Sneakiness score; *Default: `5`*

----------------------------

#####`speed`

`number:Integer` Speed. Calculation is relative to pixels / second on a full scale map (scale = 1); *Default: `100`*

----------------------------

#####`defense`

`number:Integer` Defense score; *Default: `10`*

----------------------------

#####`backpackCapacity`

`number:Integer` Amount of items this character can carry.

----------------------------

#####`nextAction`

**Note**: Private property, written here so I won't forget it. This should store the next action the character intends to do. For instance, if a melee character decides to attack a foe several spaces away, their in-progress action would be to move, and this property would store the action they intend to carry out when they arrive.

----------------------------

#####`team`

`symbol` The team the combatant belongs to. All combatants of the same team must have the same `symbol` instance.

----------------------------

####Methods

#####`registerMessage(message)`

**Note** Private method.

Registers a message with the combatant

Arguments | Type    | Notes
----------|---------|---------
`message` | `type:Message` | Message object is internal class that indicates the sender of the message and the contents of the message, probably a function (TBD!)

**Returns** void

=====================================

#####`sendMessage(fn, context, recipient)`

Send a message to a recipient.

**Note**: Message transfer protocol still TBD. Below is a first-pass.

Arguments | Type    | Notes
----------|---------|---------
`fn` | `function` | Function to be executed at the time specified by `context`. Generally, an information function which affects a character's likelihood to know something or detect someone, a filtering function (to filter the battlefield of potential targets) or function that returns a course of action.

**Returns** void

=====================================

#####`addToBackback(item)`

Add an item to combatant's backpack.

Arguments | Type    | Notes
----------|---------|---------
`item` | `object` | Object of any type. Any object counts as 1 unit in the backpack

**Returns** `boolean` - If the backpack is full, returns `false` and does not add the item. Otherwise returns `true`

=====================================

#####`removeFromBackback(item)`

Add an item to remove from combatant's backpack.

Arguments | Type    | Notes
----------|---------|---------
`item` | `object` | Object of any type. Any object counts as 1 unit in the backpack

**Returns** `boolean` - If the item is in the backpack, returns `true`. Otherwise returns `false`.

=====================================

#####`getBackbackContents()`

Get all contents of the backpack, but does not remove anything.

Arguments | Type    | Notes
----------|---------|---------

**Returns** `ARRAY[object]` Array of items this combatant is carrying.

=====================================

#####`getGear(slot)`

Get the gear object from the slot indicated by `slot`

Arguments | Type    | Notes
----------|---------|---------
`slot` | `symbol` | Static enum defined on this class which indicates a gear slot

**Returns** `object` The gear object occupying that slot.

=====================================

#####`setGear(slot[, item])`

Set `item` into gear `slot`. If `item` is undefined, removes whatever was equipped on that slot and returns it.

Arguments | Type    | Notes
----------|---------|---------
`slot` | `symbol` | Static enum defined on this class which indicates a gear slot
`item` | `object` | **Optional** Object of the piece of gear you are setting

**Returns** `object` The gear object that previously occupied that slot. `null` if none.

=====================================

#####`battlefieldSurveyStream()`

Initialize a stream-like interface on which you can set behavioral functions which filter enemies from an array,

Arguments | Type    | Notes
----------|---------|---------

**Returns** `object` Object has 2 methods, `next()` and `finally()`

######`next(fn)`

Takes and sets a function to be called on the chain. The function takes an array (`enemies`) and filters it. Must call either `next()` or `resolve()` with the filtered array as an argument (i.e. `next(enemies)`) in order to continue or resolve the chain.

Arguments | Type    | Notes
----------|---------|---------
`fn` | `function` | Function with the below argument signature

* `enemies`: `ARRAY[type:Combatant]` - Array of possible targets
* `next`: `function` - Function which takes the filtered version of the `enemies` array and calls the next filtering function
* `resolve`: `function` - Function which takes the filtered version of the `enemies` array and calls the final function in the chain, skipping any others not yet called

**Returns** `this`

######`finally(fn)`

Takes and sets a function to be called as the last filtering method in the chain. This should reduce the array to a length of either 1 or 0. Function takes array (`enemies`) and filters it. Must return the filtered array.

Arguments | Type    | Notes
----------|---------|---------
`fn` | `function` | Function with the below argument signature

* `enemies`: `ARRAY[type:Combatant]` - Array of possible targets

**Returns** void

=====================================

#####`courseOfActionStream()`

Initialize a stream-like interface on which you can set behavioral functions which determines the course of action the combatant will take.

Arguments | Type    | Notes
----------|---------|---------

**Returns** `object` Object has 2 methods, `next()` and `finally()`

######`next(fn)`

Takes and sets a function to be called on the chain. Arguments and actions of the function TBD. Must call either `next()` or `resolve()` in order to continue or resolve the chain.

Arguments | Type    | Notes
----------|---------|---------
`fn` | `function` | Function with the below argument signature

* `TBD`: 
* `next`: `function` - Function which calls the next behavioral function
* `resolve`: `function` - Function which calls the final function in the chain, skipping any others not yet called

**Returns** `this`

######`finally(fn)`

Takes and sets a function to be called as the last behavioral function in the chain. This function should somehow return the course of action to be taken (TBD)

Arguments | Type    | Notes
----------|---------|---------
`fn` | `function` | Function with the below argument signature

* `TBD`:

**Returns** void

=====================================

#####`act(action, data)`

Take a course of action in the context of `data`

Arguments | Type    | Notes
----------|---------|---------
`action` | `symbol` | The action the character intends to take
`data` | `object` | Object containing the contextual data necessary to execute the action. Described below

**Returns** `function` Interrupt function. Calling it interrupts the action and forces the character to begin again at the beginning of the assessment cycle.

=====================================