/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.trasport.range');
 * mod.thing == 'a thing'; // true
 */

var roleTransportRange = {
    /** @param {Creep} creep **/
    run: function (creep) {
        if (creep.memory.isTransporting == null) {
            creep.memory.isTransporting = false;
        }
        if (creep.memory.transportedEngergy == null) {
            creep.memory.transportedEngergy = 0;
        }
        if (creep.ticksToLive == 1) {
            console.log('TRANSPORT STATS ROOM: ' + creep.memory.room + ' Energy: ' + creep.memory.transportedEngergy);

            if (creep.memory.energyUsed != null) {
                if (creep.memory.energyUsed > creep.memory.transportedEngergy) {
                    console.log('ALARMALARM CREEP INSUFFICENT' + creep.memory.room);
                    if (Memory.insufficentFarmRoute[creep.memory.room] == null) {
                        Memory.insufficentFarmRoute[creep.memory.room] = 1;
                    } else {
                        Memory.insufficentFarmRoute[creep.memory.room] =
                            Memory.insufficentFarmRoute[creep.memory.room] + 1;
                    }
                    //TODO BLACKLIST ROOM NOT EFFICENT!!!!
                } else {
                    if (Memory.sufficentFarmRoute[creep.memory.room] == null) {
                        Memory.sufficentFarmRoute[creep.memory.room] = creep.memory.transportedEngergy;
                    } else {
                        Memory.sufficentFarmRoute[creep.memory.room] =
                            (Memory.sufficentFarmRoute[creep.memory.room] + creep.memory.transportedEngergy) / 2;
                    }
                }
            }
        }

        if (creep.room.name != creep.memory.room && !creep.memory.isTransporting) {
            // console.log('Moving to Ressource Room');
            creep.moveTo(new RoomPosition(25, 25, creep.memory.room));
            return;
        }
        if (creep.room.name == creep.memory.room && !creep.memory.isTransporting) {
            let target2 = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {
                filter: (structure) => {
                    return structure.amount > 300;
                },
            });
            if (target2 != null) {
                //  console.log(target2);
                if (creep.pickup(target2) == ERR_NOT_IN_RANGE) {
                    //   console.log('Moving to Dropped Ressources');
                    creep.moveTo(target2);
                }
                if (creep.store[RESOURCE_ENERGY] == creep.store.getCapacity()) {
                    creep.memory.isTransporting = true;
                }
            } else {
                var source = creep.pos.findClosestByRange(FIND_SOURCES);
                // creep.moveTo(new RoomPosition(25, 25, creep.memory.room));
                creep.moveTo(source);
            }
            return;
        }

        if (creep.room.name != Game.spawns.Spawn1.room.name && creep.memory.isTransporting) {
            // console.log('Moving to Spawn Room');
            creep.moveTo(new RoomPosition(25, 25, Game.spawns.Spawn1.room.name));
            return;
        }
        if (creep.room.name == Game.spawns.Spawn1.room.name && creep.memory.isTransporting) {
            var target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType == STRUCTURE_STORAGE;
                },
            });
            if (target == null) {
                target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return structure.structureType == STRUCTURE_CONTAINER;
                    },
                });
            }

            //console.log(target);
            if (target != null) {
                const range = creep.pos.getRangeTo(target);
                var creepEnergy = creep.store[RESOURCE_ENERGY];
                if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                } else {
                    creep.memory.transportedEngergy += creepEnergy;
                    //  console.log('Packing in container');
                    creep.memory.isTransporting = false;
                }
            }
            return;
        }
    },
};

module.exports = roleTransportRange;
