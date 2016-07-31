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


##Notes on Actions

* Develop Action "abstract" class with specific subclasses for specific action types
* Action classes need to provide an implementation for carrying out the action
* Should have an instance variable for whether or not the action is finished
* Need to bake in a way for animations to be a part of the action.

###Interruptions during actions

Interruptions need to be delivered via the special "Interrupt" stream.

* Interruptions simulate emergencies / urgent commands rather than suggestions of the next thing to do.
* Interruptions should be split into different types (enums?) that the character can either follow or ignore
* The "Interruption Decision" algorithm needs to be configurable.
* Interruptions are delivered with 3 pieces of information: the type, the sender/initiator, and a function to execute if the character accepts the interruption
  * Examples of possible uses for the callback are to increase modifiers (similar to a pre-asses message) or alter other pieces of game state as relevant
* Another use for Interruptions might be to buff a character while they're in the middle of an action. So an interrupt type of "BUFF" should be constructed
* If the character is not performing an action, the Interruption stream will be fed into the pre-assess message stream.

###Current Tasks

* Finish implementing Action subtypes
* modify chain callers for Action section of the chain to be aware of the new Action interface
* Document the Action interface