#Documentation for Combat Engine - `CombatEngine.Combatant` Class

##Module

`CombatEngine`

##APIs

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

Below enums are static `symbol` stream types

* `PREASSESSMESSAGE`
* `ASSESSMESSAGE`
* `ASSESS`
* `ACTIONMESSAGE`
* `ACTION`

####Static Methods

#####`combatantBuilder()`

Initializes combatant builder object used to construct a `Combatant` object

Arguments | Type    | Notes
----------|---------|---------

**Returns** `object` Builder object, described below

######Builder Object Methods

* `build()` - Builds the `Combatant` object and returns it
* `defense(score)` - `score`: `number:Integer`; sets defense Score
* `endurance(score)` - `score`: `number:Integer`; sets endurance Score
* `hp(total)` - `total`: `number:Integer`; sets max and initial HP value
* `influence(score)` - `score`: `number:Integer`; sets influence Score
* `marksmanship(score)` - `score`: `number:Integer`; sets marksmanship Score
* `perceptiveness(score)` - `score`: `number:Integer`; sets perceptiveness Score
* `sneakiness(score)` - `score`: `number:Integer`; sets sneakiness Score
* `speed(s)` - `s`: `number:Integer`; sets speed
* `strength(score)` - `score`: `number:Integer`; sets strength Score
* `willfulness(score)` - `score`: `number:Integer`; sets willfulness Score

####Constructors

None. Uses Builder Pattern (see `combatantBuilder` above)

####Properties

#####`inCombat`

`boolean` **Read-only** Is this combatant registered on a battlefield already?

----------------------------

#####`target`

`ARRAY[type:CombatEngine.Combatant OR type:HexLite]` **Read-only** The current target or targets for the Combatant. Can be either another `Combatant` or a `HexLite` object representing a location.

----------------------------

#####`sprite`

`type:PIXI.DisplayContainer` **Read-only** The display container object (usually a sprite) associated with this combatant.

----------------------------

#####`detectionModifiers`

`type:Map` **Read-only** The `Map` object whose keys should be `string`s of the names of other `Combatants`, and whose values should be integer modifiers. This `Map` is cleared after every assessment cycle.

----------------------------

#####`influenceModifiers`

`type:Map` **Read-only** The `Map` object whose keys should be `string`s of the names of other `Combatants`, and whose values should be integer modifiers.

----------------------------

#####`maxHP`

`number:Integer` Maximum HP; *Default: `1`*

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

#####`team`

`symbol` The team the combatant belongs to. All combatants of the same team must have the same `symbol` instance.

----------------------------

#####`name`

`string` **Read-Only** The name of the combatant that was registered with the CombatEngine. The instance of `CombatEngine` internally sets this to prevent overriding the name of a combatant mistakenly.

----------------------------

####Methods

#####`inAction()`

Determines whether or not the combatant is currently engaged in an action.

Arguments | Type | Notes
--------- | ---- | -----
NONE

**Returns** `boolean`: Is an action currently in progress?

#####`registerMessage(message)`

**Note** Private method. Exact API TBD

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
`fn` | `function` | Function to be executed at the time specified by `context`. Generally, an information function which affects a character's likelihood to know something or detect someone, a filtering function (to filter the battlefield of potential targets), an interruption that the character can either address or ignore, or function that returns a course of action.

**Returns** void

######Implementation Notes

* PreAssess messages are passed 2 objects: `detectionModifiers` and `influenceModifiers`. Each object is expected to have enumerable properties whose names are the names of other combatants, and whose values are either positive or negative integers indicating modifiers.


=====================================

#####`messageWrapperGenerator(sender, messageFn)`

Generates a function to be placed in a message chain which first checks to see whether or not the sender's influence gets past the recipient's will. If not, the message function is not executed (it is ignored).

Generally only called internally.

Arguments | Type    | Notes
----------|---------|---------
`sender` | `type:CombatEngine.Combatant` | The sender of the message
`messageFn` | `function` | Function to be executed as a message. This could be in either the assess message chain or the action message chain, but shouldn't be in the pre-assess message chain, as that message chain is meant primarily for buffs and applying modifiers outside the influence mechanic restrictions.

**Returns** void

######Implementation Notes

