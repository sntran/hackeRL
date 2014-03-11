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

var TileMap = React.createClass({
    tileset: {
        1: "FF", // wall
        0: "00" // free
    },
    isPassable: function(x, y) {
        var key = x+","+y;
        var tile = this.state.tiles[key];
        return (tile && tile !== this.tileset[1]);
    },
    handleTurn: function(offsetX, offsetY) {
        var player = this.state.player;
        var newX = player.x + offsetX;
        var newY = player.y + offsetY;
        var actors = this.state.actors;
        var self = this;

        var tiles = this.state.tiles;
        if (!this.isPassable(newX, newY)) { 
            // Can't move in this direction
            return; 
        }

        var passableCallback = function(x, y) {
            return self.isPassable(x, y);
        }
        var astar = new ROT.Path.AStar(newX, newY, passableCallback, {topology:4});
        var newActors = {};
        for (var key in actors) {
            var value = actors[key];
            var parts = key.split(",");
            var x = parseInt(parts[0]), y = parseInt(parts[1]);
            var path = [];
            var pathCallback = function(pathX, pathY) {
                path.push([pathX, pathY]);
            }
            astar.compute(x, y, pathCallback);

            path.shift(); /* remove the actor's position */
            if (path.length == 1) {
                // This actor is next to the player.
                // @TODO: Solve conflict
                newActors[key] = value;

            } else if (path.length > 10) {
                var neighbors = [[-1,0], [1,0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]];
                neighbors = neighbors.map(function(offset) {
                    var possibleX = x+offset[0], possibleY = y+offset[1];
                    if (self.isPassable(possibleX, possibleY)) {
                        return (possibleX+","+possibleY);
                    }
                    return x+","+y;
                });

                var index = Math.floor(ROT.RNG.getUniform() * neighbors.length);
                var newKey = neighbors.splice(index, 1)[0];
                newActors[newKey] = value;
            } else {
                x = path[0][0];
                y = path[0][1];
                var newKey = x+","+y;
                newActors[newKey] = value;
            }
        }

        player.x = newX;
        player.y = newY;
        
        this.setState({
            player: player,
            actors: newActors
        });
    },
    getInitialState: function() {
        var props = this.props,
            tileX = props.width/props.tileWidth,
            tileY = props.height/props.tileHeight,
            tiles = {}, actors = {},
            tileset = this.tileset,
            tileMap = new ROT.Map.Digger(tileX, tileY, {
                roomWidth: [5, 10],
                roomHeight: [5, 10],
                dugPercentage: 0.5
            });

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

        while (this.props.enemies--) {
            var index = Math.floor(ROT.RNG.getUniform() * freeTiles.length);
            var key = freeTiles.splice(index, 1)[0];
            // @TODO: Different types of enemy.
            actors[key] = "XX";
        }

        var index = Math.floor(ROT.RNG.getUniform() * freeTiles.length);
        var key = freeTiles.splice(index, 1)[0];
        var position = key.split(",");
        var posX = parseInt(position[0]);
        var posY = parseInt(position[1]);

        return {
            tiles: tiles,
            rooms: rooms, 
            actors: actors,
            player: {
                x: posX,
                y: posY
            }
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
        var props = this.props,
            tileWidth = props.tileWidth,
            tileHeight = props.tileHeight,
            tileY = props.height/tileHeight,
            tiles = this.state.tiles;

        var tileEntities = [];
        for (var key in tiles) {
            var parts = key.split(",");
            var x = parseInt(parts[0]), y = parseInt(parts[1]);
            var tile = tiles[key];
            tileEntities.push(
                <Entity key={"tile"+x+"-"+y}
                        width={tileWidth+"px"}
                        height={tileHeight+"px"}
                        x={x*tileWidth}
                        y={y*tileHeight}
                        sprite={tile == "FF"? "#00f7fb" : "#fff"}
                >
                    <span style={{color: "#111111"}}>{tiles[key]}</span>
                </Entity>
            )
        }
        return tileEntities;
    },
    renderPlayer: function() {
        var player = this.state.player, props = this.props;
        console.log(player);
        return React.Children.map(this.props.children, function(child) {
            return (
                <Entity key="player" className="player"
                        x={player.x*props.tileWidth+3}
                        y={player.y*props.tileHeight}
                        width={props.tileWidth-6}
                        height={props.tileHeight}
                        sprite="#aaa"
                >
                </Entity>
            );
        });
    },
    renderActors: function() {
        var props = this.props,
            tileWidth = props.tileWidth,
            tileHeight = props.tileHeight,
            tileY = props.height/tileHeight,
            actors = this.state.actors;

        var actorEntities = [];
        for (var key in actors) {
            var parts = key.split(",");
            var x = parts[0], y = parts[1];
            actorEntities.push(
                <Entity key={"tile"+x+"-"+y}
                        width={tileWidth+"px"}
                        height={tileHeight+"px"}
                        x={x*tileWidth}
                        y={y*tileHeight}
                        sprite="#fff"
                >
                    <span style={{color: "red"}}>{actors[key]}</span>
                </Entity>
            )
        }
        return actorEntities;
    },
    render: function() {
        var state = this.state, player = state.player, props = this.props;
        return (
            <Entity key="memoryMap" sprite="#111111">
                {this.renderTiles()}

                <Entity key="actorsLayer" filter={false} ref="actorsLayer"
                        onActionLeft={this.handleTurn.bind(this, -1, 0)}
                        onActionRight={this.handleTurn.bind(this, 1, 0)}
                        onActionUp={this.handleTurn.bind(this, 0, -1)}
                        onActionDown={this.handleTurn.bind(this, 0, 1)}
                >
                    {this.renderPlayer()}
                    {this.renderActors()}
                </Entity>
            </Entity>
        )
    },
    componentDidMount: function() {
        // Focus on the actors layer so that it can handle inputs.
        this.refs.actorsLayer.getDOMNode().focus();
    }
});