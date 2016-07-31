#Documentation for Combat Engine - `CombatEngine` Class

##Module

`CombatEngine`

##APIs

###`CombatEngine`

####Dependencies

`PIXI`

`PIXI.HexGrid`

==================================

Class

Main controller for combat engine. Holds references to all combatants. Implements spatial arrangement using `PIXI.HexGrid` extension of `PIXI`.

####Static Methods

#####`registerBattlefieldType(type[, texture][, hexTerrains][, gridLines])`

Registers a battlefield type object.

Arguments | Type    | Notes
----------|---------|---------
`type` | `string` | The name for the battlefield type you are registering.
`texture` | `type:PIXI.Texture` | **Optional** Texture to be used as the battlefield's background.
`hexTerrains` | `function` | **Optional** Takes a `HexLite` object (see `PIXI.HexGrid` docs). This function is invoked for every hex space on the grid with the primary goal of adding terrain features to the grid. It should return an array of strings, each of which is the name of a previously-registered terrain type (registered with the `PIXI.HexGrid.Terrain` object in `PIXI.HexGrid` docs)
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
`type` | `string` | Identifier for the type of battlefield to be loaded. If the type of battlefield registered was passed a `hexTerrains` function, calls that function for each hex grid space to generate the terrain.
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

**Returns** `ARRAY[type:Combatant]` Array of the combatants removed from the battlefield

==========================================

#####`deleteBattlefield(battlefield)`

Clear all `Combatant`s from a battlefield, then deletes it from the register.

Arguments | Type    | Notes
----------|---------|---------
`battleField` | `symbol` | Unique identifier for the battlefield.

**Returns** `ARRAY[type:Combatant]` Array of the combatants removed from the battlefield

==========================================

#####`initiateCombat(battleField)`

Initiate the combat event loop for a particular battlefield. The battlefield is rendered in the current renderer (`type:PIXI.SystemRenderer`) associated with the `CombatEngine` instance.

**Note** Once combat is initiated, it will continue to use the renderer that it was originally started with whether or not the `CombatEngine`'s renderer is changed.

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

#####`getBattlefieldHexGridManager(battlefield)`

Get the `HexGridManager` for a given battlefield.

**Caution** This method is here to allow access to things like the `grid` property, or other uses of the object. If you add citizens or make other changes without using the `CombatEngine` interface, the `CombatEngine` may not behave as you expect it to.

Arguments | Type    | Notes
----------|---------|---------
`battlefield` | `symbol` | The unique identifier of the battlefield you are accessing.

**Returns** `type:HexGridManager` Controller object for the hexgrid this battlefield is based on. See `HexGridManager` docs for details

==========================================