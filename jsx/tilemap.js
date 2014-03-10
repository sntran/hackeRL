/** @jsx React.DOM */
var TileMap = React.createClass({
    tileset: {
        1: "#", // wall
        0: " " // free
    },
    handleTurn: function(offsetX, offsetY) {
        var player = this.state.player;
        var newX = player.x + offsetX;
        var newY = player.y + offsetY;

        var newKey = newX + "," + newY;
        var tile = this.state.tiles[newKey];
        if (!tile || tile === this.tileset[1]) { 
            // Can't move in this direction
            return; 
        }

        this.setState({
            player: {x: newX,y: newY}
        });
    },
    getInitialState: function() {
        var props = this.props,
            tileX = props.width/props.tileWidth,
            tileY = props.height/props.tileHeight,
            tiles = {}, actors = {},
            tileset = this.tileset,
            tileMap = new ROT.Map.Digger(tileX, tileY, {
                roomWidth: [3, 5],
                roomHeight: [3, 5],
                dugPercentage: 0.5
            });

        var freeTiles = [];
        tileMap.create(function (x, y, value) {
            var key = x+","+y;
            if (!value) freeTiles.push(key);
            tiles[key] = tileset[value];
        });
        var rooms = tileMap.getRooms();

        while (this.props.enemies--) {
            var index = Math.floor(ROT.RNG.getUniform() * freeTiles.length);
            var key = freeTiles.splice(index, 1)[0];
            // @TODO: Different types of enemy.
            actors[key] = "V";
        }

        var index = Math.floor(ROT.RNG.getUniform() * freeTiles.length);
        var key = freeTiles.splice(index, 1)[0];
        var position = key.split(",");

        return {
            tiles: tiles, 
            freeTiles: freeTiles, 
            rooms: rooms, 
            actors: actors,
            player: {
                x: parseInt(position[0]),
                y: parseInt(position[1])
            }
        };
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
            tileEntities.push(
                <Entity key={"tile"+x+"-"+y}
                        width={tileWidth+"px"}
                        height={tileHeight+"px"}
                        x={x*tileWidth}
                        y={y*tileHeight}
                        sprite="#111111"
                >
                    <span style={{color: "#00f7fb"}}>{tiles[key]}</span>
                </Entity>
            )
        }
        return tileEntities;
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
                        sprite="#111111"
                >
                    <span style={{color: "#ffffff"}}>{actors[key]}</span>
                </Entity>
            )
        }
        return actorEntities;
    },
    render: function() {
        var state = this.state, player = state.player, props = this.props;
        return (
            <div style={{fontFamily: "monospace"}}>
                {this.renderTiles()}

                <Entity key="actorsLayer" filter={false} ref="actorsLayer"
                        onActionLeft={this.handleTurn.bind(this, -1, 0)}
                        onActionRight={this.handleTurn.bind(this, 1, 0)}
                        onActionUp={this.handleTurn.bind(this, 0, -1)}
                        onActionDown={this.handleTurn.bind(this, 0, 1)}
                >
                    <Entity key="player"
                            x={player.x*props.tileWidth}
                            y={player.y*props.tileHeight}
                            width={props.tileWidth}
                            height={props.tileHeight}
                    ><span style={{color: "yellow"}}>@</span></Entity>
                    {this.renderActors()}
                </Entity>
            </div>
        )
    },
    componentDidMount: function() {
        // Focus on the actors layer so that it can handle inputs.
        this.refs.actorsLayer.getDOMNode().focus();
    }
});