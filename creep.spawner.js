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
        max: 700,
    },
    miner_range: {
        base: [MOVE, MOVE, MOVE, WORK, WORK, WORK],
        extensions: [],
        max: 700,
    },

    transport: {
        base: [MOVE, CARRY],
        extensions: [MOVE, CARRY, CARRY],
        max: 700,
    },
    transport_range: {
        base: [CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE],
        extensions: [],
        max: 700,
    },
    builder: {
        base: [WORK, MOVE, CARRY],
        extensions: [WORK, MOVE, CARRY],
        max: 700,
    },
    transport_build: {
        base: [MOVE, CARRY, WORK],
        extensions: [MOVE, CARRY, MOVE, WORK],
        max: 1000,
    },
    scout: {
        base: [MOVE],
        extensions: [],
        max: 700,
    },
    defender: {
        base: [ATTACK, ATTACK, MOVE, MOVE, TOUGH, TOUGH],
        extensions: [MOVE, MOVE, TOUGH, TOUGH, ATTACK, TOUGH],
        max: 700,
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
    if (maxEnergy > creepSettings[creep].max) {
        maxEnergy = creepSettings[creep].max;
    }
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
        var rangeFarmRange = Memory.rangeFarmRange;

        if (spawn.room.controller.level >= 3 && rangeFarmRange == 0) {
            Memory.rangeFarmRange = 1;
        }

        if (spawn.spawning) {
            var spawningCreep = Game.creeps[spawn.spawning.name];
            spawn.room.visual.text('🛠️' + spawningCreep.memory.role, spawn.pos.x + 1, spawn.pos.y, {
                align: 'left',
                opacity: 0.8,
            });
        }

        spawn.room.visual.text(
            '⭐ Energy: ' + spawn.room.energyAvailable + '/' + spawn.room.energyCapacityAvailable,
            0,
            14,
            {
                align: 'left',
                opacity: 1,
                color: '#FFFFFF',
            }
        );

        var currentCreepCount = spawn.room.find(FIND_MY_CREEPS).length;
        if (spawn.memory.currentCreeps == 0 || spawn.memory.currentCreeps < currentCreepCount) {
            spawn.memory.currentCreeps = spawn.room.find(FIND_MY_CREEPS).length;
        }
        var maxEnergy = spawn.room.energyCapacityAvailable;

        var miners = _.filter(
            Game.creeps,
            (creep) =>
                creep.memory.role == 'miner.energy' && creep.memory.room == spawn.room.name && creep.ticksToLive > 100
        );
        var harvesters = _.filter(
            Game.creeps,
            (creep) => creep.memory.role == 'transport.spawn' && creep.memory.room == spawn.room.name
        );
        if (miners.length < 1 || harvesters.length < 1) {
            maxEnergy = 300;
            console.log('ALARMALARMALARM MAX ENGERY NOW 300');
        }

        if (miners.length < 2) {
            var newName = 'Miner.Energy' + Game.time;
            console.log('Spawning new creep: ' + newName);
            spawn.spawnCreep(getBodyParts('miner', maxEnergy), newName, {
                memory: { role: 'miner.energy', room: spawn.room.name },
            });
            return;
        }

        if (harvesters.length < 3) {
            var newName = 'Transport Spawn' + Game.time;
            console.log('Spawning new creep: ' + newName);
            spawn.spawnCreep(getBodyParts('transport', maxEnergy), newName, {
                memory: { role: 'transport.spawn', room: spawn.room.name },
            });

            return;
        }
        var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');

        if (upgraders.length < 6) {
            var newName = 'Upgrader' + Game.time;
            console.log('Spawning new creep: ' + newName);
            spawn.spawnCreep(getBodyParts('transport_build', maxEnergy), newName, {
                memory: { role: 'upgrader', room: spawn.room.name },
            });
            return;
        }
        var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');

        if (builders.length < 2) {
            var newName = 'Builder' + Game.time;
            console.log('Spawning new creep: ' + newName);
            spawn.spawnCreep(getBodyParts('builder', maxEnergy), newName, {
                memory: { role: 'builder', room: spawn.room.name },
            });
            return;
        }

        var repairer = _.filter(Game.creeps, (creep) => creep.memory.role == 'repairer');

        if (repairer.length < 2) {
            var newName = 'Repairer' + Game.time;
            console.log('Spawning new creep: ' + newName);
            spawn.spawnCreep(getBodyParts('transport_build', maxEnergy), newName, {
                memory: { role: 'repairer', room: spawn.room.name },
            });
            return;
        }
        var scouts = _.filter(Game.creeps, (creep) => creep.memory.role == 'scout');

        if (scouts.length < 0) {
            var newName = 'Scout' + Game.time;
            console.log('Spawning new creep: ' + newName);
            spawn.spawnCreep(getBodyParts('scout', maxEnergy), newName, {
                memory: { role: 'scout' },
            });
            return;
        }
        var defenders = _.filter(Game.creeps, (creep) => creep.memory.role == 'defender');

        if (defenders.length < 2) {
            var newName = 'Defender' + Game.time;
            console.log('Spawning new creep: ' + newName);
            spawn.spawnCreep(getBodyParts('defender', maxEnergy), newName, {
                memory: { role: 'defender' },
            });
            return;
        }
        var BreakException = {};
        try {
            Object.keys(Memory.rangeFarmData).forEach(function (room) {
                if (room != spawn.room.name) {
                    var rangeMiners = _.filter(
                        Game.creeps,
                        (creep) =>
                            creep.memory.role == 'miner.energy' && creep.memory.room == room && creep.ticksToLive > 100
                    );
                    //
                    if (rangeMiners.length < Memory.scoutData[room].sources.length) {
                        var newName = 'Range Miner Energy (' + room + ') #' + Game.time;
                        //  console.log('Spawning new creep: ' + newName);
                        spawn.spawnCreep(getBodyParts('miner_range', maxEnergy), newName, {
                            memory: { role: 'miner.energy', room: room, energyUsed: maxEnergy },
                        });
                        throw BreakException;
                    }
                    var rangeTransporters = _.filter(
                        Game.creeps,
                        (creep) =>
                            creep.memory.role == 'transport.range' &&
                            creep.memory.room == room &&
                            creep.ticksToLive > 100
                    );
                    if (
                        rangeTransporters.length <
                        Memory.scoutData[room].sources.length * 2 + Memory.scoutData[room].distanceToBase.length
                    ) {
                        var newName = 'Range Transport (' + room + ') #' + Game.time;
                        //   console.log('Spawning new creep: ' + newName);
                        spawn.spawnCreep(getBodyParts('transport_range', maxEnergy), newName, {
                            memory: { role: 'transport.range', room: room, energyUsed: maxEnergy },
                        });

                        throw BreakException;
                    }
                }
            });
        } catch (e) {
            if (e !== BreakException) throw e;
            return;
        }
        /* if (filteredRangeFarms.length > 0) {
            Memory.rangeFarmRange = Memory.rangeFarmRange + 1;
        }*/
        //    console.log('END');
        /*     */
    },
};

module.exports = roleBuilder;
