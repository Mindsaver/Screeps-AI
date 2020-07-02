//Game.spawns['Spawn1'].spawnCreep( [WORK, CARRY, MOVE], 'Builder1',     { memory: { role: 'builder' } } );
var roleBuilder = {
    /** @param {Creep} creep **/
    run: function (creep) {
        if (creep.memory.building == null) {
            creep.memory.building = false;
        }
        if (creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.building = false;
            creep.say('🔄 harvest');
        }
        if (!creep.memory.building && creep.store.getFreeCapacity() == 0) {
            creep.memory.building = true;
            creep.say('🚧 build');
        }

        if (creep.memory.building) {
            var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            if (targets.length) {
                if (creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffffff' } });
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

module.exports = roleBuilder;
