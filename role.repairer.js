var StructerRepairOrder = {
    spawn: 0,
    extension: 10,
    road: 20,
    controller: 30,
    storage: 40,
    container: 50,
    rampart: 100,
    keeperLair: 120,
    portal: 140,
    link: 160,
    observer: 180,
    powerBank: 200,
    powerSpawn: 210,
    extractor: 220,
    lab: 230,
    terminal: 240,
    nuker: 250,
    invaderCore: 260,
    factory: 270,
    tower: 999,
    constructedWall: 9999,
};

//Game.spawns['Spawn1'].spawnCreep( [WORK, CARRY, MOVE], 'Harvester1',     { memory: { role: 'repairer' } } );
var roleRepairer = {
    run: function (creep) {
        if (creep.memory.repairing == null) {
            creep.memory.repairing = false;
        }
        if (creep.memory.repairing && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.repairing = false;
            creep.say('🔄 harvest');
        }
        if (!creep.memory.repairing && creep.store.getFreeCapacity() == 0) {
            creep.memory.repairing = true;
            creep.say('🚧 repairing');
        }

        if (creep.memory.repairing) {
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.hits < structure.hitsMax && structure.structureType != STRUCTURE_WALL;
                },
            });
            targets = targets.sort(function (a, b) {
                if (StructerRepairOrder[a.structureType] < StructerRepairOrder[b.structureType]) {
                    return -1;
                }
                if (StructerRepairOrder[a.structureType] > StructerRepairOrder[b.structureType]) {
                    return 1;
                }
                if (a.hits + 2000 < b.hits) {
                    return -1;
                }
                if (a.hits > b.hits + 2000) {
                    return 1;
                }
                return 0;
            });
            if (targets.length > 0) {
                if (creep.repair(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffaa00' } });
                } else {
                    creep.memory.target = null;
                }
            } else {
                creep.moveTo(Game.flags.Sleep, { visualizePathStyle: { stroke: '#ffffff' } });
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

module.exports = roleRepairer;
