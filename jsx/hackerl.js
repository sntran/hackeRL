/** @jsx React.DOM */
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var HackeRL = React.createClass({
    getInitialState: function() {
        return {scene: "menu", debugging: false};
    },
    newGame: function() {
        this.setState({scene: "hacking"})
    },
    endGame: function() {
        this.setState({scene: "gameOver"})
    },
    handleCommand: function(command) {
        switch(command) {
            case "//ACCEPT":
                this.newGame();
                break;
        }
    },
    handleTerminal: function(e) {
        var self = this;
        this.setState({debugging: !this.state.debugging}, function() {
            if (self.state.debugging) {
                var input = self.refs.shell.getDOMNode();
                input.focus();
            }
        });
    },
    render: function() {
        var account = this.state.account;
        var props = this.props;
        return (
            <Entity key="game" width={this.props.width} height={this.props.height} filter={this.state.scene+"Scene"}>
                <Entity key="menuScene">
                    <ChatRoom mainTab="Anonymous (private)"
                        onCommand={this.handleCommand}
                    >
                        Hey there, I have something interesting, wanna try?
                    </ChatRoom>
                </Entity>
                <Entity key="hackingScene">
                    <TileMap width={props.width}
                            height={props.height}
                            tileWidth={props.tileWidth}
                            tileHeight={props.tileHeight}
                            enemies="10"
                            onDebug={this.handleTerminal}
                            gameOver={this.endGame}
                    >
                        <Entity key="player" className="player"
                                hp={15}
                                damage={1}
                        >
                        </Entity>
                    </TileMap>

                    <Entity key="terminal" ref="terminal"
                            height="30%"
                            hidden={!this.state.debugging}
                            sprite="#111111"
                    >
                        <input type="text" ref="shell"
                            style={{
                                position: "relative",
                                top: "85%",
                                width: "100%",
                                color: "#fff",
                                backgroundColor: "#111111",
                                border: "none"
                            }} />
                    </Entity>
                </Entity>
                <Entity key="gameOverScene" sprite="#111111">
                    <Entity width="80%"
                            height="50px"
                            x="10%"
                            y="10%"
                    >Game Over</Entity>
                    <Entity key="newgameBtn"
                            type="button"
                            width="73px"
                            height="25px"
                            x="209px"
                            y="185px"
                            onClick={this.newGame}
                    >New Game</Entity>
                </Entity>
            </Entity>
        );
    }
});

var tileWidth=16, tileHeight=16;

HackeRL.DEBUG = false;

React.renderComponent(
    <HackeRL width={tileWidth*50} height={tileHeight*30} 
            tileWidth={tileWidth} tileHeight={tileHeight}
    />, document.getElementById('content')
);