* PreAssess messages are passed 2 objects: `detectionModifiers` and `influenceModifiers`. Each object is expected to have enumerable properties whose names are the names of other combatants, and whose values are either positive or negative integers indicating modifiers.

=====================================

#####`addToBackpack(item)`

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

#####`setAnimation(actionType, animation[, endAnimation])`

Sets an animation for a particular action type. When that action is performed, the passed animation(s) will be executed.

Each invocation of this method will clear the previous animation function(s).

Arguments | Type    | Notes
----------|---------|---------
`actionType` | `symbol` | Enum which represents the action type
`animation` | `function` | Animation for the given action. Invoked with the below-described arguments
`endAnimation` | `function` | **Optional** Final animation frame for the action. Invoked with the below-described arguments.

######Arguments to `animation()`

* `tickerLite` - `object` with the following properties
 * `deltaTime` - `number:floating point` as the `deltaTime` property from the `PIXI.Ticker` object
 * `elapsedMS` - `number:floating point` as the `elapsedMS` property from the `PIXI.Ticker`
* `citizen` - `type:CitizenLite` object of the citizen being moved
* `deregisterAnimation` - `function` deregisters the animation function if the animation is complete

######Arguments to `endAnimation()`

* `tickerLite` - `object` with the following properties
 * `deltaTime` - `number:floating point` as the `deltaTime` property from the `PIXI.Ticker` object
 * `elapsedMS` - `number:floating point` as the `elapsedMS` property from the `PIXI.Ticker`
* `citizen` - `type:CitizenLite` object of the citizen being moved

**Returns** void

=====================================

#####`getAnimation(actionType, internal)`

Gets the animations for a given action type

**Note** Private method

Arguments | Type    | Notes
----------|---------|---------
`actionType` | `symbol` | Enum which represents the action type
`internal` | `symbol` | Symbol private to the namespace which enforces the privacy of the method

**Returns** `object`: Two properties: `animation` and `endAnimation` representing the last animation set registered on the action

=====================================

#####`setAssessChain()`

Initialize a chain of responsibility on which you can set behavioral functions which filter enemies from an array and chooses the target for the Combatant

Arguments | Type    | Notes
----------|---------|---------

**Returns** `object` Object has 2 methods, `then()` and `finally()`

######`then(fn)`

Takes and sets a function to be called on the chain. The function takes an array (`enemies`) and filters it. Must call either `next()` or `resolve()` with the filtered array as an argument (i.e. `next(enemies)`) in order to continue or resolve the chain.

**NOTE** If the decision-making chain should result in the combatant moving, not attacking, both the movement and destination should be set in the action chain, not the here in the assess chain. The assess chain is solely about which enemies are available to target and preferred as targets.

Arguments | Type    | Notes
----------|---------|---------
`fn` | `function` | Function with the below argument signature. It is called in the context of the combatant

* `next`: `function` - Function which takes the filtered version of the `enemies` array and calls the next filtering function
* `resolve`: `function` - Function which takes the filtered version of the `enemies` array and calls the final function in the chain, skipping any others not yet called
* `enemies`: `ARRAY[type:Combatant]` - Array of possible targets

**Returns** `this`

######`finally(fn)`

Takes and sets a function to be called as the last filtering method in the chain. This should reduce the array to the number of targets the `Combatant` plans to attack (possibly more than one if area attack). Function takes array (`enemies`) and filters it. Must return the filtered array.

Arguments | Type    | Notes
----------|---------|---------
`fn` | `function` | Function with the below argument signature

* `enemies`: `ARRAY[type:Combatant]` - Array of possible targets

**Returns** void

=====================================

#####`setActionChain()`

Initialize a chain of responsibility interface on which you can set behavioral functions which determines the course of action the combatant will take.

Arguments | Type    | Notes
----------|---------|---------

**Returns** `object` Object has 2 methods, `next()` and `finally()`

######`then(fn)`

Takes and sets a function to be called on the chain. The function an `actionBuilder` object and must pass that `actionBuilder` object through by calling either `then()` or `resolve()` with the `actionBuilder` object in order to continue or resolve the chain.

Arguments | Type    | Notes
----------|---------|---------
`fn` | `function` | Function with the below argument signature

