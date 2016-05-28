#HexGrid Documentation

###Known Bugs

...

###`PIXI.HexGrid`

Namespace for the HexGrid abstraction.

The `HexGrid` object intializes a hex grid along with all `PIXI.Container` objects needed for its operations. It takes a set of dimensions in its factory initializer and draws out a Hexagonal grid using those dimensions.

The grid lines are implemented as a `PIXI.Sprite` class dynamically drawn in a `canvas` element to specified dimensions.

All `PIXI.Containers` used in the grid are accessible as properties on the `HexGridManager` controller object so that you can access PIXI's methods

####Static Methods

#####`PIXI.HexGrid.setMaxOccupancy(number)`

Sets the default max occupancy that `HexSpaces` will be initialized with when a `HexGrid` is created. If not set, the starting default is 2.

Arguments | Type   | Notes
--------- | -------|------
`number`  | `number:Integer` | The maximum number of `Citizen`s that can occupy any `HexSpace` by default in the `HexGrid` when initialized.

**Returns** `this`

######Implementation Notes

`HexSpace`s are initialized with whatever the value of the max occupancy is at the time the `PIXI.HexGrid.initializeHexGrid()` factory is invoked. Setting this value after a `HexGrid` has been initialized will have no effect on the already-instantiated `HexSpace`s.

============================================

#####`PIXI.HexGrid.initializeHexGrid(hexX, hexY, radius[, gridColor][, rotate])`

Takes the dimensions of Hex squares, the radius, and optional grid color and whether it should be rotated.

Arguments | Type    | Notes
----------|---------|---------
`hexX`      | `number:Integer` | Width in hex spaces
`hexY`      | `number:Integer` | Height in hex spaces
`radius`    | `number:Integer` | Radius of each hex space in pixels
`gridColor` | `string` | **Optional** `<color>` string as defined by CSS specifications, used as the pen color for stroking the grid lines
`rotate`    | `boolean` | **Optional** Should the Hex Grid be rotated? This changes the orientation of the hex space. The `hexX` and `hexY` parameters will still be calculated from the user's perspective (i.e. the x and y axes won't be rotated)

**Returns** `type:HexGridManager`

==========================================

###`HexGridManager`

This is the main controller class of the HexGrid paradigm. The methods on this class coordinate and organize the different layers and components of the hex grid including "Citizens", or game character objects, and Terrain features.

####Properties

#####`grid`
`type:PIXI.Container` **Read-only** The container object, or stage, which contains the entire grid

------------------------------------------------------

#####`gridSprite`
`type:PIXI.Sprite` **Read-only** The sprite object of the background grid. Added to `grid` first.

------------------------------------------------------

#####`underLayer`
`type:PIXI.Container` **Read-only** The container object which holds all terrain features registered as `"underlay"`. Added to `grid` second.

------------------------------------------------------

#####`citizenLayer`
`type:PIXI.Container` **Read-only** The container object which holds all game objects, or citizens. Added to `grid` third.

------------------------------------------------------

#####`overLayer`
`type:PIXI.Container` **Read-only** The container objectwhich holds all terrain features registered as `"overlay"`. Added to `grid` fourth.

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

**Returns** `type:PIXI.Point`

==========================================

#####`hexAt(x, y)`
Returns the `HexLite` object that contains the point at (x, y)

Arguments | Type    | Notes
----------|---------|---------
`x`   | `number:Integer` | x Coordinate
`y`   | `number:Integer` | y Coordinate

**Returns** `type:HexLite` object representing the hex space at the given coordinates

==========================================

#####`getAllHexSpaces()`
Returns all `HexLite` objects on this grid

Arguments | Type    | Notes
----------|---------|---------
NONE

**Returns** `ARRAY[type:HexLite]` array of all `HexLite` objects occupying this grid

==========================================

#####`distanceBetween(gridX1, gridY1, gridX2, gridY2)`

Get the distance in pixels between 2 `HexSpace`s, identified by their grid coordinates

Arguments | Type    | Notes
----------|---------|---------
gridX1 | `number:Integer`| An integer within the bounds of the x-axis on the HexGrid which indicates which `HexSpace` is the origin
gridY1 | `number:Integer`| An integer within the bounds of the y-axis on the HexGrid which indicates which `HexSpace` is the origin
gridX2 | `number:Integer`| An integer within the bounds of the x-axis on the HexGrid which indicates which `HexSpace` is the destination
gridY2 | `number:Integer`| An integer within the bounds of the y-axis on the HexGrid which indicates which `HexSpace` is the destination

