#Documentation for Combat Engine - `CombatEngine.Action` Class

##Module

`CombatEngine`

##APIs

###`CombatEngine.Action`

Class

Base 'abstract' class that represents different actions a combatant can take during combat. Each action type derived from this base classes implements the logic and functionality for the action it represents. Each action is also represented by a `symbol` enum delcared as static variables on `CombatEngine.Action`.

Since Javascript does not follow the Classical Inheritance model, this is not a truly abstract class (it can be instantiated), but it is not useful in the `CombatEngine` model without instead instantiating one of its child classes.

This class defines the base behaviors that every action needs to have, but leaves the specifics of each individual action to its subclasses.

####Static Properties

#####Enums

Below properties are enums (`symbol`) for different actions a character can take

* `AID`
* `ATTACK`
* `DEFEND`
* `MOVE`
* `RETREAT`
* `WAIT`

####Static Methods

#####`actionBuilder(data)`

Initializes action builder object used to construct an `Action` object. Never returns an object of type `CombatEngine.Action`, but instead returns a subclass of `CombatEngine.Action` depending on what's passed to the builder.

Arguments | Type    | Notes
----------|---------|---------
`data` | `object` | Relevant data object as a reference for the action builder. This property is meant strictly as a reference when working with the builder and is not used in the build process at all.

**Returns** `object` Builder object, described below

######Builder Object Methods

* `build()` - `function`: Builds the `Action` object based on the actionChain array and returns it
* `prependAction(type, data)` = `function`: Takes arguments described below and prepends entry to the action chain
  * `type`: `symbol` - Represents the action being added to the action chain.
  * `data`: `object` - The data object that the constructor of the action represented by `type` expects.
* `appendAction(type, data)` = `function`: Takes arguments described below and appends entry to the action chain
  * `type`: `symbol` - Represents the action being added to the action chain.
  * `data`: `object` - The data object that the constructor of the action represented by `type` expects.
* `data` - `object`: Reference to `data` as passed to method. This property is mutable, as it is meant to be a reference when building the action object
* `actionChain` - `ARRAY[type:object]` Array of objects which will build the final action object. Not recommended to manipulate directly. Instead use `prependAction` and `appendAction` methods.
* `ready` - `boolean` Should be set to `true` when `Action` is ready to be built

####Constructors

#####`new CombatEngine.Action(nextAction)`

Constructor for 'abstract' class exists so that sub-classes can call it and initialize base behavior.

Arguments | Type    | Notes
----------|---------|---------
`nextAction` | `type:CombatEngine.Action` | The next action that should be performed directly after this action is completed.

####Properties

#####`nextAction`

`type:CombatEngine.Action` **Read-Only** Next action to be performed after this action is completed.

----------------------------

#####`inProgress`

`boolean` **Read-Only** Is this action currently in progress?

----------------------------

#####`interrupted`

`boolean` **Read-Only** Has this action been interrupted?

----------------------------

####Methods

#####`interruptAction()`

Sets the action to be interrupted by marking the `interrupted` property

Arguments | Type | Notes
--------- | ---- | -----
NONE

**Returns** void

=====================================

#####`end()`

Marks `inProgress` as `false` and, if there is another action in the action chain, starts it.

Arguments | Type    | Notes
----------|---------|---------
NONE

**Returns** void

=====================================

#####`start(actor, hgm)`

Begins execution of the action. In this abstract class, merely starts a timer which records the elapsed total time the action has been in execution.

Arguments | Type    | Notes
----------|---------|---------
`actor` | `type:CombatEngine.Combatant` | The combatant who is performing the action
`hgm` | `type:HexGridManager` | The `HexGridManager` for the battlefield on which the combatant is.

**Returns** void

=====================================

#####`elapsed()`

Returns the time, in milliseconds, that this action has been executing *in real time*.

**Important Notice** If the user navigates away from the browser and animationFrames are not called for, the return value will still show the *real time* that has passed since execution began, not *game time*.

Arguments | Type    | Notes
----------|---------|---------
NONE

**Returns** `number:Integer` The elapsed time in milliseconds since execution of the action began

=====================================

#Describe Sub-Types here!