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

###Known Bugs

* `HexSpace.addTerrain()` and `HexSpace.removeTerrain()`: It's possible to cause a space's max occupancy to go too high if a terrain feature's `maxOccupancy` property would bring the occupancy below 0. The space's max occupancy stays at 0, but if that feature is removed, it would be increased up the full value of the `maxOccupancy` property

###`PIXI.HexGrid`

####Extends `PIXI.Container`.

The `HexGrid` class takes a set of dimensions in its constructor and draws out a Hexagonal grid using those dimensions. This class is meant to be used as a container for other sprites, which can occupy grid spaces.

The grid lines are simply a sprite of the PIXI.Sprite class that is always added to the container first, meaning its `index=0`. There's no reason why you can't alter this to suit your needs.

####Static Methods

#####`PIXI.HexGrid.setMaxOccupancy(number)`

Sets the default max occupancy that `HexSpaces` will be initialized with when a `HexGrid` is created. If not set, the starting default is 2.

Arguments | Type   | Notes
--------- | -------|------
`number`  | `number:Integer` | The maximum number of `Citizen`s that can occupy any `HexSpace` by default in the `HexGrid` when initialized.

######Implementation Notes

`HexSpace`s are initialized with whatever the value of the max occupancy is at the time the `PIXI.HexGrid()` constructor is invoked. Setting this value after a `HexGrid` has been initialized will have no effect on the already-instantiated `HexSpace`s.

####Constructors

#####`new PIXI.HexGrid(hexX, hexY, radius[, gridColor][, rotate])`

Takes the dimensions of Hex squares, the radius, and optional grid color and whether it should be rotated.

Arguments | Type    | Notes
----------|---------|---------
`hexX`      | `number:Integer` | Width in hex spaces
`hexY`      | `number:Integer` | Height in hex spaces
`radius`    | `number:Integer` | Radius of each hex space in pixels
`gridColor` | `string` | **Optional** `<color>` string as defined by CSS specifications, used as the pen color for stroking the grid lines
`rotate`    | `boolean` | **Optional** Should the Hex Grid be rotated? This changes the orientation of the hex space. The `hexX` and `hexY` parameters will still be calculated from the user's perspective (i.e. the x and y axes won't be rotated)

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

#####`pointAt(gridX, gridY)`
Returns the point that represents the center of the grid space at (gridX, gridY)

Arguments | Type    | Notes
----------|---------|---------
`gridX`   | `number:Integer` | Hex Grid x Coordinate
`gridY`   | `number:Integer` | Hex Grid y Coordinate

*Returns* `type:PIXI.Point`

==========================================

#####`hex(x, y)`
Returns the `HexLite` object that contains the point at (x, y)

Arguments | Type    | Notes
----------|---------|---------
`x`   | `number:Integer` | x Coordinate
`y`   | `number:Integer` | y Coordinate

*Returns* `object` As the `HexLite` object returned from the `HexSpace.createHexLite()` method

==========================================

#####`distanceBetween(x1, y1, x2, y2)`
Get the distance in hex space units between 2 spaces, identified by their grid coordinates

Arguments | Type    | Notes
----------|---------|---------
x1 | `number:Integer`| An integer within the bounds of the x-axis on the HexGrid which indicates which HexSpace is the origin
y1 | `number:Integer`| An integer within the bounds of the y-axis on the HexGrid which indicates which HexSpace is the origin
x2 | `number:Integer`| An integer within the bounds of the x-axis on the HexGrid which indicates which HexSpace is the destination
y2 | `number:Integer`| An integer within the bounds of the y-axis on the HexGrid which indicates which HexSpace is the destination

*Returns* `number:Integer` of distance between 2 spaces in hex space units

==========================================

#####`hexesBetween(gridX1, gridY1, gridX2, gridY2)`
Returns an array of objects with essential information about each hex space between the origin hex and the destination hex excluding the origin and including the destination.