* `next`: `function` - Function which calls the next behavioral function
* `resolve`: `function` - Function which calls the final function in the chain, skipping any others not yet called
* `actionBuilder`: `object` - Action builder object. Prepend or append actions.

**Returns** `this`

######`finally(fn)`

Takes and sets a function to be called as the last behavioral function in the chain. This function should return the course of action to be taken, either by passing through the one passed to it and/or returning a default action.

Arguments | Type    | Notes
----------|---------|---------
`fn` | `function` | Function with the below argument signature

* `actionBuilder`: `object` - Action builder object. Prepend or append actions.

**Returns** void

=====================================

#####`loop(hexGridManager)`

Loops through a characters assessment and action. If the character is already engaged in an action, there may be no result.

Will check on any interrupts registered (including messages).

Arguments | Type    | Notes
----------|---------|---------
`hexGridManager` | `type:HexGridManager` | The HexGridManager object for the battlefield to be assessed. It is expected that this Combatant has been added to the HexGridManager

**Returns** void

=====================================

#####`assess(hexGridManager)`

Private method. Assess a battlefield

Arguments | Type    | Notes
----------|---------|---------
`hexGridManager` | `type:HexGridManager` | The HexGridManager object for the battlefield to be assessed. It is expected that this Combatant has been added to the HexGridManager

**Returns** `ARRAY:[type:CombatEngine.Combatant]` An array of one or 0 `Combatant` objects indicating either the target chosen or that no target was chosen.

=====================================

#####`detectEnemies(hexGridManager)`

Discovers the enemy combatants that this combatant can detect. Algorithm is based on any modifiers previously applied and distance from the target.

**Note:** Internal method, as the client does not have access to the `hgm` (`HexGridManager`)

Arguments | Type    | Notes
----------|---------|---------
`hexGridManager` | `type:HexGridManager` | The HexGridManager object for the battlefield to be assessed. It is expected that this Combatant has been added to the HexGridManager

**Returns** `ARRAY:[type:CombatEngine.Combatant]` An array of the combatants that a combatant can detect and so choose from as a target.

######Implementation Notes
The calculated modifier is directly proportional to the distance in pixels between the combatants and indirectly proportional to the radii in pixels of the HexSpaces on the grid

=====================================

#####`chainRouter(chainType[, dataArray])`

Executes a chain of responsibility for one of the different chain types (ie messages or assessments), optionally passing a data array on which to act depending on the chain. Returns the resulting data array, or undefined if none.

This method should only be invoked privately.

Arguments | Type    | Notes
----------|---------|---------
`chainType` | `symbol` | The Symbol enum delcared on the `CombatEngine.Combatant` class which will identify the chain to be used.
`dataArray` | `ARRAY[object]` | The data array on which the chain should act.

**Returns** `ARRAY:[object]` / `undefined` - Either the data array that was acted upon by the chain or `undefined` if no `dataArray` was passed.

=====================================

#####`assess(hexGridManager)`

**Private Method** Client does not have access to `HexGridManager`

Assess the battlefield for enemies.

Arguments | Type    | Notes
----------|---------|---------
`hexGridManager` | `type:HexGridManager` | The battlefield's `HexGridManager`

**Returns** `ARRAY[type:CombatEngine.Combatant]` Array of enemy combatants that the combatant can detect and would want to target. Criteria are determined by the assess chain initialized with this combatant.

=====================================

#####`chooseAction(targets, hexGridManager)`

**Private Method** Client does not have access to `HexGridManager`

Choose an action based on the targets passed

Arguments | Type    | Notes
----------|---------|---------
`targets` | `Array[type:CombatEngine.Combatant]` | Object containing the contextual data necessary to execute the action. Described below
`hexGridManager` | `type:HexGridManager` | The battlefield's `HexGridManager`

**Returns** `type:CombatEngine.Action` One of the `Action` sub-classes determining what action the combatant will engage.

=====================================

#####`beginAction(action)`

Take a course of action in the context of `data`

Arguments | Type    | Notes
----------|---------|---------
`action` | `symbol` | The action the character intends to take
`data` | `object` | Object containing the contextual data necessary to execute the action. Described below

**Returns** `function` Interrupt function. Calling it interrupts the action and forces the character to begin again at the beginning of the assessment cycle.

=====================================