/** @jsx React.DOM */
var merge = function(one, two) {
    var result = {};
    mergeInto(result, one);
    mergeInto(result, two);
    return result;
};

function mergeInto(one, two) {
    if (two != null) {
        for (var key in two) {
            if (!two.hasOwnProperty(key)) {
                continue;
            }
            one[key] = two[key];
        }
    }
}

function key2pos(key) {
    var pos = key.split(",");
    return {x: parseInt(pos[0]), y: parseInt(pos[1])};
}
function pos2key(x, y) {
    return x+","+y;
}
function clamp(number, min, max) {
    return Math.max(min, Math.min(number, max));
}

var ActorTemplates = {
    "☠": {
        hp: 120,
        damage: 140
    },
    "☣": {
        hp: 250,
        damage: 180
    },
    "[]": {
        hp: 350,
        damage: 220
    }
}

var FileTemplates = [
    function spawnEnemy(onDone) {
        var state = this.state, player = state.player, rooms = state.rooms,
            freeTiles = state.freeTiles, actors = state.actors;

        var x = player.x, y = player.y;
        var index = Math.floor(ROT.RNG.getUniform() * freeTiles.length);
        var key = freeTiles.splice(index, 1)[0];

        var types = Object.keys(ActorTemplates);
        index = Math.floor(ROT.RNG.getUniform() * types.length);
        actors[key] = new Actor(types[index]);
        console.log("Spawned", actors[key].type, "at", key);

        this.setState({actors: actors, freeTiles: freeTiles}, function() {
            this.handleTurn(0, 0);
            if (onDone) onDone(5);
        }.bind(this));
    },

    function freezeRoom(onDone) {
        var state = this.state, player = state.player, rooms = state.rooms,
            freeTiles = state.freeTiles, actors = state.actors;

        var x = player.x, y = player.y, currentRoom;
        rooms.forEach(function(room) {
            var left = room.getLeft(), top = room.getTop(),
                right = room.getRight(), bottom = room.getBottom();
            if (x > left && x < right && y > top && y < bottom) {
                currentRoom = room;
                for (var i = left; i <= right; i++) {
                    for (var j = top; j <= bottom; j++) {
                        var key = pos2key(i, j);
                        if (key in actors) {
                            console.log(actors[key].type, "is immobile");
                            actors[key].movable = false;
                        }
                    }
                }
            }
        });
        this.setState({actors: actors}, function() {
            this.handleTurn(0, 0);
            if (onDone) onDone(5);
        });
    },

    function teleport(onDone) {
        var state = this.state, player = state.player, freeTiles = state.freeTiles;
        var camera = this.state.camera, width = this.props.width, height = this.props.height;
        var index = "";
        do {
            index = Math.floor(ROT.RNG.getUniform() * freeTiles.length);
        } while (freeTiles[index] === pos2key(player.x, player.y));

        var newPos = key2pos(freeTiles.splice(index, 1)[0]);
        player.x = newPos.x;
        player.y = newPos.y;

        camera.x = clamp(newPos.x, Math.floor(camera.width/2), width-Math.floor(camera.width/2));
        camera.y = clamp(newPos.y, Math.floor(camera.height/2), height-Math.floor(camera.height/2));

        this.setState({player: player, freeTiles: freeTiles, camera: camera}, function() {
            this.handleTurn(0, 0);
            if (onDone) onDone(5);
        }.bind(this));
    }
]

var PossibleHex = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E"];

var Actor = function(type) {
    this.type = type;
    this.hp = ActorTemplates[type].hp;
    this.damage = ActorTemplates[type].damage;
    this.movable = true;
}