**Returns** `number:Float` Distance between the `HexSpace`s in pixels

==========================================

#####`hexesBetween(gridX1, gridY1, gridX2, gridY2)`
Returns an array of objects with essential information about each hex space between the origin hex and the destination hex excluding the origin and including the destination.

Arguments | Type    | Notes
----------|---------|---------
gridX1 | `number:Integer`| The starting `HexSpace` x-coordinate of the origin
gridY1 | `number:Integer`| The starting `HexSpace` y-coordinate of the origin
gridX2 | `number:Integer`| The `HexSpace` x-coordinate of the destination
gridY2 | `number:Integer`| The `HexSpace` y-coordinate of the destination

**Returns** `ARRAY[type:HexLite]` Array of the `HexLite` objects representing every `HexSpace` from the origin to the destination (origin, destination]. The `HexLite` objects in the array are as those created by the `HexSpace.createHexLite()` method (see below).

* `gridX`: `number:Integer` - Hex Grid x Coordinate 
* `gridY`: `number:Integer` - Hex Grid y Coordinate
* `attributes`: `object` - An object whose enumerable property names are the names of terrain features found on the grid space. Each enumerable property is the `attributes` object assigned to each terrain type found on the grid space. 

#####Implementation Notes
Uses a 2-dimensional K-D tree behind the scenes and polls each point along the line from the center of the origin to the center of the destination. It adds every hex space the polled points are within to the array

==========================================

#####`addCitizen(sprite, name, x, y[, extAttributes])`
Add a citizen to the population of the `HexGrid`. The citizen construct is a way to abstract the nitty-gritty of dealing with the position of your sprites. They can be moved, interacted with, and given commands via the HexGrid. They occupy a `HexSpace`, and can be commanded to move etc. Sprites associated with citizens are automatically added to the `citizenLayer`.

Arguments | Type    | Notes
----------|---------|---------
`sprite`    | `type:PIXI.Sprite` | Must be a `PIXI.Sprite` object
`name`      | `string` | name with which to register the `Citizen`
`x`         | `number:Integer` | The starting `HexSpace` x-coordinate of the citizen
`y`         | `number:Integer` | The starting `HexSpace` y-coordinate of the citizen
`extAttributes` | `object` | **Optional** Freeform object. This object is not modified or manipulated by the hex grid, but could be useful for keeping track of your game element with the internal citizen construct.

**Returns** `this`

==========================================

#####`removeCitizen(name)`

Remove a previously registered citizen from the `HexGrid`'s population, also removing its sprite from the `citizenLayer`.

Arguments | Type    | Notes
----------|---------|---------
`name`      | `string` | name of a previously registered `Citizen`

**Returns** `type:PIXI.DisplayObject` The sprite / display object of the citizen removed

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

**Returns** `boolean` whether the occupation / movement was successful

==========================================

#####`moveCitizenTo(citizen, x, y, time, [animation, [endAnimation]])`
*See alternate method signatures*

Moves a citizen to the grid space specified by the provided coordinates in the time indicated by the passed time value. You can optionally specify an animation function to execute during the movement.

**Note** This function attempts to occupy a grid space when the citizen arrives. If it is unsuccessful, the citizen will...do something else.

**Note** If `time <= 0`, this method behaves as the signature `moveCitizenTo(citizen, x, y)`, meaning neither `animation` nor `endAnimation` will be called

Arguments | Type    | Notes
----------|---------|---------
citizen   | `string` | name of a pre-registered citizen on the grid
x         | `integer` | The destination `HexSpace` x-coordinate of the citizen
y         | `integer` | The destination `HexSpace` y-coordinate of the citizen
time      | `integer` | Optional The amount of time (in miliseconds) to take to get from the starting position to the end position. Must be > 0
animation | `function` | **Optional** Function that will be executed on each animation frame during the movement. Arguments to the function described below.
endAnimation | `function` | **Optional** If an `animation` function was passed, this function will be executed at the end of the movement. Arguments to the function described below. Note: this function is called *after* a citizen has occupied a grid space. If your citizen should have affects based on the terrain they are in, they can be applied in this `endAnimation` function.

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

**Returns** `function` Takes no arguments. When called, iterrupts the movement and forces the citizen to occupy the nearest `HexSpace`

==========================================

#####`getCitizen(name)`
Get the `CitizenLite` object of a citizen previously added to the grid. Object described below

Arguments | Type    | Notes
----------|---------|---------
name      | `string` | name of a citizen previously registered into the grid

**Returns** `type:CitizenLite` The object describing the citizen.

