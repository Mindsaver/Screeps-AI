var roleTransportSpawn = require('role.tansport.spawn');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleRepairer = require('role.repairer');
var roleMinerEnergy = require('role.miner.energy');
var creepSpawner = require('creep.spawner');
var roleClaimer = require('role.claimer');
var roleScout = require('role.scout');
var roleTransportRange = require('role.transport.range');

// RENEW CREEP LIVE https://docs.screeps.com/api/#StructureSpawn.renewCreep
var updateDataTimer = 100;
module.exports.loop = function () {
    var startGlobal = new Date().getTime();
    // delete Memory.scoutData;
    if (Memory.scoutData == null) {
        Memory.scoutData = {};
    }
    if (Memory.insufficentFarmRoute == null) {
        Memory.insufficentFarmRoute = {};
    }
    if (Memory.sufficentFarmRoute == null) {
        Memory.sufficentFarmRoute = {};
    }

    if (Memory.rangeFarmRange == null) {
        Memory.rangeFarmRange = 0;
    }
    if (Memory.rangeFarmData == null) {
        Memory.rangeFarmData = {};
    }

    if (updateDataTimer > 60) {
        var filteredRangeData = {};
        Object.keys(Memory.scoutData)
            .filter(
                (x) =>
                    Game.map.findRoute(Memory.scoutData[x].room, Game.spawns.Spawn1.room.name).length <=
                        Memory.rangeFarmRange && Memory.scoutData[x].sources.length >= 1
            )
            .sort((a, b) => {
                if (Memory.scoutData[a].distanceToBase.length < Memory.scoutData[b].distanceToBase.length) return -1;
                if (Memory.scoutData[a].distanceToBase.length > Memory.scoutData[b].distanceToBase.length) return 1;
                return 0;
            })
            .forEach(function (room) {
                filteredRangeData[room] = Memory.scoutData[room];
            });
        Memory.rangeFarmData = filteredRangeData;

        updateDataTimer = 0;
    } else {
        updateDataTimer++;
    }

    var tower = Game.getObjectById('5efed3cb60923c5cc1226994');
    if (tower) {
        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (closestHostile) {
            tower.attack(closestHostile);
        } else {
            if (tower.store[RESOURCE_ENERGY] > 500) {
                var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => structure.hits < structure.hitsMax && structure.hits < 400000,
                });
                if (closestDamagedStructure) {
                    tower.repair(closestDamagedStructure);
                }
            }
        }
    }

    for (var name in Game.rooms) {
        //   console.log('Room "' + name + '" has ' + Game.rooms[name].energyAvailable + ' energy');
    }
    {
        var start = new Date().getTime();
        for (var spawn in Game.spawns) {
            creepSpawner.run(Game.spawns[spawn]);
        }
        var end = new Date().getTime();
        var time = end - start;
        // console.log('Spawner Execution time: ' + time);
    }
    //creepSpawner.run(spawn);
    for (var name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            //  console.log('Clearing non-existing creep memory:', name);
        }
    }
    {
        var start = new Date().getTime();
        //   var zeit0 = performance.now();
        for (var name in Game.creeps) {
            var creep = Game.creeps[name];
            if (creep.memory.role == 'transport.spawn') {
                roleTransportSpawn.run(creep);
            }
            if (creep.memory.role == 'upgrader') {
                roleUpgrader.run(creep);
            }
            if (creep.memory.role == 'builder') {
                roleBuilder.run(creep);
            }
            if (creep.memory.role == 'repairer') {
                roleRepairer.run(creep);
            }
            if (creep.memory.role == 'miner.energy') {
                roleMinerEnergy.run(creep);
            }
            if (creep.memory.role == 'transport.range') {
                roleTransportRange.run(creep);
            }
            if (creep.memory.role == 'scout') {
                roleScout.run(creep);
            }
        }
        var end = new Date().getTime();
        var time = end - start;
        //      console.log('Creep Execution time: ' + time);*
    }
    Object.keys(Memory.rangeFarmData).forEach(function (room) {
        defendRoom(room);
    });

    var endGlobal = new Date().getTime();
    var timeGlobal = endGlobal - startGlobal;
    Game.spawns.Spawn1.room.visual.text('📌 Performance: ' + timeGlobal + ' ms', 0, 11, {
        align: 'left',
        opacity: 1,
        color: '#FFFFFF',
    });
    Game.spawns.Spawn1.room.visual.text('📌 Creeps: ' + Object.keys(Memory.creeps).length, 0, 12, {
        align: 'left',
        opacity: 1,
        color: '#FFFFFF',
    });
    Game.spawns.Spawn1.room.visual.text('📌 Ranged Rooms: ' + Object.keys(Memory.rangeFarmData).length, 0, 13, {
        align: 'left',
        opacity: 1,
        color: '#FFFFFF',
    });
    Game.spawns.Spawn1.room.visual.text('📌 Farm Range: ' + Memory.rangeFarmRange, 0, 15, {
        align: 'left',
        opacity: 1,
        color: '#FFFFFF',
    });

    // console.log('Global Execution time: ' + timeGlobal);

    // var zeit1 = performance.now();
    //console.log('Der Aufruf von machEtwas dauerte ' + (zeit1 - zeit0) + ' Millisekunden.');
};
function defendRoom(roomName) {
    if (Game.rooms[roomName] != undefined) {
        var defenders = _.filter(Game.creeps, (creep) => creep.memory.role == 'defender');

        defenders.forEach((defender) => {
            if (defender.memory.attackTarget != null) {
                var enemy = Game.getObjectById(defender.memory.attackTarget);
                if (enemy != null) {
                    if (defender.attack(enemy) == ERR_NOT_IN_RANGE) {
                        defender.moveTo(enemy, { visualizePathStyle: { stroke: '#FF0000' } });
                    }
                } else {
                    defender.memory.attackTarget = null;
                }
            } else {
                var hostiles = Game.rooms[roomName].find(FIND_HOSTILE_CREEPS);
                if (hostiles.length > 0) {
                    defender.memory.attackTarget = hostiles[0].id;
                } else {
                    defender.moveTo(Game.flags.MainDefence, { visualizePathStyle: { stroke: '#FF0000' } });
                }
            }
        });
    }
}
