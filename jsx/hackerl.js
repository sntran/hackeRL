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
"              \______/  v0.9.0                                              \n"+
"\n";

var CONSTANTS = {};
CONSTANTS.OSes = ["Linux", "Mac OS X", "Windows"];
CONSTANTS.specs = [
    {
        cpu: {name: "Dual core 1.5GHz", attribute: 1.5},
        mem: {name: "2GB RAM", attribute: 2},
        hdd: {name: "40GB HDD", attribute: "40HDD"}
    },
    {
        cpu: {name: "I3 1.86GHz", attribute: 1.86},
        mem: {name: "2GB RAM", attribute: 2},
        hdd: {name: "80GB HDD", attribute: "80HDD"}
    },
    {
        cpu: {name: "I5 2.1GHz", attribute: 2.1},
        mem: {name: "4GB RAM", attribute: 4},
        hdd: {name: "40GB SSD", attribute: "40SSD"}
    }
];
CONSTANTS.messages = {
    "intro": "Hey there, I have something interesting, wanna try? Type /info for more detail.",
    "info": "Okay, I hacked into a server, and have access to its memory. I need you to find some file in there. Are you up for it? Type /details for the server's info. ",
    "details": "Server IP: {serverIP}. Username: {username}. Password: {password}.",
    "OSSelection": "I still could not detect your OS. What is it again?<br />"
                    +"1. Linux.<br />2. Mac OS X.<br />3. Windows.<br />4. I'm not sure?",
    "OSInfo": "Linux is free to install. It's fast, but you have to type command for everything. Tools running on Linux has high compatibility between Linux versions.<br/><br/>"+
            "Windows, on the other hand, requires a license to run. It's bloated with junks so everything is slow. It has UI though, so every thing is point and click. Certain softwares may require certain Windows version. It's popular so you may pirate newer version easily, but be aware of virus.<br /><br />"+
            "Max OS X is an expensive OS that comes with its own hardware. Its tools commonly have UI, but its terminal is excellent, and can run a lot of Linux's tools. Even though it requires more resources to display the UI, it has good memory management, so frequently-used tools will open faster next time, even faster than on Linux in some cases.",
    "specsSelection": "What are the specs?<br />"+
            "1. "+CONSTANTS.specs[0].cpu.name+", "+CONSTANTS.specs[0].mem.name+", "+CONSTANTS.specs[0].hdd.name+"<br />"+
            "2. "+CONSTANTS.specs[1].cpu.name+", "+CONSTANTS.specs[1].mem.name+", "+CONSTANTS.specs[1].hdd.name+"<br />"+
            "3. "+CONSTANTS.specs[2].cpu.name+", "+CONSTANTS.specs[2].mem.name+", "+CONSTANTS.specs[2].hdd.name+"<br />"+
            "4. Not sure",
    "goToMission": "All set. Off you go. Open your favorite tool and connect to it. I'll be waiting.",
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
        ga('send', 'event', 'game', 'start', nickname);
        return {
            player: {
                name: nickname,
                job: false,
                os: null,
                cpu: null,
                mem: null,
                hdd: null
            },
            debugging: false,
            scene: "opening", 
            systemMessages: [
                logo,
                "== Connected to server.",
                "== Changes log:",
                "== * Camera to reduce render",
                "== * Fixed various bugs.",
                "== -",
                "== - Welcome to h@ckeRL " + nickname + ".",
                "== You were assigned an auto-generated nickname. Please register a new nickname via /nick newnickname, or identify via /msg NickServ identify <password>."
            ],
            dialog: []
        };
    },
    componentDidMount: function() {
        var player = this.state.player;
        if (!player.job || !player.job.contact) {
            window.setTimeout(function() {
                var agent = "anonymous-"+uuid().slice(0, 8);
                var dialog = this.state.dialog;
                dialog.push(agent + ": " + CONSTANTS.messages["intro"]);
                player.job = {contact: agent};
                this.setState({dialog: dialog, player: player});
            }.bind(this), 2000);
        }
    },
    newGame: function() {
        ga('send', 'event', 'scene', 'change', 'desktop');
        this.setState({scene: "desktop"})
    },
    endGame: function(completed, stats) {
        ga('send', 'event', 'player', 'endGame', completed);

        var player = this.state.player;
        var dialog = this.state.dialog, systemMessages = this.state.systemMessages;
        if (completed) {
            var agentMsg = "Excellent job. Thanks to you, I now have access to the bank ... eh, competitor's records.<br />"+
                "Anyhow, you show potential kid. There is another job I want you to do though. Are you ready? /details for the target.";
            dialog.push(agentMsg);
            this.setState({scene: "opening", dialog: dialog});
        } else {
            var agentLastMsg = "Well, I'm disappointed. Luckily for you I could just destroy the VM so nobody can trace you, but you'll need to practice your skills. Bye.";
            dialog.push(agentLastMsg);
            var agentQuitMsg = "== " + player.job.contact + " disconnected.";
            dialog.push(agentQuitMsg);

            systemMessages.push("== Private messages left for you from " + player.job.contact +": "+agentLastMsg);
            systemMessages.push(agentQuitMsg);
            player.job.contact = false;
            this.setState({scene: "opening", dialog: dialog, systemMessages: systemMessages, player:player});

            window.setTimeout(function() {
                // Generate a new agent with the same first dialog message.
                var agent = "anonymous-"+uuid().slice(0, 8);
                player.job.contact = agent;
                var dialog = [this.state.dialog[0]];
                this.setState({dialog: dialog, player: player});
            }.bind(this), 2000);
        }
    },
    handleCommand: function(command) {
        var fullCommand = command[0], commandType = command[1], args = command[2] && command[2].split(" ");
        switch(commandType) {
            case "nick":
                var newnickname = args[0];
                var player = this.state.player;
                var systemMessages = this.state.systemMessages;
                var dialog = this.state.dialog;
                var updateMessage = "== "+player.name+" is now known as "+newnickname
                systemMessages.push(updateMessage);
                dialog.push(updateMessage);
                player.name = newnickname;
                this.setState({
                    player: player,
                    systemMessages: systemMessages,
                    dialog: dialog
                });
                break;
            case "info":
                var dialog = this.state.dialog;
                dialog.push(this.state.player.job.contact + ": " + CONSTANTS.messages[commandType]);
                this.setState({dialog: dialog});
                break;
            case "details":
                var dialog = this.state.dialog;
                var player = this.state.player;
                var messageTemplate = CONSTANTS.messages[commandType];
                var ip = randomIP();
                var message = messageTemplate.replace("{serverIP}", ip)
                                            .replace("{username}", "admin")
                                            .replace("{password}", uuid().slice(0, 8));
                dialog.push(player.job.contact + ": " + message);
                if (!player.os && !player.cpu && !player.mem && !player.hdd) {
                    dialog.push(player.job.contact + ": " + CONSTANTS.messages["OSSelection"]);
                }
                player.job.server = ip;
                this.setState({dialog: dialog, player: player});
                break;
            case "reply":
                var player = this.state.player;
                var dialog = this.state.dialog;
                var msg = args[0];
                if (/^[0-9]$/.test(msg)) {
                    var selection = parseInt(msg);
                    if (selection === 4 && !player.os) {
                        // Player wanted to know the different OS
                        dialog.push(player.name + ": " + CONSTANTS.messages["OSInfo"]);
                        dialog.push(player.name + ": " + CONSTANTS.messages["OSSelection"]);
                    } else if (!player.os) {
                        var os = CONSTANTS.OSes[selection-1];
                        dialog.push(player.name + ": " + "I'm on " + os);
                        player.os = os
                        dialog.push(player.job.contact + ": " + CONSTANTS.messages["specsSelection"]);
                        ga('send', 'event', 'player', 'selectOS', os)
                    } else if (!player.cpu && !player.mem && !player.hdd) {
                        // Chose the OS, in the process of picking the specs.
                        var specs;
                        if (selection === 4) {
                            selection = Math.floor(ROT.RNG.getUniform() * CONSTANTS.specs.length);
                            specs = CONSTANTS.specs[selection];
                            dialog.push(player.job.contact + ": " + "I can tell from my scanner that it's a "+
                                specs.cpu.name + ", " + specs.mem.name + ", " + specs.hdd.name);
                            ga('send', 'event', 'player', 'selectSpecs', "random");
                        } else {
                            specs = CONSTANTS.specs[selection-1];
                            var specsString = specs.cpu.name + ", " + specs.mem.name + ", " + specs.hdd.name
                            dialog.push(player.name + ": " + "I have " + specsString);
                            ga('send', 'event', 'player', 'selectSpecs', specsString);
                        }

                        player.cpu = specs.cpu.attribute;
                        player.mem = specs.mem.attribute;
                        player.hdd = specs.hdd.attribute;
                        dialog.push(player.job.contact + ": " + CONSTANTS.messages["goToMission"]);
                    }
                } else {
                    // Regular chat message.
                    dialog.push(player.name + ": " + args[0]);
                }
                
                ga('send', 'event', 'chat', 'reply', msg);
                this.setState({dialog: dialog, player: player});
                break;
            case "connect":
                var dialog = this.state.dialog;
                var player = this.state.player;
                if (!player.os && !player.cpu && !player.mem && !player.hdd) {
                    dialog.push(player.job.contact + ": I can't let you do the task without knowing you are well-equipped or not.");
                    dialog.push(player.job.contact + ": " + CONSTANTS.messages["OSSelection"]);
                    this.setState({dialog: dialog});
                    break;
                }
                if (!args) {
                    dialog.push("== Unknown server.");
                    this.setState({dialog: dialog});
                    break;
                }
                var ip = args[0], username = args[1], password = args[2];
                if (ip !== player.job.server) {
                    dialog.push("== Unknown server.");
                    this.setState({dialog: dialog});
                    break;
                }
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
        var props = this.props, state = this.state, player = state.player;
        var systemMessages = state.systemMessages.map(function (msg, i) {
            if (i===0) {
                return <pre key="logo" 
                        style={{
                            fontWeight: "bold", color: "blue",
                            overflowX: "hidden"
                        }}>{msg}</pre>;
            } else {
                var commands = msg.match(/(\/[a-zA-Z<>\s]+)(?=\.|\,)/g);
                return <p key={"message-"+i}>{getTime() + " " + msg}</p>
            }
        });
        var dialog = state.dialog.map(function (msg, i) {
            return "<p>"+getTime()+" "+msg+"</p>";
        }.bind(this)).join("");

        var screenWidth = props.width;
        var screenHeight = props.height;
        var editorWidth = props.width*70/100;
        var mapWidth = props.width;
        var mapHeight = props.height;

        return (
            <Entity key="game" width={screenWidth} height={screenHeight} filter={state.scene+"Scene"}>
                
                <Entity key="openingScene">
                    <Window key="IRC" width={screenWidth} height={screenHeight} 
                            onMinimize={function() {}}
                            onClose={function() {}}
                    >
                        <ChatRoom onChatMessage={this.handleCommand}>
                            <Entity key="Welcome">
                                {systemMessages}
                            </Entity>
                            <Entity key={player.job.contact}>
                                <div key="dialog" dangerouslySetInnerHTML={{
                                    __html: dialog
                                }} />
                            </Entity>
                        </ChatRoom>
                    </Window>
                </Entity>

                <Entity key="desktopScene">
                    <Window key="Editor" width={editorWidth} height={screenHeight}
                            onMinimize={function() {}}
                            onClose={function() {}}
                    >
                        <Entity key="memoryMap">
                            <TileMap width={props.tileX}
                                    height={props.tileY}
                                    tileWidth={props.tileWidth}
                                    tileHeight={props.tileHeight}
                                    viewportWidth={editorWidth}
                                    viewportHeight={screenHeight-props.tileHeight}
                                    enemies={10}
                                    onDebug={this.handleTerminal}
                                    onGameEnd={this.endGame}
                            >
                                <Entity key="player" className="player"
                                        hp={15}
                                        damage={1}
                                >
                                </Entity>
                            </TileMap>
                        </Entity>
                    </Window>
                    <Window key="ProcessManager" x={editorWidth} width={screenWidth-editorWidth} height={screenHeight} 
                            onMinimize={function() {}}
                            onClose={function() {}}
                    >
                        <h2>{player.os}</h2>
                        <p>CPU: {player.cpu}GHz</p>
                        <p>MEM: {player.mem}GB</p>
                        <p>Disk: {player.hdd}</p>
                    </Window>
                </Entity>
            </Entity>
        );
    }
});

var tileWidth=32, tileHeight=26;

HackeRL.DEBUG = false;

React.renderComponent(
    <HackeRL width={tileWidth*30} height={tileHeight*25} 
            tileX={60} tileY={40}
            tileWidth={tileWidth} tileHeight={tileHeight}
    />, document.getElementById('content')
);