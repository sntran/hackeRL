/** @jsx React.DOM */
var HackeRL = React.createClass({
    getInitialState: function() {
        return {scene: "hacking"};
    },
    newGame: function() {
        this.setState({scene: "hacking"})
    },
    render: function() {
        var account = this.state.account;
        var props = this.props;
        return (
            <Entity key="game" width={this.props.width} height={this.props.height} filter={this.state.scene+"Scene"}>
                <Entity key="menuScene" sprite="url(img/Saif-Sajiid_circuit.png) no-repeat">
                    <Entity key="newgameBtn"
                            type="button"
                            width="73px"
                            height="25px"
                            x="209px"
                            y="185px"
                            onClick={this.newGame}
                    >New Game</Entity>
                </Entity>
                <Entity key="hackingScene">
                    <TileMap width={props.width}
                            height={props.height}
                            tileWidth={props.tileWidth}
                            tileHeight={props.tileHeight}
                            enemies="10"
                    >

                    </TileMap>
                </Entity>
            </Entity>
        );
    }
});

var tileWidth=16, tileHeight=16;

React.renderComponent(
    <HackeRL width={tileWidth*50} height={tileHeight*30} 
            tileWidth={tileWidth} tileHeight={tileHeight}
    />, document.getElementById('content')
);