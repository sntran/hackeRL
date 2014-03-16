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
        damage: 260
    },
    "[]": {
        hp: 350,
        damage: 320
    }
}

var Actor = function(type) {
    this.type = type;
    this.hp = ActorTemplates[type].hp;
    this.damage = ActorTemplates[type].damage;
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
                    newPlayerY = oldPlayerX;
                    newPlayerY = oldPlayerY;
                    // Player hits first
                    var playerDmg = randomIntFromInterval(player.damage-20, player.damage);
                    console.log("Player hit", actor.type, "with", playerDmg, "damage.");
                    actor.hp -= playerDmg;

                    if (actor.hp > 0) {
                        // If enemy is still alive, player is attacked.
                        var actorDmg = randomIntFromInterval(actor.damage-20, actor.damage);
                        player.hp += actorDmg;
                        console.log(actor.type, "hit player with", actorDmg, "damage.")
                        newActors[key] = actor;
                    }
                    ga('send', 'event', 'turn', 'attack', self.turn+"-"+actor.type);
                }

                if (player.hp > player.limit) {
                    self.props.onGameEnd(false);
                }
                self.props.onUsageChange(player.hp);
            } else if (path.length > 10) {
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
            } else {
                x = path[0][0];
                y = path[0][1];
                var newKey = pos2key(x, y);
                newActors[newKey] = actor;
                freeTiles.push(key); // Release the tile the actor was on.
                ga('send', 'event', 'turn', 'chased', self.turn+"-"+actor.type);
            }
        }

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

        return {
            tiles: tiles,
            freeTiles: freeTiles,
            rooms: rooms,
            actors: actors,
            camera: camera,
            player: {
                x: posX,
                y: posY
            },
            goal: goal
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
            camera = state.camera,
            actors = state.actors;

        var entities = [];

        this.computeCamera(function (mapX, mapY, screenX, screenY) {
            var key = pos2key(mapX, mapY);
            var symbol = "";
            if (mapX === player.x && mapY === player.y) symbol = "";
            else if (mapX === goal.x && mapY === goal.y) symbol = "✉";
            else if (key in actors) symbol = actors[key].type;
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
                    <span style={{color: "#111111"}}>{symbol}</span>
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
