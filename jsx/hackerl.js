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
"              \______/  v0.7.10                                             \n"+
"\n";

var messages = {
    "info": "Okay, I hacked into a server, and have access to its memory. I need you to find some file in there. Are you up for it? Type /details for the server's info. ",
    "details": "Server IP: "+randomIP()+". Username: admin. Password: foobar. /connect to it."
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

function randomIP() {
    return Math.round(Math.random()*255)
    + "." + Math.round(Math.random()*255)
    + "." + Math.round(Math.random()*255)
    + "." + Math.round(Math.random()*255);
}

var HackeRL = React.createClass({
    getInitialState: function() {
        var nickname = "anonymous-"+uuid().slice(0, 8);
        return {
            nickname: nickname,
            agent: false,
            debugging: false,
            scene: "menu", 
            systemMessages: [
                logo,
                "== Connected to server.",
                "== Changes log:",
                "== * Use chat room as gameover scene, with messages from the agent.",
                "== * Generate random IP instead whenever new agent contacts",
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
            var agent = "anonymous-"+uuid().slice(0, 8);
            this.setState({agent: agent});
        }.bind(this), 2000);
    },
    newGame: function() {
        this.setState({scene: "hacking"})
    },
    endGame: function(stats) {
        var dialog = this.state.dialog, systemMessages = this.state.systemMessages;
        var agentLastMsg = "Well, I'm disappointed. Luckily for you I could just destroy the VM so nobody can trace you, but you'll need to practice your skills. Bye.";
        dialog.push(agentLastMsg);
        var agentQuitMsg = "== " + this.state.agent + " disconnected.";
        dialog.push(agentQuitMsg);

        systemMessages.push("== Private messages left for you from " + this.state.agent +": "+agentLastMsg);
        systemMessages.push(agentQuitMsg);
        this.setState({scene: "menu", dialog: dialog, systemMessages: systemMessages, agent: false});

        window.setTimeout(function() {
            // Generate a new agent with the same first dialog message.
            var agent = "anonymous-"+uuid().slice(0, 8);
            var dialog = [this.state.dialog[0]];
            this.setState({agent: agent, dialog: dialog});
        }.bind(this), 2000);
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
                dialog.push(this.state.agent + ": " +messages[commandType]);
                this.setState({dialog: dialog});
                break;
            case "connect":
                var ip = args[0], username = args[1], password = args[2];
                // @TODO: Validate input with instruction.
                this.newGame();
                break;
            case "reply":
                var dialog = this.state.dialog;
                dialog.push(this.state.nickname + ": " + args[0]);
                this.setState({dialog: dialog});
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
                return <pre key="logo">{msg}</pre>;
            } else {
                var commands = msg.match(/(\/[a-zA-Z<>\s]+)(?=\.|\,)/g);
                return <p key={"message-"+i}>{getTime() + " " + msg}</p>
            }
        });
        var dialog = this.state.dialog.map(function (msg, i) {
            return <p key={"message-"+i}>{getTime() + " " + msg}</p>
        }.bind(this));
        return (
            <Entity key="game" width={this.props.width} height={this.props.height} filter={this.state.scene+"Scene"}>
                <Entity key="menuScene">
                    <ChatRoom onChatMessage={this.handleCommand}>
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