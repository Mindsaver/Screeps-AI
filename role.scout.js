/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.scout');
 * mod.thing == 'a thing'; // true
 */

const { upperFirst } = require('lodash');

function storeExplorationInfo(creep) {
    try {
        var scoutData = {
            room: creep.room.name,
            sources: creep.room.find(FIND_SOURCES),
            minerals: creep.room.find(FIND_MINERALS),
            hostileCreeps: creep.room.find(FIND_HOSTILE_CREEPS).length,
            hostileStructures: creep.room.find(FIND_HOSTILE_STRUCTURES).length,
            hostileSpawns: creep.room.find(FIND_HOSTILE_SPAWNS).length,
            hostileConstructions: creep.room.find(FIND_HOSTILE_CONSTRUCTION_SITES).length,
            distanceToBase: Game.map.findRoute(Game.spawns['Spawn1'].room, creep.room),
        };
        // console.log(scoutData.distanceToBase.length);
        if (Memory.scoutData[creep.room.name] == null) {
            console.log('NEW ROOM DISCOVERED: ' + creep.room.name);
        }
        Memory.scoutData[creep.room.name] = scoutData;
    } catch (error) {}
    /* const ordered = {};
    Object.keys(Game.spawns['Spawn1'].memory.scoutData)
        .sort((a, b) => {
            if (
                Game.spawns['Spawn1'].memory.scoutData[a].distanceToBase.length <
                Game.spawns['Spawn1'].memory.scoutData[b].distanceToBase.length
            )
                return -1;
            if (
                Game.spawns['Spawn1'].memory.scoutData[a].distanceToBase.length >
                Game.spawns['Spawn1'].memory.scoutData[b].distanceToBase.length
            )
                return 1;
            return 0;
        })
        .forEach(function (key) {
            ordered[key] = Game.spawns['Spawn1'].memory.scoutData[key];
        });
    //  console.log(Object.keys(ordered));
    // console.log();
    /* Game.spawns['Spawn1'].memory.scoutData[creep.room.name].sort((a, b) => {
        if (a.distanceToBase < b.distanceToBase) return -1;
        if (a.distanceToBase > b.distanceToBase) return 1;
        return 0;
    });*/
}

var roleScout = {
    run: function (creep) {
        try {
            // creep.suicide();
            // console.log(creep.room.name);
            // var re = /(\w)(\d{1,2})(\w)(\d{1,2})/;
            //  var found = creep.room.name.match(re);
            //  console.log(found);

            // console.log(JSON.stringify(Game.map.findRoute('W7N2', 'W0N4')));
            //  console.log(creep.memory.nextRoom);
            // console.log(creep.room.name);
            if (creep.memory.nextRoom == creep.room.name || creep.memory.nextRoom == undefined) {
                //   console.log('Test');
                storeExplorationInfo(creep);
                var exits = Game.map.describeExits(creep.room.name);
                var countExits = 0;
                if (exits['1']) {
                    countExits++;
                }
                if (exits['3']) {
                    countExits++;
                }
                if (exits['5']) {
                    countExits++;
                }
                if (exits['7']) {
                    countExits++;
                }

                var exitID = getRandomInt(0, countExits);
                //   console.log(exitID);
                // console.log('OLD ROOM:' + creep.memory.nextRoom);
                if (exitID == 0) {
                    creep.memory.nextRoom = exits['1'];
                } else if (exitID == 1) {
                    creep.memory.nextRoom = exits['3'];
                } else if (exitID == 2) {
                    creep.memory.nextRoom = exits['5'];
                } else if (exitID == 3) {
                    creep.memory.nextRoom = exits['7'];
                }
                // console.log('NEW ROOM:' + creep.memory.nextRoom);
            }

            if (creep.room.name != creep.memory.nextRoom && creep.memory.nextRoom != undefined) {
                if (typeof creep.memory.nextRoom == 'object') {
                    creep.memory.nextRoom == undefined;
                    return;
                }
                creep.moveTo(new RoomPosition(25, 25, creep.memory.nextRoom), { stroke: '#00ff00' });
                //console.log(creep.moveTo(exitDir[0]));
            }
        } catch (error) {
            creep.suicide();
        }
    },
};

module.exports = roleScout;

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