==========================================

#####`addTerrain(hexX, hexY, name)`
Adds a terrain feature specified by `name` to the hex grid space specified by `hexX` and `hexY`

Arguments | Type    | Notes
----------|---------|---------
hexX      | `integer` | The `HexSpace` x-coordinate
hexY      | `integer` | The `HexSpace` y-coordinate
name      | `string` | name from which to instantiate a registered `Terrain` feature

**Returns** `type:PIXI.HexGrid.Terrain` The new terrain feature just added.

==========================================

#####`removeTerrain(hexX, hexY, name)`
Removes a terrain feature specified by `name` from the hex grid space specified by `hexX` and `hexY`

Arguments | Type    | Notes
----------|---------|---------
hexX      | `integer` | The `HexSpace` x-coordinate
hexY      | `integer` | The `HexSpace` y-coordinate
name      | `string` | name of the `Terrain` feature to remove

**Returns** `this`

==========================================

###`Citizen`

Private class. Not accessible to clients.

####Constructors

#####`Citizen(sprite, name, extAttributes)

Private Class

Arguments | Type | Details
--------- | ---- | -------
`sprite` | `type:PIXI.Container` | PIXI container object, usually a sprite, which graphically represents the citizen.
`name` | `string` | Name of the citizen
`extAttributes` | `object` | Freeform object. Not manipulated or changed, simply referenced for convenience when using the HexGrid. Use this object to store client-specific stats.

####Properties

#####`facing`
`number:Float`: Number between [0, 2*PI) which indicates the direction the citizen is facing based on its last movement direction.

#####`moving`
`boolean`: Is the citizen currently moving?

#####`currentHex`
`type:HexSpace`: The current `HexSpace` that the citizen is occupying

#####`sprite`
`type:PIXI.DisplayObject`: The PIXI container object, usually `PIXI.Sprite`, which represents this citizen

#####`name`
`string`: The name this citizen was registered with. Must be unique in the `HexGrid`.

####Methods

#####`interrupt()`

If an interrupt function has been set via the `setInterrupt` method, calls that function and wipes it out so that it can't be called again.

Arguments | Type | Details
--------- | ---- | -------

**Returns** The return value of the interrupt function set.

============================================

#####`setInterrupt(fn)`

Set the interrupt function to be called with `interrupt()`

Arguments | Type | Details
--------- | ---- | -------
`fn`  | `function` | A function which should end the citizen's movement

**Returns** void

============================================

#####`clearInterrupt()`

Clear the interrupt function set with `setInterrupt`

Arguments | Type | Details
--------- | ---- | -------

**Returns** void

============================================

#####`getCitizenLite()`

Returns an object of the type `CitizenLite`, which is basically a client-safe version of this object

Arguments | Type | Details
--------- | ---- | -------

**Returns** `type:CitizenLite` Corresponds to this citizen.

============================================

###`CitizenLite`

Public Class

Accessed via the `getCitizenLite()` method on the `Citizen` class.

As the `Citizen` class with the below properties and methods. (Descriptions provided where necessary):

* `facing`
* `moving`
* `currentHex` - `type:HexSpaceLite`
* `sprite`
* `name`
* `attributes` - `object` The `extAttributes` object passed to the constructor.
* `interrupt`

**Please Note** All properties and methods are read-only and non-configurable. The `interrupt` method is a reference to the `Citizen`'s `interrupt` method, but cannot affect the interrupt function registered.

======================================

###`HexSpace`

Private class.

This is the grid space class used internally to represent a space in the grid.

####Constructors

#####`HexSpace(x, y, gridX, gridY, radius)`

Arguments | Type | Details
--------- | ---- | -------
`x` | `number` | x-coordinate on the grid stage of the hex space
`y` | `number` | y-coordinate on the grid stage of the hex space
`gridX` | `number:Integer` | The x-coordinate of the grid space in relation to the grid (not pixels);
`gridY` | `number:Integer` | The y-coordinate of the grid space in relation to the grid (not pixels);
`radius` | `number` | The radius of the hexagonal polygon.

####Properties

#####`x`
`number` **Read-Only** The x-coordinate of the grid space on the stage (in pixels)

#####`y`
`number` **Read-Only** The y-coordinate of the grid space on the stage (in pixels)

#####`gridX`
`number:Integer` **Read-Only** The x-coordinate of the grid space in relation to the grid (not pixels);

#####`gridY`
`number:Integer` **Read-Only** The y-coordinate of the grid space in relation to the grid (not pixels);

