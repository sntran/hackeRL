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

var ActorTemplates = {
    "☠": {
        hp: 3,
        damage: 1
    },
    "☣": {
        hp: 5,
        damage: 2
    },
    "[]": {
        hp: 10,
        damage: 5
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

        // Move the camera if player is near the edge of screen.
        var edge = 4;
        if (newPlayerX > (camera.x + props.fov - edge ) || newPlayerX < (camera.x-props.fov + edge)) {
            camera.x += offsetX;
        }
        if (newPlayerY > (camera.y + props.fov - edge ) || newPlayerY < (camera.y-props.fov + edge)) {
            camera.y += offsetY;
        }

        var passableCallback = function(x, y) {
            return self.isPassable(x, y);
        };
        var astar = new ROT.Path.AStar(newPlayerX, newPlayerY, this.isPassable, {topology:4});
        var newActors = {};
        // for (var key in actors) {
        //     var actor = actors[key];
        //     var parts = key2pos(key);
        //     var x = parts.x, y = parts.y;
        //     var path = [];
        //     astar.compute(x, y, function(pathX, pathY) { path.push([pathX, pathY]); });

        //     path.shift(); /* remove the actor's position */
        //     if (path.length === 0 || path.length === 1) {
        //         // This actor is next to the player.
        //         if (pos2key(newPlayerX, newPlayerY) === key) {
        //             // Don't move the player
        //             newPlayerY = oldPlayerX;
        //             newPlayerY = oldPlayerY;
        //             player.hp -= actor.damage;
        //             actor.hp -= player.damage;
        //             ga('send', 'event', 'turn', 'attack', self.turn+"-"+actor.type);
        //         }

        //         if (player.hp <= 0) {
        //             self.props.onGameEnd(false);
        //         }
        //         if (actor.hp > 0) {
        //             newActors[key] = actor;
        //         }
        //     } else if (path.length > 10) {
        //         var neighbors = [[-1,0], [1,0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]];
        //         neighbors = neighbors.map(function(offset) {
        //             var possibleX = x+offset[0], possibleY = y+offset[1];
        //             if (self.isPassable(possibleX, possibleY)) {
        //                 return pos2key(possibleX, possibleY);
        //             }
        //             return pos2key(x, y);
        //         });

        //         var index = Math.floor(ROT.RNG.getUniform() * neighbors.length);
        //         var newKey = neighbors.splice(index, 1)[0];
        //         newActors[newKey] = actor;
        //         freeTiles.push(key); // Release the tile the actor was on.
        //         ga('send', 'event', 'turn', 'normal', self.turn);
        //     } else {
        //         x = path[0][0];
        //         y = path[0][1];
        //         var newKey = pos2key(x, y);
        //         newActors[newKey] = actor;
        //         freeTiles.push(key); // Release the tile the actor was on.
        //         ga('send', 'event', 'turn', 'chased', self.turn+"-"+actor.type);
        //     }
        // }

        player.x = newPlayerX;
        player.y = newPlayerY;
        freeTiles.push(pos2key(oldPlayerX, oldPlayerY));// Release the tile the player was on.

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
            tileX = props.width/props.tileWidth,
            tileY = props.height/props.tileHeight,
            tiles = {}, actors = {},
            tileset = this.tileset,
            tileMap = new ROT.Map.Digger(tileX, tileY, {
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

        var camera = {x: posX, y: posY};

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
            tileY = props.height/tileHeight,
            tiles = state.tiles,
            player = state.player,
            camera = state.camera,
            actors = state.actors;

        var tileEntities = [];
        for (var i=0; i < props.fov*2; i++) {
            for (var j=0; j < props.fov*2; j++) {
                var screenX = i+(camera.x - props.fov);
                var screenY = j+(camera.y - props.fov);
                var key = pos2key(screenX, screenY);
                var symbol = "";
                if (screenX === player.x && screenY === player.y) symbol = "";
                else if (key in actors) symbol = actors[key].type;
                else symbol = tiles[key];
                var color = (symbol=="FF")? "#00f7fb" : (HackeRL.DEBUG? "green": "#fff");
                tileEntities.push(
                    <Entity key={"tile"+(screenX)+"-"+(screenY)} className={symbol === ""? "player" : ""}
                            width={tileWidth+"px"}
                            height={tileHeight+"px"}
                            x={i*tileWidth}
                            y={j*tileHeight}
                            sprite={symbol===""? "#aaa": color}
                    >
                        <span style={{color: "#111111"}}>{symbol}</span>
                    </Entity>
                )
            }
        }

        return tileEntities;
    },
    render: function() {
        var state = this.state, player = state.player, props = this.props;
        return (
            <Entity key="memoryMap" sprite="#111111" css={{overflow: "hidden"}}>
                {this.renderTiles()}

                <Entity key="actorsLayer" filter={false} ref="actorsLayer"
                        onActionLeft={this.handleTurn.bind(this, -1, 0)}
                        onActionRight={this.handleTurn.bind(this, 1, 0)}
                        onActionUp={this.handleTurn.bind(this, 0, -1)}
                        onActionDown={this.handleTurn.bind(this, 0, 1)}
                        onActionDebug={props.onDebug}
                >
                    <Entity key="goal"
                            width={props.tileWidth+"px"}
                            height={props.tileHeight+"px"}
                            x={state.goal.x*props.tileWidth}
                            y={state.goal.y*props.tileHeight}
                    >
                        <span style={{color: "blue"}}>✉</span>
                    </Entity>
                </Entity>
            </Entity>
        )
    },
    componentDidMount: function() {
        // Focus on the actors layer so that it can handle inputs.
        this.refs.actorsLayer.getDOMNode().focus();
    }
});
