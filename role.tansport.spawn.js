//Game.spawns['Spawn1'].spawnCreep( [WORK, CARRY, MOVE], 'Harvester1',     { memory: { role: 'harvester' } } );
var storageStructures = {
    spawn: 0,
    extension: 10,
    tower: 999,
};

var roleHarvester = {
    /** @param {Creep} creep **/
    run: function (creep) {
        if (creep.memory.harvest == null) {
            creep.memory.harvest = true;
        }
        if (!creep.memory.harvest && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.harvest = true;
            creep.say('🔄 harvest');
        }
        if (creep.memory.harvest && creep.store.getFreeCapacity() == 0) {
            creep.memory.harvest = false;
            creep.say('🚧 Store');
        }

        if (creep.memory.harvest) {
            if (creep.memory.target == null) {
                var target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (
                            (structure.structureType == STRUCTURE_CONTAINER &&
                                structure.store.getUsedCapacity() > 100) ||
                            (structure.structureType == STRUCTURE_STORAGE && structure.store.getUsedCapacity() > 100)
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
        } else {
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (
                        (structure.structureType == STRUCTURE_EXTENSION ||
                            structure.structureType == STRUCTURE_SPAWN) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                    );
                },
            });
            var stores = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (
                        (structure.structureType == STRUCTURE_CONTAINER && structure.store.getUsedCapacity() > 500) ||
                        (structure.structureType == STRUCTURE_STORAGE && structure.store.getUsedCapacity() > 5000)
                    );
                },
            });

            if (targets.length == 0 && stores.length > 0) {
                targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (
                            structure.structureType == STRUCTURE_TOWER &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                        );
                    },
                });
            }
            targets = targets.sort(function (a, b) {
                if (storageStructures[a.structureType] < storageStructures[b.structureType]) {
                    return -1;
                }
                if (storageStructures[a.structureType] > storageStructures[b.structureType]) {
                    return 1;
                }

                return 0;
            });

            if (targets.length > 0) {
                if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffffff' } });
                } else {
                    creep.memory.target = null;
                }
            } else {
                creep.moveTo(Game.flags.Sleep, { visualizePathStyle: { stroke: '#ffffff' } });
            }
        }
    },
};

module.exports = roleHarvester;