#####`radius`
`number` **Read-Only** The radius of the HexSpace (as initialized);

#####`maxOccupancy`
`number:Integer` **Read-Only** The maximum number of occupants that can fit in the `HexSpace`. Calculated based on terrain, and so may change if terrain changes.

####Methods

#####`getOccupants()`
Returns the occupant(s) of the space if any

Arguments | Type    | Notes
----------|---------|---------

**Returns** `Array[type:CitizenLite]` Array of the occupants of the space

==========================================

#####`occupy(citizen)`
Occupies the `HexSpace` with a `Citizen`

Arguments | Type    | Notes
----------|---------|---------
`citizen` | `type:Citizen` | A citizen moving into the hex space

**Returns** `boolean` Successful?

==========================================

#####`vacate(formerCitizen)`
Removes a `Citizen` from the `HexSpace`

Arguments | Type    | Notes
----------|---------|---------
`formerCitizen` | `type:Citizen` | A citizen leaving the hex space

**Returns** `boolean` Successful?

==========================================

#####`reorient()`
Reorients any occupants of the hex grid so that they overlap as little as possible

Arguments | Type    | Notes
----------|---------|---------

**Returns** void

==========================================

#####`addTerrain(name)`
Adds a new terrain feature to the hex space unless that feature already exists in the space.

Arguments | Type    | Notes
----------|---------|---------
name | `string` | The name of the new terrain feature to be instantiated

**Returns** `type:PIXI.HexGrid.Terrain` the new terrain feature added

==========================================

#####`removeTerrain(name)`
Removes an existing terrain type from a hex space

Arguments | Type    | Notes
----------|---------|---------
name | `string` | The name of the new terrain feature to be removed

**Returns** `type:PIXI.HexGrid.Terrain` The terrain feature just removed

==========================================

#####`getHexLite()`
Gets a client-safe version of this object, `HexSpaceLite`. Described below

Arguments | Type    | Notes
----------|---------|---------


**Returns** `type:HexSpaceLite` Represents this `HexSpace`

==========================================

#####`getTerrainFeatures()`


Arguments | Type    | Notes
----------|---------|---------


**Returns** `object` - An object whose enumerable property names are the names of terrain features found on the grid space. Each enumerable property is the corresponding `PIXI.HexGrid.Terrain` object

==========================================

###`HexSpaceLite`

Public class.

Accessed via the `getHexLite()` method on the `HexSpace` class.

As the `HexSpace` class with the below properties and methods. (Descriptions provided where necessary):

* `x`
* `y`
* `gridX`
* `gridY`
* `radius`
* `getTerrainFeatures`
* `getOccupants`

**Please Note** All properties and methods are read-only and non-configurable. The `getTerrainFeatures` and `getOccupants` methods are a reference to the `HexSpace`'s methods.

==============================

###`PIXI.HexGrid.Terrain`
The `Terrain` class is meant as a way to add different terrain to the spaces of the hex grid. Each `Terrain` object has a base texture from which new sprites are created (as the background for the hex space). It also has an `attributes` object which should be defined on the client side to fit your game's needs.

####Constructors

#####`PIXI.HexGrid.Terrain(name)`

Constructs a `Terrain` object from a pre-registered terrain type specified by `name`

Arguments | Type | Details
--------- | ---- | -------
`name` | `string` | The name of a pre-registered terrain type.

####Properties

* name - `string` The name of the terrain feature
* sprite - `type:PIXI.Sprite` The unique sprite object of this terrain feature, created from the registered texture when initialize
* attributes - `object` A freeform object shallow copied to this instance detailing the terrain feature's attributes
* layer - `string` **READ-ONLY** The layer that the terrain's sprite will be rendered in
* maxOccupancyModifier - `number:Integer` **READ-ONLY** The modifier this terrain applies to the max occupancy of the grid it is in.

####Static Methods

#####`PIXI.HexGrid.Terrain.registerNewType(name, texture, attributes[, layer][, maxOccupancyModifier])`
Registers a new type of terrain

Arguments | Type    | Notes
----------|---------|---------
name      | `string` | The name of the terrain type
texture   | `type:PIXI.Texture` | The texture from which to create new sprites for this terrain feature
attributes | `object` | Client-specific object which describes attributes of this terrain feature
layer | `string` | **Optional** Either `"overlay"` or `"underlay"`, indicating which layer the terrain's sprite should be put on
maxOccupancyModifier | `number:Integer` | **Optional** modifier to the max occupancy of the hex gridspace

**Returns** `PIXI.HexGrid.Terrain` for chaining