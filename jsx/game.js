/** @jsx React.DOM */
var MauBinh = React.createClass({
    getInitialState: function() {
        return {scene: "login", account: {room: []}, rooms: []};
    },
    componentWillMount: function() {
        // Before the form is rendered, connect to server
        var self = this;
        self.server = new GameSparks();
        self.server.init({
            url: this.props.url, 
            secret: this.props.secret,
            onInit: function() {
                self.setState({scene: "login"});
            }
        });
    },
    send: function(event, callback) {
        this.server.sendWithData("LogEventRequest", event, callback);
    },
    handleLogin: function(info) {
        var self = this;
        self.server.sendWithData("AuthenticationRequest", info, function (response) {
            if (response["@class"] !== ".AuthenticationResponse") return;
            var newAccount = self.state.account;
            newAccount.displayName = response.displayName;
            newAccount.userId = response.userId;

            self.setState({
                scene: "lobby",
                account: newAccount, 
                rooms: response.scriptData.rooms
            });
        });
        return false;
    },
    selectRoom: function(roomId) {
        var self =this;
        self.send({"eventKey": "JOIN", "RID": roomId}, function (response) {
            var newAccount = self.state.account;
            newAccount.room = response.scriptData.room;
            self.setState({scene: "arena", account: newAccount});
        });
    },
    getReady: function() {
        var self = this;
        self.send({"eventKey": "READY"}, function (response) {
            var newAccount = self.state.account;
            newAccount.room = response.scriptData.room;
            self.setState({account: newAccount});
        });
    },
    renderPlayers: function() {
        var players = this.state.account.room;
        var names = players.map(function (p) {return p.displayName;});
        var currentPlayerName = this.state.account.displayName;
        var currentPlayerIdx = names.indexOf(currentPlayerName);

        var props = this.props, startX, startY, sortedPlayers = [];
        for (var i = 0, total=players.length; i < total; i++) {
            var player = players[(currentPlayerIdx+i)%4];
            switch (i) {
                case 0:
                    startX = props.width/2;
                    startY = props.height-props.tileHeight;
                    break;
                case 1:
                    startX = props.width-props.tileWidth;
                    startY = props.height/2;
                    break;
                case 2:
                    startX = props.width/2;
                    startY = 0;
                    break;
                case 3:
                    startX = 0;
                    startY = props.height/2;
                    break;
            }

            sortedPlayers.push(
                <Entity key={player.displayName}
                        ref={"player"+i}
                        width={props.tileWidth}
                        height={props.tileHeight}
                        x={startX}
                        y={startY}
                        sprite="url(img/tile6.png) no-repeat"
                />
            );
        }

        return sortedPlayers;
    },
    renderTiles: function() {
        var props = this.props;
        var i, j;
        var tilesX = props.width / props.tileWidth;
        var tilesY = props.height / props.tileHeight;
        var tiles = [];
        var spriteMap = {
            "r": "url(img/tile_rockgrass.png) no-repeat",
            "g": "url(img/tile_grass.png) no-repeat"
        }
        var tiles = [];
        for(j=0; j<tilesY; j++) {
            for(i=0; i<tilesX; i++) {
                var tile = props.tileMap[j][i];
                tiles.push(
                    <Entity key={"tile"+i+"-"+j}
                        width={props.tileWidth+"px"}
                        height={props.tileHeight+"px"}
                        x={i*props.tileWidth}
                        y={j*props.tileHeight}
                        sprite={spriteMap[tile]}
                />)
            }
        }
        return tiles;
    },
    render: function() {
        var account = this.state.account;
        var props = this.props;
        return (
            <Entity key="game" width={this.props.width} height={this.props.height} filter={this.state.scene+"Scene"}>
                <Entity key="loginScene" sprite="url(img/chivalry.jpg) no-repeat">
                    <AccountForm onLogin={this.handleLogin} />
                </Entity>
                <Entity key="lobbyScene" sprite="url(img/chivalry.jpg) no-repeat">
                    <AccountInfo account={this.state.account} />
                    <Lobby rooms={this.state.rooms} onRoomSelected={this.selectRoom} />
                </Entity>
                <Entity key="arenaScene">
                    <Entity key="backgroundLayer"
                            sprite="#28a428">
                    </Entity>
                    <Entity key="mapLayer">
                        {this.renderTiles()}
                    </Entity>
                    <Entity key="objectLayer">
                        {this.renderPlayers()}
                        <Entity key="readyBtn"
                                type="button"
                                width={props.tileWidth*2}
                                height={props.tileHeight}
                                x={props.width/2-props.tileWidth*2}
                                y={props.height-props.tileHeight}
                                onClick={this.getReady}
                        >READY</Entity>
                    </Entity>
                </Entity>
            </Entity>
        );
    }
});

var tileMap = 
[
   ['r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r'],
   ['r', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'r'],
   ['r', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'r'],
   ['r', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'r'],
   ['r', 'g', 'g', 'g', 'g', 'g', 'g', 'r', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'r'],
   ['r', 'g', 'g', 'g', 'g', 'g', 'g', 'r', 'r', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'r'],
   ['r', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'r', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'r'],
   ['r', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'r', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'r'],
   ['r', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'r', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'r'],
   ['r', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'r'],
   ['r', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'r'],
   ['r', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'r'],
   ['r', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'r'],
   ['r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r']
]
var tileWidth = 32, tileHeight = 32;

React.renderComponent(
    <MauBinh url="wss://preview.gamesparks.net/ws/140288bmRBpp" 
            secret="ccskrx0KX6maM9KjGBTNkU88CzljaXVW" 
            width={tileWidth*20} height={tileHeight*14} 
            tileMap={tileMap} tileWidth={tileWidth} tileHeight={tileHeight}
    />, document.getElementById('content')
);