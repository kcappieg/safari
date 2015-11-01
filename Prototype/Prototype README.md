#Safari Prototype

Create a prototype for the Safari main combat gameplay.

##Goals of Prototype:

*Work out necessary data structures
*Discover pitfalls or challenges of structure
*Get an idea down on "paper" from which to brainstorm and progress
*Provide a concrete starting point that is a solid project to work on

##Steps to accomplish
*...and estimated time to completion*

###Phase 1: Prep

1. Create a server in Nodejs from which to run the game locally - 30min - 1hr
2. Investigate Pixie.js and its API. Become familiar enough to get started - 30min - 1hr
3. Code a Hexagonal gamespace grid. This grid class should implement the API described below - 5 - 10hr

###Phase 2: Game Characters / Combat Mechanics

4. Find avatar images for use as character standins - 30min
5. Map out the exact mechanics for proto-combat - 1 - 2hr
6. From the combat needs, write an API for a character class - 2 - 3hr
7. Implement the API for the character class, and design 10 test charcters: 5 for each side - 5 - 6hr

###Phase 3: Event Loop

8. Map out what actions take place when in the event loop - 1 - 2hr
9. Implement the event loop - 4 - 8hr
10. Refine event loop / combat mechanics. Correct to make it engaging / interesting - 4hr
11. Debug / testing buffer - 10hr


##APIs

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

#####`initialize(dimX, dimY)`
Factory method which takes the dimensions of the grid and produces a grid object filled in with the specified grid squares

Arguments | Type    | Notes
----------|---------|---------
dimX      | Integer | Number of hex spaces per row
dimY      | Integer | Number of rows of hex spaces

*Returns* `HexGrid` object
==========================================

#####`spaceAt(x, y)`
Getter. Returns the grid space at coordinate (x, y)

Arguments | Type    | Notes
----------|---------|---------
x         | Integer | x Coordinate
y         | Integer | y Coordinate

*Returns* `HexSpace` object