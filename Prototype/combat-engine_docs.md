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
 * Target is optional
 * Move
 * Attack
 * Hide
 * Retreat
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

 **Still need to figure out what to do after combatant is chosen. Maybe it doesn't matter. They can choose a target but still run away in the next phase (which is choosing a course of action)**