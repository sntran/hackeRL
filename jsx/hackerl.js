/** @jsx React.DOM */
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var logo = "\n"+
" /$$           /$$$$$$               /$$                 /$$$$$$$  /$$      \n"+
"| $$         /$$$__  $$$            | $$                | $$__  $$| $$      \n"+
"| $$$$$$$   /$$_/  \_  $$   /$$$$$$$| $$   /$$  /$$$$$$ | $$  \ $$| $$      \n"+
"| $$__  $$ /$$/ /$$$$$  $$ /$$_____/| $$  /$$/ /$$__  $$| $$$$$$$/| $$      \n"+
"| $$  \ $$| $$ /$$  $$| $$| $$      | $$$$$$/ | $$$$$$$$| $$__  $$| $$      \n"+
"| $$  | $$| $$| $$\ $$| $$| $$      | $$_  $$ | $$_____/| $$  \ $$| $$      \n"+
"| $$  | $$| $$|  $$$$$$$$/|  $$$$$$$| $$ \  $$|  $$$$$$$| $$  | $$| $$$$$$$$\n"+
"|__/  |__/|  $$\________/  \_______/|__/  \__/ \_______/|__/  |__/|________/\n"+
"           \  $$$   /$$$                                                    \n"+
"            \_  $$$$$$_/                                                    \n"+
"              \______/  v0.7.2                                              \n"+
"\n";

var messages = {
    "info": "Okay, I hacked into a server, and have access to its memory. I need you to find some file in there. Are you up for it? Type /details for the server's info. ",
    "details": "Server IP: 93.184.216.119. Username: admin. Password: foobar."
}

function getTime() {
    var date = new Date();
    var minutes = date.getMinutes();
    if (/[0-9]$/.test(minutes)) minutes = "0"+minutes;
    return "["+date.getHours() + ":" + minutes+"]";
}

function uuid() {
    // http://www.ietf.org/rfc/rfc4122.txt
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "-";

    var uuid = s.join("");
    return uuid;
}

var HackeRL = React.createClass({
    getInitialState: function() {
        var nickname = "anonymous-"+uuid().slice(0, 8);
        return {
            nickname: nickname,
            agent: false,
            debugging: false,
            scene: "menu", 
            messageOfTheDay: "",
            systemMessages: [
                logo,
                "== Connected to server.",
                "== -",
                "== - Welcome to h@ckeRL " + nickname + ".",
                "== You were assigned an auto-generated nickname. Please register a new nickname via /nick newnickname, or identify via /msg NickServ identify <password>."
            ],
            dialog: [
                "Hey there, I have something interesting, wanna try? Type /info for more detail."
            ]
        };
    },
    componentDidMount: function() {
        window.setTimeout(function() {
            this.setState({agent: "anonymous-"+uuid().slice(0, 8)})
        }.bind(this), 2000);
    },
    newGame: function() {
        this.setState({scene: "hacking"})
    },
    endGame: function() {
        this.setState({scene: "gameOver"})
    },
    handleCommand: function(command) {
        var fullCommand = command[0], commandType = command[1], args = command[2] && command[2].split(" ");
        switch(commandType) {
            case "nick":
                var newnickname = args[0];
                var systemMessages = this.state.systemMessages;
                var dialog = this.state.dialog;
                var updateMessage = "== "+this.state.nickname+" is now known as "+newnickname
                systemMessages.push(updateMessage);
                dialog.push(updateMessage);
                this.setState({
                    nickname: args[0], 
                    systemMessages: systemMessages,
                    dialog: dialog
                });
                break;
            case "info":
            case "details":
                var dialog = this.state.dialog;
                dialog.push(messages[commandType]);
                this.setState({dialog: dialog});
                break;
            case "connect":
                var ip = args[0], username = args[1], password = args[2];
                // @TODO: Random IP
                // @TODO: Validate input with instruction.
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
        var systemMessages = this.state.systemMessages.map(function (msg, i) {
            if (i===0) {
                return <pre>{msg}</pre>;
            } else {
                var commands = msg.match(/(\/[a-zA-Z<>\s]+)(?=\.|\,)/g);
                return <p>{getTime() + " " + msg}</p>
            }
        });
        var dialog = this.state.dialog.map(function (msg, i) {
            return <p>{getTime() + " " + this.state.agent + ": " + msg}</p>
        }.bind(this));
        return (
            <Entity key="game" width={this.props.width} height={this.props.height} filter={this.state.scene+"Scene"}>
                <Entity key="menuScene">
                    <ChatRoom onCommand={this.handleCommand}>
                        <Entity key="Welcome">
                            {systemMessages}
                        </Entity>
                        <Entity key={this.state.agent}>
                            {dialog}
                        </Entity>
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
    <HackeRL width={tileWidth*60} height={tileHeight*40} 
            tileWidth={tileWidth} tileHeight={tileHeight}
    />, document.getElementById('content')
);