var roleTransportSpawn = require('role.tansport.spawn');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleRepairer = require('role.repairer');
var roleMinerEnergy = require('role.miner.energy');
var creepSpawner = require('creep.spawner');
var roleClaimer = require('role.claimer');

// RENEW CREEP LIVE https://docs.screeps.com/api/#StructureSpawn.renewCreep

module.exports.loop = function () {
    var tower = Game.getObjectById('5efdf7f058a8675cc2a88fad');
    if (tower) {
        var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax && structure.hits < 200000,
        });
        if (closestDamagedStructure) {
            tower.repair(closestDamagedStructure);
        }

        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (closestHostile) {
            tower.attack(closestHostile);
        }
    }
    for (var name in Game.rooms) {
        //   console.log('Room "' + name + '" has ' + Game.rooms[name].energyAvailable + ' energy');
    }
    for (var spawn in Game.spawns) {
        creepSpawner.run(Game.spawns[spawn]);
    }
    //creepSpawner.run(spawn);
    for (var name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

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
        if (creep.memory.role == 'claimer') {
            roleClaimer.run(creep, 'W7N3');
        }
    }
};
