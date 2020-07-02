var creepBodyParts = {
    move: 50,
    work: 100,
    carry: 50,
    attack: 80,
    ranged_attack: 150,
    heal: 250,
    claim: 600,
    tough: 10,
};

var creepSettings = {
    miner: {
        base: [CARRY, MOVE, WORK],
        extensions: [WORK],
    },
    transport: {
        base: [MOVE, CARRY],
        extensions: [MOVE, CARRY],
    },
    builder: {
        base: [WORK, MOVE, CARRY],
        extensions: [WORK, MOVE, CARRY],
    },
    transport_build: {
        base: [MOVE, CARRY, WORK],
        extensions: [MOVE, CARRY, WORK],
    },
};

function calcBaseCost(creep) {
    var cost = 0;
    creepSettings[creep].base.forEach((body) => {
        cost += creepBodyParts[body];
    });
    return cost;
}

function getBodyParts(creep, maxEnergy) {
    let cost = calcBaseCost(creep);
    let bodyModules = creepSettings[creep].base;

    while (true) {
        var changed = false;
        creepSettings[creep].extensions.forEach((body) => {
            if (cost + creepBodyParts[body] <= maxEnergy) {
                cost += creepBodyParts[body];
                bodyModules.push(body);
                changed = true;
            }
        });
        if (!changed) {
            break;
        }
    }
    return bodyModules;
}

var roleBuilder = {
    /** @param {Creep} creep **/
    run: function (spawn) {
        var currentCreepCount = spawn.room.find(FIND_MY_CREEPS).length;
        if (spawn.memory.currentCreeps == 0 || spawn.memory.currentCreeps < currentCreepCount) {
            spawn.memory.currentCreeps = spawn.room.find(FIND_MY_CREEPS).length;
        }
        var maxEnergy = spawn.room.energyCapacityAvailable;
        if (currentCreepCount < spawn.memory.currentCreeps - 3 || currentCreepCount < 3) {
            maxEnergy = 300;
        }

        var minerEnergy = _.filter(Game.creeps, (creep) => creep.memory.role == 'miner.energy');
        if (minerEnergy.length < 4) {
            var newName = 'Miner.Energy' + Game.time;
            console.log('Spawning new creep: ' + newName);
            spawn.spawnCreep(getBodyParts('miner', spawn.room.energyCapacityAvailable), newName, {
                memory: { role: 'miner.energy' },
            });
            return;
        }

        var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'transport.spawn');
        if (harvesters.length < 3) {
            var newName = 'Transport Spawn' + Game.time;
            console.log('Spawning new creep: ' + newName);
            spawn.spawnCreep(getBodyParts('transport', spawn.room.energyCapacityAvailable), newName, {
                memory: { role: 'transport.spawn' },
            });

            return;
        }
        var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');

        if (upgraders.length < 5) {
            var newName = 'Upgrader' + Game.time;
            console.log('Spawning new creep: ' + newName);
            spawn.spawnCreep(getBodyParts('transport_build', spawn.room.energyCapacityAvailable), newName, {
                memory: { role: 'upgrader' },
            });
            return;
        }
        var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');

        if (builders.length < 3) {
            var newName = 'Builder' + Game.time;
            console.log('Spawning new creep: ' + newName);
            spawn.spawnCreep(getBodyParts('builder', spawn.room.energyCapacityAvailable), newName, {
                memory: { role: 'builder' },
            });
            return;
        }

        var repairer = _.filter(Game.creeps, (creep) => creep.memory.role == 'repairer');

        if (repairer.length < 3) {
            var newName = 'Repairer' + Game.time;
            console.log('Spawning new creep: ' + newName);
            spawn.spawnCreep(getBodyParts('transport_build', spawn.room.energyCapacityAvailable), newName, {
                memory: { role: 'repairer' },
            });
        }

        if (spawn.spawning) {
            var spawningCreep = Game.creeps[spawn.spawning.name];
            spawn.room.visual.text('🛠️' + spawningCreep.memory.role, spawn.pos.x + 1, spawn.pos.y, {
                align: 'left',
                opacity: 0.8,
            });
        }
    },
};

module.exports = roleBuilder;