Arguments | Type    | Notes
----------|---------|---------
gridX1 | `number:Integer`| The starting `HexSpace` x-coordinate of the origin
gridY1 | `number:Integer`| The starting `HexSpace` y-coordinate of the origin
gridX2 | `number:Integer`| The `HexSpace` x-coordinate of the destination
gridY2 | `number:Integer`| The `HexSpace` y-coordinate of the destination

*Returns* `ARRAY:Object` Array of the `HexLite` objects representing every `HexSpace` from the origin to the destination (origin, destination]. The `HexLite` objects in the array are as those created by the `HexSpace.createHexLite()` method (see below).

* `gridX`: `number:Integer` - Hex Grid x Coordinate 
* `gridY`: `number:Integer` - Hex Grid y Coordinate
* `attributes`: `object` - An object whose enumerable property names are the names of terrain features found on the grid space. Each enumerable property is the `attributes` object assigned to each terrain type found on the grid space. 

#####Implementation Notes
Uses a 2-dimensional K-D tree behind the scenes and polls each point along the line from the center of the origin to the center of the destination. It adds every hex space the polled points are within to the array

==========================================

#####`addCitizen(sprite, name, x, y, addToStage)`
Add a citizen to the population of the `HexGrid`. The citizen construct is a way to abstract the nitty-gritty of dealing with the position of your sprites. They can be moved, interacted with, and given commands via the HexGrid. They occupy a `HexSpace`, and can be commanded to move etc. *Most of the implementation is TBD*

Arguments | Type    | Notes
----------|---------|---------
`sprite`    | `type:PIXI.Sprite` | Must be a `PIXI.Sprite` object
`name`      | `string` | name with which to register the sprite
`x`         | `integer` | The starting `HexSpace` x-coordinate of the citizen
`y`         | `integer` | The starting `HexSpace` y-coordinate of the citizen
`addToStage` | `boolean` | **Optional** Should the citizen be added to the stage? Default `true`

*Returns* `this`

==========================================

#####`addCitizenFromTexture(texture, name, x, y, height, width, addToStage)`
Like `addCitizen`, except creates a sprite from a texture

Arguments | Type    | Notes
----------|---------|---------
texture   | `type:PIXI.Texture` | Must be a `PIXI.Texture` object
name      | `string` | name with which to register the sprite
x         | `integer` | The starting `HexSpace` x-coordinate of the citizen
y         | `integer` | The starting `HexSpace` y-coordinate of the citizen
height    | `integer` | **Optional** The height of the sprite, defaults to the hexRadius of the grid
width     | `integer` | **Optional** The width of the sprite, defaults to the hexRadius of the grid
`addToStage` | `boolean` | **Optional** Should the citizen be added to the stage? Default `true`

*Returns* `this`

==========================================

#####`moveCitizenTo(citizen, x, y)`
*See alternate method signatures*

Moves a citizen to the grid space specified by the provided coordinates.

**Note** This function attempts to occupy a grid space. If it is unsuccessful, the movement will fail entirely.

Arguments | Type    | Notes
----------|---------|---------
citizen   | `string` | name of a pre-registered citizen on the grid
x         | `integer` | The destination `HexSpace` x-coordinate of the citizen
y         | `integer` | The destination `HexSpace` y-coordinate of the citizen

*Returns* `boolean` whether the occupation / movement was successful

==========================================

#####`moveCitizenTo(citizen, x, y, time, [animation, [endAnimation]])`
*See alternate method signatures*

Moves a citizen to the grid space specified by the provided coordinates in the time indicated by the passed time value. You can optionally specify an animation function to execute during the movement.

**Note** This function attempts to occupy a grid space when the citizen arrives. If it is unsuccessful, the citizen will...do something else.

**Note** If `time <= 0`, this method behaves as the signature `moveCitizenTo(citizen, x, y)`

Arguments | Type    | Notes
----------|---------|---------
citizen   | `string` | name of a pre-registered citizen on the grid
x         | `integer` | The destination `HexSpace` x-coordinate of the citizen
y         | `integer` | The destination `HexSpace` y-coordinate of the citizen
time      | `integer` | Optional The amount of time (in miliseconds) to take to get from the starting position to the end position. Must be > 0
animation | `function` | **Optional** Function that will be executed on each animation frame during the movement. Arguments to the function described below.
endAnimation | `function` | **Optional** If an `animation` function was passed, this function will be executed at the end of the movement. Arguments to the function described below.

