#Safari Prototype

Create a prototype for the Safari main combat gameplay.

##Goals of Prototype:

* Work out necessary data structures
* Discover pitfalls or challenges of structure
* Get an idea down on "paper" from which to brainstorm and progress
* Provide a concrete starting point that is a solid project to work on

##Steps to accomplish
*...and estimated time to completion*

###Phase 1: Prep

1. Create a server in Nodejs from which to run the game locally - 30min - 1hr
2. Investigate Pixi.js and its API. Become familiar enough to get started - 30min - 1hr
3. Code a Hexagonal gamespace grid. This grid class should implement the API described below - 5 - 10hr

###Phase 2: Game Characters / Combat Mechanics

1. Find avatar images for use as character standins - 30min
2. Map out the exact mechanics for proto-combat - 1 - 2hr
3. From the combat needs, write an API for a character class - 2 - 3hr
4. Implement the API for the character class, and design 10 test charcters: 5 for each side - 5 - 6hr

###Phase 3: Event Loop

1. Map out what actions take place when in the event loop - 1 - 2hr
2. Implement the event loop - 4 - 8hr
3. Refine event loop / combat mechanics. Correct to make it engaging / interesting - 4hr
4. Debug / testing buffer - 10hr


##APIs

###`PIXI.HexGrid`

Class. Extends `PIXI.Container`.

The `HexGrid` class takes a set of dimensions in its constructor and draws out a Hexagonal grid using those dimensions. This class is meant to be used as a container for other sprites, which can occupy grid spaces.

The grid lines are simply a sprite of the PIXI.Sprite class that is always added to the container first, meaning its `index=0`. There's no reason why you can't alter this to suit your needs.

####Constructors

#####`new PIXI.HexGrid(hexX, hexY, radius[, gridColor][, rotate])`

Takes the dimensions of Hex squares, the radius, and optional grid color and whether it should be rotated.

Arguments | Type    | Notes
----------|---------|---------
hexX      | `number:Integer` | Width in hex spaces
hexY      | `number:Integer` | Height in hex spaces
radius    | `number:Integer` | Radius of each hex space in pixels
gridColor | `string` | **Optional** `<color>` string as defined by CSS specifications, used as the pen color for stroking the grid lines
rotate    | `boolean` | **Optional** Should the Hex Grid be rotated? This changes the orientation of the hex space. The `hexX` and `hexY` parameters will still be calculated from the user's perspective (i.e. the x and y axes won't be rotated)

####Properties

#####`gridSprite`
`object` **Read-only** The sprite object of the background grid. This property is here in case the sprite needs to be accessed directly.

------------------------------------------------------

#####`hexRadius`
`number:Integer` **Read-only** The radius of each hex space as initialized in the constructor.

------------------------------------------------------

#####`dimensions`
`object` **Read-only** The dimensions of the grid spaces as an object with two properties: `{x, y}` where `x` is the amount of horizontal spaces in a row and `y` is the amount of rows.

------------------------------------------------------

####Methods

#####`moveChildTo(sprite, x, y[, time])`
Move a child to the grid space specified by the `x` and `y` grid coordinates. **Note:** The `x` and `y` coordinates refer to the hex grid, not the pixel coordinates within the container

Arguments | Type    | Notes
----------|---------|---------
sprite    | `object:PIXI.Sprite` | PIXI.Sprite object which is a direct child of the container. If the passed sprite is not a child of the container, this method throws an Error
x      | `number:Integer` | Hex grid x coordinate
y      | `number:Integer` | Hex grid y coordinate
time   | `number:Integer` | **Optional** Time in ms it should take for the sprite to go from its current position to the new position

*Returns* `HexGrid` object

==========================================

#####`coordinatesAt(x, y)`
Getter. Returns the pixel coordinates that represent the center of the grid space (x, y)

Arguments | Type    | Notes
----------|---------|---------
x         | `number:Integer` | Hex Grid x Coordinate
y         | `number:Integer` | Hex Grid y Coordinate

*Returns* `object` with `x` and `y` properties representing the coordinates of the sprite where the center of the indicated grid is located

==========================================

#####`distanceBetween(hexSpace1, hexSpace2)`
Get the distance in hex space units between 2 spaces

Arguments | Type    | Notes
----------|---------|---------
hexSpace1 | `object`| An object with `x` and `y` properties that indicate a hex space's position on a grid. This object could be a `HexSpace` instance, or simply an object with only those two properties
hexSpace2 | `object`| **Same as above**

*Returns* `number:Integer` of distance between 2 spaces in hex space units

==========================================

###`HexGrid.HexSpace`

Partially mutable class. Coordinates cannot be changed, but other attributes such as occupants or potentially terrain features / cover may be.

####Properties

#####`location`
`ARRAY:INTEGER` **Read-Only** The location of the object as an array of coordinates: [x, y]

------------------------------------

#####`maxOccupancy`
`INTEGER` **Read-Only** The maximum number of occupants that can fit in the `HexSpace`. Calculated based on terrain, and so may change if terrain changes.

####Methods

#####`getOccupant()`
Getter. Returns the occupant of the space if any

Arguments | Type    | Notes
----------|---------|---------

*Returns* `Combatant` object if the space is occupied, `false` if it is unoccupied

==========================================

#####`occupy(combatant)`
Setter. Occupies the `HexSpace` with a `Combatant`, and also vacates the previous `HexSpace` of the combatant

Arguments | Type    | Notes
----------|---------|---------
combatant | Combatant| A combatant moving into the hex space

*Returns* `BOOLEAN` Successful?

==========================================

#####`terrain([newTerrainFeature1, newTerrainFeature2, ...])`
Getter and Setter. Either returns a list of terrain features or adds the specified terrain features in the argument array.

Arguments | Type    | Notes
----------|---------|---------
newTerrainFeature#... | TerrainFeature | **Optional** A registered terrain feature

*Returns* If setting terrain features, returns the `HexSpace` object for chaining. If getting, returns an `ARRAY:Terrain` of the terrain features on this `HexSpace`

==========================================

#####`terrainEffects()`
Calculates any modifiers to a combatant's stats as a result of occupying the terrain.

Arguments | Type    | Notes
----------|---------|---------

*Returns* Object **STRUCTURE OF OBJECT TBD** which enumerates the bonuses to each combatant stat

==========================================

#####`draw()`
TBD - I'm waiting until I understand Pixie.js before I implement anything

Arguments | Type    | Notes
----------|---------|---------

*Returns* TBD

==========================================

###Constants

####`HexGrid.Terrain`
The terrain object contains terrain features and their attributes. The features themselves are immutable, but they can be overwritten with whole new features that use the same name but display different properties. (This is to avoid accidental overwriting of a feature, but to allow flexibility). This object also includes a helper method `createFeature()` which allows you to register new terrain features on-the-fly if needed. There will be a few standard features like rocks, trees, foxholes, and bushes.

###Must return to this part of the API to finish. Could be part of Phase 2 Item 2: mapping out mechanics of combat