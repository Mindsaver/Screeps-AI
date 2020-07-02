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
    scout: {
        base: [MOVE],
        extensions: [],
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
        if (spawn.spawning) {
            var spawningCreep = Game.creeps[spawn.spawning.name];
            spawn.room.visual.text('🛠️' + spawningCreep.memory.role, spawn.pos.x + 1, spawn.pos.y, {
                align: 'left',
                opacity: 0.8,
            });
        }

        var currentCreepCount = spawn.room.find(FIND_MY_CREEPS).length;
        if (spawn.memory.currentCreeps == 0 || spawn.memory.currentCreeps < currentCreepCount) {
            spawn.memory.currentCreeps = spawn.room.find(FIND_MY_CREEPS).length;
        }
        var maxEnergy = spawn.room.energyCapacityAvailable;
        var miners = _.filter(Game.creeps, (creep) => creep.memory.role == 'miner.energy');
        var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'transport.spawn');
        if (miners.length < 2 || harvesters.length < 2) {
            maxEnergy = 300;
            console.log('ALARMALARMALARM MAX ENGERY NOW 300');
        }

        if (miners.length < 4) {
            var newName = 'Miner.Energy' + Game.time;
            console.log('Spawning new creep: ' + newName);
            spawn.spawnCreep(getBodyParts('miner', maxEnergy), newName, {
                memory: { role: 'miner.energy' },
            });
            return;
        }

        if (harvesters.length < 3) {
            var newName = 'Transport Spawn' + Game.time;
            console.log('Spawning new creep: ' + newName);
            spawn.spawnCreep(getBodyParts('transport', maxEnergy), newName, {
                memory: { role: 'transport.spawn' },
            });

            return;
        }
        var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');

        if (upgraders.length < 3) {
            var newName = 'Upgrader' + Game.time;
            console.log('Spawning new creep: ' + newName);
            spawn.spawnCreep(getBodyParts('transport_build', maxEnergy), newName, {
                memory: { role: 'upgrader' },
            });
            return;
        }
        var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');

        if (builders.length < 2) {
            var newName = 'Builder' + Game.time;
            console.log('Spawning new creep: ' + newName);
            spawn.spawnCreep(getBodyParts('builder', maxEnergy), newName, {
                memory: { role: 'builder' },
            });
            return;
        }

        var repairer = _.filter(Game.creeps, (creep) => creep.memory.role == 'repairer');

        if (repairer.length < 2) {
            var newName = 'Repairer' + Game.time;
            console.log('Spawning new creep: ' + newName);
            spawn.spawnCreep(getBodyParts('transport_build', maxEnergy), newName, {
                memory: { role: 'repairer' },
            });
            return;
        }
        var scouts = _.filter(Game.creeps, (creep) => creep.memory.role == 'scout');

        if (scouts.length < 10) {
            var newName = 'Scout' + Game.time;
            console.log('Spawning new creep: ' + newName);
            spawn.spawnCreep(getBodyParts('scout', maxEnergy), newName, {
                memory: { role: 'scout' },
            });
            return;
        }
    },
};

module.exports = roleBuilder;