######Arguments to `animation()`

* `tickerLite` - `object` with the following properties
 * `deltaTime` - `number:floating point` as the `deltaTime` property from the `PIXI.Ticker` object
 * `elapsedMS` - `number:floating point` as the `elapsedMS` property from the `PIXI.Ticker`
* `sprite` - `type:PIXI.Sprite` object of the citizen being moved
* `deregisterAnimation` - `function` deregisters the animation function if the animation is complete

######Arguments to `endAnimation()`

* `tickerLite` - `object` with the following properties
 * `deltaTime` - `number:floating point` as the `deltaTime` property from the `PIXI.Ticker` object
 * `elapsedMS` - `number:floating point` as the `elapsedMS` property from the `PIXI.Ticker`
* `sprite` - `type:PIXI.Sprite` object of the citizen being moved

*Returns* `function` Interrupt the movement and stop the citizen exactly where it is. If passed, the `endAnimation` function will be invoked.

==========================================

#####`getCitizenSprite(name)`
Get the sprite of a citizen previously added to the grid. The Sprite can be updated independently by the client, but certain future commands may override user specifications, for instance position (x and y coordinates).

Arguments | Type    | Notes
----------|---------|---------
name      | `string` | name of a citizen previously registered into the grid

*Returns* `type:PIXI.Sprite` The `PIXI.Sprite` object of the citizen.

==========================================

#####`getCitizenDirection(name)`
Get the direction the citizen is facing based on its most recent movement. The return value is an angle in radians. See the *Returns* section below for details

Arguments | Type    | Notes
----------|---------|---------
name      | `string` | name of a citizen previously registered into the grid

*Returns* `number:Float` - Angle in radians that describes the direction the citizen moved or is moving. Possible values from [0, 2*pi). A value of 0 means the citizen is facing left on the grid, and it proceeds clockwise:

* Left: 0
* Down: pi/2
* Right: pi
* Up: pi * 3/2

==========================================

#####`isCitizenMoving(name)`
The boolean of whether the citizen is in the process of moving as a result of a call to the `moveCitizenTo()` method.

Arguments | Type    | Notes
----------|---------|---------
name      | `string` | name of a citizen previously registered into the grid

*Returns* `boolean` Is the citizen moving?

==========================================

#####`addTerrain(hexX, hexY, name)`
Adds a terrain feature specified by `name` to the hex grid space specified by `hexX` and `hexY`

Arguments | Type    | Notes
----------|---------|---------
hexX      | `integer` | The `HexSpace` x-coordinate
hexY      | `integer` | The `HexSpace` y-coordinate
name      | `string` | name from which to instantiate a registered `Terrain` feature

*Returns* `this`

==========================================

#####`removeTerrain(hexX, hexY, name)`
Removes a terrain feature specified by `name` from the hex grid space specified by `hexX` and `hexY`

Arguments | Type    | Notes
----------|---------|---------
hexX      | `integer` | The `HexSpace` x-coordinate
hexY      | `integer` | The `HexSpace` y-coordinate
name      | `string` | name of the `Terrain` feature to remove

*Returns* `this`

==========================================

#####`applySprites()`
Empties the grid of all existing children and applies all sprites for citizens, terrains, and superpositions.

Arguments | Type    | Notes
----------|---------|---------
hexX      | `integer` | The `HexSpace` x-coordinate
hexY      | `integer` | The `HexSpace` y-coordinate
name      | `string` | name of the `Terrain` feature to remove

*Returns* `this`

==========================================

###`PIXI.HexGrid.HexSpace`

Partially mutable class. Coordinates cannot be changed, but other attributes such as occupants or potentially terrain features / cover may be.

This is the default grid space class, which can be overridden when initializing a new `HexGrid`.

####Properties

