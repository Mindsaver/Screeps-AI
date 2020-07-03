//Game.spawns['Spawn1'].spawnCreep( [WORK, CARRY, MOVE], 'Harvester1',     { memory: { role: 'harvester' } } );
var roleMinerEngergy = {
    /** @param {Creep} creep **/
    run: function (creep) {
        //  console.log(creep.memory.room);
        if (creep.room.name != creep.memory.room && creep.memory.room != undefined) {
            creep.moveTo(new RoomPosition(25, 25, creep.memory.room));
            return;
        }

        var sources = creep.room.find(FIND_SOURCES);
        if (creep.room.memory.mineID == null) {
            creep.room.memory.mineID = 0;
        }

        if (creep.memory.currentMineID == null) {
            creep.memory.currentMineID = creep.room.memory.mineID;
            if (creep.room.memory.mineID < sources.length - 1) {
                creep.room.memory.mineID++;
            } else {
                creep.room.memory.mineID = 0;
            }
        }
        if (creep.memory.room == 'W8N2') {
            //  console.log(sources[creep.memory.currentMineID]);
            //  console.log(creep.harvest(sources[creep.memory.currentMineID]));
        }

        if (creep.harvest(sources[creep.memory.currentMineID]) == ERR_NOT_IN_RANGE) {
            creep.moveTo(sources[creep.memory.currentMineID], { visualizePathStyle: { stroke: '#ffaa00' } });
        }
        if (creep.store.getFreeCapacity() == 0) {
            var target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType == STRUCTURE_CONTAINER;
                },
            });

            if (target != null) {
                const range = creep.pos.getRangeTo(target);
                if (range < 4) {
                    if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target);
                    }
                } else {
                    creep.drop(RESOURCE_ENERGY);
                }
            } else {
                creep.drop(RESOURCE_ENERGY);
            }
        }
    },
};

module.exports = roleMinerEngergy;