var TileMap = React.createClass({
    tileset: {
        1: "FF", // wall
        0: "00" // free
    },
    isPassable: function(x, y) {
        var key = pos2key(x, y);
        var tile = this.state.tiles[key];
        return (tile && tile !== this.tileset[1]);
    },
    computeCamera: function(mapper) {
        var fov = this.props.camera;
        for (var i=0; i < camera.width; i++) {
            for (var j=0; j < camera.height; j++) {
                var mapX = i+(camera.x - Math.ceil(camera.width/2));
                var mapY = j+(camera.y - Math.ceil(camera.height/2));
                mapper(mapX, mapY, i, j);
            }
        };
    },
    handleTurn: function(offsetX, offsetY) {
        var state = this.state; props = this.props;
        var player = state.player;
        var goal = state.goal;
        var freeTiles = state.freeTiles;
        var oldPlayerX = player.x;
        var oldPlayerY = player.y;
        var newPlayerX = oldPlayerX + offsetX;
        var newPlayerY = oldPlayerY + offsetY;
        var actors = state.actors; camera = state.camera;
        var self = this;

        var tiles = state.tiles;
        if (!this.isPassable(newPlayerX, newPlayerY)) {
            // Can't move in this direction
            return;
        }
        this.turn++;

        if (newPlayerX == goal.x && newPlayerY == goal.y) {
            // Acquired the goal.
            this.props.onGameEnd(true);
        }

        var astar = new ROT.Path.AStar(newPlayerX, newPlayerY, this.isPassable, {topology:4});
        var newActors = {};

        for (var key in actors) {
            var actor = actors[key];
            var parts = key2pos(key);
            var x = parts.x, y = parts.y;
            var path = [];
            astar.compute(x, y, function(pathX, pathY) { path.push([pathX, pathY]); });

            path.shift(); /* remove the actor's position */
            if (path.length === 0 || path.length === 1) {
                // This actor is next to the player.
                if (pos2key(newPlayerX, newPlayerY) === key) {
                    // Don't move the player
                    newPlayerX = oldPlayerX;
                    newPlayerY = oldPlayerY;
                    // Player hits first
                    var playerDmg = randomIntFromInterval(player.damage-20, player.damage);
                    console.log("Player hit", actor.type, "with", playerDmg, "damage.");
                    actor.hp -= playerDmg;

                    if (actor.hp > 0) {
                        if (actor.movable) {
                            // If enemy is still alive, player is attacked.
                            var actorDmg = randomIntFromInterval(actor.damage-20, actor.damage);
                            player.hp += actorDmg;
                            console.log(actor.type, "hit player with", actorDmg, "damage.")
                        }
                        newActors[key] = actor;
                    }
                    ga('send', 'event', 'turn', 'attack', self.turn+"-"+actor.type);
                } else if (actor.movable) {
                    // Player is coming to the tile next to this actor.
                    var actorDmg = randomIntFromInterval(actor.damage-20, actor.damage);
                    player.hp += actorDmg;
                    console.log(actor.type, "hit player with", actorDmg, "damage.")
                    newActors[key] = actor;
                } else {
                    // Can't move;
                    newActors[key] = actor;
                }

                if (player.hp > player.limit) {
                    self.props.onGameEnd(false);
                }
            } else if (path.length > 10 && actor.movable) {
                // Too far
                var neighbors = [[-1,0], [1,0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]];
                neighbors = neighbors.map(function(offset) {
                    var possibleX = x+offset[0], possibleY = y+offset[1];
                    if (self.isPassable(possibleX, possibleY)) {
                        return pos2key(possibleX, possibleY);
                    }
                    return pos2key(x, y);
                });

                var index = Math.floor(ROT.RNG.getUniform() * neighbors.length);
                var newKey = neighbors.splice(index, 1)[0];
                newActors[newKey] = actor;
                freeTiles.push(key); // Release the tile the actor was on.
                ga('send', 'event', 'turn', 'normal', self.turn);
            } else if (actor.movable) {
                // Chase the player
                x = path[0][0];
                y = path[0][1];
                var newKey = actor.movable? pos2key(x, y) : key;
                newActors[newKey] = actor;
                freeTiles.push(key); // Release the tile the actor was on.
                ga('send', 'event', 'turn', 'chased', self.turn+"-"+actor.type);
            } else {
                // Can't move;
                newActors[key] = actor;
            }
        }
        self.props.onUsageChange(player);

        player.x = newPlayerX;
        player.y = newPlayerY;
        freeTiles.push(pos2key(oldPlayerX, oldPlayerY));// Release the tile the player was on.

        //Move the camera if player is near the edge of screen.
        var edgeX = Math.floor(camera.width/4), edgeY = Math.floor(camera.height/4);
        if ((newPlayerX > (camera.x + edgeX) && offsetX > 0) || (newPlayerX < (camera.x-edgeX) && offsetX < 0)) {
            camera.x = clamp(camera.x+offsetX, Math.ceil(camera.width/2), props.width-Math.floor(camera.width/2));
        }
        if ((newPlayerY > (camera.y + edgeY) && offsetY > 0) || (newPlayerY < (camera.y-edgeY) && offsetY < 0)) {
            camera.y = clamp(camera.y+offsetY, Math.floor(camera.height/2), props.height-Math.floor(camera.height/2));
        }

        // Remove the tiles the player and actors are on.
        freeTiles = freeTiles.filter(function (oldFreeTileKey, idx) {
            var isPlayer = oldFreeTileKey === pos2key(newPlayerX, newPlayerY);
            var isActor = (oldFreeTileKey in newActors);
            return (!isPlayer && !isActor);
        });

        this.setState({
            player: player,
            camera: camera,
            actors: newActors,
            freeTiles: freeTiles
        });
    },
    handleHotKey: function(keyCode) {
        var player = this.state.player, mapFiles = this.state.files;
        switch (keyCode) {
            case 67: // C
            case 88: // X
                var key = pos2key(player.x, player.y);
                if (key in mapFiles) {
                    player.files.push(mapFiles[key]);
                    if (keyCode === 88) {
                        delete mapFiles[key];
                    }
                    self.props.onUsageChange(player);
                    this.setState({player: player, files: mapFiles}, function() {
                        this.handleTurn(0, 0);
                    }.bind(this));
                }
                break;
            case 48: // 0
            case 49: // 1
            case 50: // 2
            case 51: // 3
            case 52: // 4
            case 53: // 5
            case 54: // 6
            case 55: // 7
            case 56: // 8
            case 57: // 9
                var slot = keyCode - 48 - 1;
                var file = player.files[slot];
                if (file) {
                    file.action(function (remainingUses) {
                        if (remainingUses === 0) {
                            player.files.splice(slot, 1);
                            this.props.onUsageChange(player)
                            this.setState({player: player});
                        }
                    }.bind(this));
                }
                break;
        }
    },
    getInitialState: function() {
        this.turn = 0;
        var self = this, props = self.props,
            width = props.width,
            height = props.height,
            tiles = {}, actors = {},
            tileset = this.tileset,
            tileMap = new ROT.Map.Digger(width, height, {
                roomWidth: [5, 10],
                roomHeight: [5, 10],
                dugPercentage: 0.5
            });

        // Generate a map with at least certain number of rooms
        var freeTiles = [], rooms;
        do {
            freeTiles.length = 0;
            tiles = {};
            tileMap.create(function (x, y, value) {
                var key = x+","+y;
                if (!value) freeTiles.push(key);
                tiles[key] = tileset[value];
            });
            rooms = tileMap.getRooms();
        } while (rooms.length < 10);

        // Genrate the locations of the actors.
        while (this.props.enemies--) {
            var index = Math.floor(ROT.RNG.getUniform() * freeTiles.length);
            var key = freeTiles.splice(index, 1)[0];
            // @TODO: Different types of enemy.
            var types = Object.keys(ActorTemplates);
            index = Math.floor(ROT.RNG.getUniform() * types.length);
            actors[key] = new Actor(types[index]);
        }

        // Spawn the player at a random location.
        var index = Math.floor(ROT.RNG.getUniform() * freeTiles.length);
        var key = freeTiles.splice(index, 1)[0];
        var position = key.split(",");
        var posX = parseInt(position[0]);
        var posY = parseInt(position[1]);

        var cameraWidth = Math.floor(props.viewportWidth/props.tileWidth);
        var cameraHeight = Math.floor(props.viewportHeight/props.tileHeight);
        var camera = {
            x: clamp(posX, Math.floor(cameraWidth/2), width-Math.floor(cameraWidth/2)), 
            y: clamp(posY, Math.floor(cameraHeight/2), height-Math.floor(cameraHeight/2)),
            width: cameraWidth,
            height: cameraHeight
        };

        // Find the furthest free tile and put the goal there
        var passableCallback = function(x, y) {
            var key = pos2key(x, y);
            var tile = tiles[key];
            return (tile && tile !== self.tileset[1]);
        }
        var astar = new ROT.Path.AStar(posX, posY, passableCallback);

        var furthestKeyIdx = 0, furthestLength = 0;
        freeTiles.forEach(function (key, idx) {
            var pathLength = 0;
            var pathCallback = function(pathX, pathY) {
                pathLength++;
            }
            var pos = key2pos(key);
            astar.compute(pos.x, pos.y, pathCallback);
            if (pathLength > furthestLength) {
                furthestLength = pathLength;
                furthestKeyIdx = idx;
            }
        });
        var goal = key2pos(freeTiles.splice(furthestKeyIdx, 1)[0]);

        var numberOfFiles = randomIntFromInterval(1, FileTemplates.length);
        var files = {};
        while (numberOfFiles--) {
            var fileIdx = Math.floor(ROT.RNG.getUniform() * freeTiles.length);
            var fileKey = freeTiles.splice(fileIdx, 1)[0];
            var file = key2pos(fileKey);
            var hexIdx = Math.floor(ROT.RNG.getUniform() * PossibleHex.length);
            var firstDigit = PossibleHex[hexIdx] + "";
            hexIdx = Math.floor(ROT.RNG.getUniform() * PossibleHex.length);
            var secondDigit = PossibleHex[hexIdx] + "";
            file.type = firstDigit + secondDigit;
            var actionIdx = Math.floor(ROT.RNG.getUniform() * FileTemplates.length)
            file.action = (FileTemplates.splice(actionIdx, 1)[0]).bind(this);
            // file.action = FileTemplates[1].bind(this);
            files[fileKey] = file;
        }

        return {
            tiles: tiles,
            freeTiles: freeTiles,
            rooms: rooms,
            actors: actors,
            camera: camera,
            player: {
                x: posX,
                y: posY,
                files: []
            },
            goal: goal,
            files: files,
        };
    },
    componentWillMount: function() {
        // We use the props of the entity passed as the child of this
        // component as the player's extra props, such as HP and DMG.
        var playerComp = this.props.children;
        var newPlayer = merge(this.state.player, playerComp.props)
        this.setState({player: newPlayer});
    },
    renderTiles: function() {
        var props = this.props, state = this.state;
            tileWidth = props.tileWidth,
            tileHeight = props.tileHeight,
            height = props.height,
            tiles = state.tiles,
            player = state.player,
            goal = state.goal,
            files = state.files,
            camera = state.camera,
            actors = state.actors;

        var entities = [];

        this.computeCamera(function (mapX, mapY, screenX, screenY) {
            var key = pos2key(mapX, mapY);
            var symbol = "";
            if (mapX === player.x && mapY === player.y) symbol = "";
            else if (mapX === goal.x && mapY === goal.y) symbol = "✉";
            else if (key in actors) symbol = actors[key].type;
            else if (key in files) symbol = files[key].type;
            else symbol = tiles[key];
            var color = (symbol=="FF")? "#00f7fb" : (HackeRL.DEBUG? "green": "#fff");

            var entityWdith = symbol === ""? 22 : tileWidth;
            entities.push(
                <Entity key={"tile"+(mapX)+"-"+(mapY)} className={symbol === ""? "player" : ""}
                        width={entityWdith+"px"}
                        height={tileHeight+"px"}
                        x={screenX*tileWidth}
                        y={screenY*tileHeight}
                        sprite={symbol===""? "#aaa": color}
                >
                    <span style={{
                        color: (symbol in ActorTemplates)? "red" :
                                (symbol == "00" || symbol == "FF")? "#111111" : "blue"
                    }}>{symbol}</span>
                </Entity>
            )
        });

        return entities;
    },
    render: function() {
        var state = this.state, player = state.player, props = this.props;
        return (
            <Entity key="memoryMap" css={{overflow: "hidden", fontSize: "20px"}}>
                {this.renderTiles()}

                <Entity key="actorsLayer" filter={false} ref="actorsLayer"
                        onActionLeft={this.handleTurn.bind(this, -1, 0)}
                        onActionRight={this.handleTurn.bind(this, 1, 0)}
                        onActionUp={this.handleTurn.bind(this, 0, -1)}
                        onActionDown={this.handleTurn.bind(this, 0, 1)}
                        onActionDebug={props.onDebug}
                        onKey={this.handleHotKey}
                >
                </Entity>
            </Entity>
        )
    },
    componentDidMount: function() {
        // Focus on the actors layer so that it can handle inputs.
        this.refs.actorsLayer.getDOMNode().focus();
    }
});