#####`x`
`INTEGER` **Read-Only** The x-coordinate of the grid space on the stage (in pixels)

#####`y`
`INTEGER` **Read-Only** The y-coordinate of the grid space on the stage (in pixels)

#####`gridX`
`INTEGER` **Read-Only** The x-coordinate of the grid space in relation to the grid (not pixels);

#####`gridY`
`INTEGER` **Read-Only** The y-coordinate of the grid space in relation to the grid (not pixels);

#####`radius`
`INTEGER` **Read-Only** The radius of the HexSpace (as initialized);

#####`maxOccupancy`
`INTEGER` **Read-Only** The maximum number of occupants that can fit in the `HexSpace`. Calculated based on terrain, and so may change if terrain changes.

####Methods

#####`getOccupants()`
Returns the occupant(s) of the space if any

Arguments | Type    | Notes
----------|---------|---------

*Returns* `ARRAY:OBJECT` Array of the occupants of the space

==========================================

#####`occupy(combatant)`
Occupies the `HexSpace` with an occupier, and also vacates the previous `HexSpace` of the occupier, if any

Arguments | Type    | Notes
----------|---------|---------
combatant | Combatant| A combatant moving into the hex space

*Returns* `BOOLEAN` Successful?

==========================================

#####`addTerrain(name)`
Adds a new terrain feature to the hex space unless that feature already exists in the space.

Arguments | Type    | Notes
----------|---------|---------
name | `string` | The name of the new terrain feature to be instantiated

*Returns* `type:PIXI.HexGrid.Terrain` the new terrain feature added

==========================================

#####`removeTerrain(name)`
Removes an existing terrain type from a hex space

Arguments | Type    | Notes
----------|---------|---------
name | `string` | The name of the new terrain feature to be removed

*Returns* `type:PIXI.HexGrid.Terrain` The terrain feature just removed

==========================================

#####`createHexLite()`
Creates a copy of the properties of the hex object (with the terrain attributes currently present), but without any of its methods

Arguments | Type    | Notes
----------|---------|---------


*Returns* `object` Object with the properties of `this`, but without any of its methods. Additionally has `attributes` property, which is an object whose properties are terrain attributes for all terrain types on this hex space.

==========================================

#####`getTerrainAttributes()`


Arguments | Type    | Notes
----------|---------|---------


*Returns* `object` - An object whose enumerable property names are the names of terrain features found on the grid space. Each enumerable property is the `attributes` object assigned to each terrain type found on the grid space. **Note** This makes a shallow copy of the terrain object stored internally in the HexSpace, but the attributes objects will be the same objects with which the client registered the Terrain type.

==========================================

###`PIXI.HexGrid.Terrain`
The `Terrain` class is meant as a way to add different terrain to the spaces of the hex grid. Each `Terrain` object has a base texture from which new sprites are created (as the background for the hex space). It also has an `attributes` object which should be defined on the client side to fit your game's needs.

####Properties

* name - `string` The name of the terrain feature
* sprite - `type:PIXI.Sprite` The unique sprite object of this terrain feature
* attributes - `object` A unique object copied to this object detailing the terrain feature's attributes

####Static Methods

#####`Terrain.registerNewType (name, texture, attributes[, layer])`
Registers a new type of terrain

Arguments | Type    | Notes
----------|---------|---------
name      | `string` | The name of the terrain type
texture   | `type:PIXI.Texture` | The texture from which to create new sprites for this terrain feature
attributes | `object` | Client-specific object which describes attributes of this terrain feature
layer | `string` | Either `"overlay"` or `"underlay"`, indicating which layer the terrain's sprite should be put on

*Returns* `PIXI.HexGrid.Terrain` for chaining

==========================================

####Constructors

#####`new PIXI.Hexgrid.Terrain(name)`
Returns a new instance of a `Terrain` that has been registered already. Throws an error if `name` has not been registered.

Arguments | Type    | Notes
----------|---------|---------
name      | `string` | The name of the terrain type

*Returns* `type:PIXI.HexGrid.Terrain` object