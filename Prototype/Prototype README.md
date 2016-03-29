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
These APIs could/should be attached to PIXI global object if they're using pixi in the calls.

###`HexGrid`

Immutable class. Represents the full hex-grid gamespace. Distance from one space to another is defined in the same way D+D4E defines it: spaces (squares). Depends on the `HexSpace` class defined below.

####Properties

#####`size`
`INTEGER` **Read-only** The amount of spaces represented in the grid.

------------------------------------------------------

#####`dimensions`
`ARRAY:INTEGER` **Read-only** The dimensions of the grid spaces as an array of two integers: `[x, y]` where `x` is the amount of horizontal spaces in a row and `y` is the amount of rows.

------------------------------------------------------

####Methods

#####`initialize(dimX, dimY, hexRadius)`
Factory method which takes the dimensions of the grid and produces a grid object filled in with the specified grid squares

Arguments | Type    | Notes
----------|---------|---------
dimX      | Integer | Width in pixels
dimY      | Integer | Height in pixels
hexSize   | Integer | Radius of each hex grid in pixels

*Returns* `HexGrid` object

==========================================

#####`spaceAt(x, y)`
Getter. Returns the grid space at coordinate (x, y)

Arguments | Type    | Notes
----------|---------|---------
x         | Integer | x Coordinate
y         | Integer | y Coordinate

*Returns* `HexSpace` object

==========================================

#####`distance(hexSpace1, hexSpace2)`
Get the distance in units between 2 spaces

Arguments | Type    | Notes
----------|---------|---------
hexSpace1 | HexSpace| A hex grid space
hexSpace2 | HexSpace| A hex grid space

*Returns* `INTEGER` of distance between 2 spaces

==========================================

#####`draw()`
TBD - I'm waiting until I understand Pixie.js before I implement anything

Arguments | Type    | Notes
----------|---------|---------

*Returns* TBD

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