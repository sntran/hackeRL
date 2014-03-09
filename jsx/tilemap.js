/** @jsx React.DOM */
var TileMap = React.createClass({
    spriteMap: {
        1: "#",
        0: " "
    },
    getInitialState: function() {
        return {tiles: []};
    },
    componentDidMount: function() {
        var props = this.props,
            tileX = props.width/props.tileWidth,
            tileY = props.height/props.tileHeight,
            maze = new ROT.Map.EllerMaze(tileX, tileY), 
            self=this, tiles = self.state.tiles;
        maze.create(function (x, y, value) {
            tiles.push(value);
            if ((x == tileX-1) && (y === tileY-1)) {
                self.setState({tiles: tiles});
            }
        });
    },
    renderTile: function(tile, idx) {
        var props = this.props,
            tileWidth = props.tileWidth,
            tileHeight = props.tileHeight,
            tileY = props.height/tileHeight;
        var x = Math.floor(idx/tileY), y = idx % tileY;
        return (
            <Entity key={"tile"+x+"-"+y}
                    width={tileWidth+"px"}
                    height={tileHeight+"px"}
                    x={x*tileWidth}
                    y={y*tileHeight}
                    sprite="#111111"
            >
                <span style={{color: "#00f7fb"}}>{this.spriteMap[tile]}</span>
            </Entity>
        )
    },
    render: function() {
        return (
            <Entity key="map">
                {this.state.tiles.map(this.renderTile)}
            </Entity>
        )
    }
});