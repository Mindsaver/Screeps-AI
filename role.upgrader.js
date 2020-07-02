//Game.spawns['Spawn1'].spawnCreep( [WORK, CARRY, MOVE], 'Upgrader1',     { memory: { role: 'upgrader' } } );
var roleUpgrader = {
    /** @param {Creep} creep **/
    run: function (creep) {
        if (creep.memory.upgradeing == null) {
            creep.memory.upgradeing = false;
        }
        if (creep.memory.upgradeing && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.upgradeing = false;
            creep.say('🔄 harvest');
        }
        if (!creep.memory.upgradeing && creep.store.getFreeCapacity() == 0) {
            creep.memory.upgradeing = true;
            creep.say('🚧 upgrade');
        }

        if (creep.memory.upgradeing) {
            if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#ffffff' } });
            } else {
                creep.memory.target = null;
            }
        } else {
            if (creep.memory.target == null) {
                var target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (
                            structure.structureType == STRUCTURE_CONTAINER && structure.store.getUsedCapacity() > 400
                        );
                    },
                });
                creep.memory.target = target;
            }

            if (creep.memory.target != null) {
                if (creep.withdraw(Game.getObjectById(creep.memory.target.id), RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.getObjectById(creep.memory.target.id));
                }
            } else {
                let target2 = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES);
                if (creep.pickup(target2) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target2);
                }
            }
        }
    },
};

module.exports = roleUpgrader;
