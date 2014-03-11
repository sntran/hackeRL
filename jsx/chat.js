/** @jsx React.DOM */
var ChatRoom = React.createClass({
    getInitialState: function () {
        this.sg = new ROT.StringGenerator();
        var trainingSetCount = nicknames.length;
        while (trainingSetCount--) {
            this.sg.observe(nicknames[trainingSetCount]);
        }
        var userCount = 10+Math.floor(ROT.RNG.getUniform() * 30)
        var users = [];
        while (userCount--) {
            users.push(this.sg.generate());
        }

        this.userUpdater = window.setTimeout(this.updateUsers, Math.floor(ROT.RNG.getUniform() * 10)*1000);
        var messages = [this.props.children];
        return {
            tabs: ["Lobby", this.props.mainTab],
            users: users,
            messages: messages
        }
    },
    componentWillUnmount: function() {
        window.clearTimeout(this.userUpdater);
    },
    sendChat: function(e) {
        if (e.which === 13) {
            var chatInput = this.refs.chatSender.getDOMNode();
            var messagesNode = this.refs.messages.getDOMNode()
            var chatLine = chatInput.value;
            chatInput.value = "";
            var messages = this.state.messages;
            messages.push("Me: "+chatLine);
            if (/^\/\/[A-Z]+/.test(chatLine)) {
                this.props.onCommand(chatLine);
            }
            this.setState({messages: messages}, function() {
                messagesNode.scrollTop = messagesNode.scrollHeight;
            });
        }
    },
    updateUsers: function() {
        var users = this.state.users;
        var usersToRemove = Math.floor(ROT.RNG.getUniform() * 10);
        while (usersToRemove--) {
            var index = Math.floor(ROT.RNG.getUniform() * users.length);
            users.splice(index, 1);
        }
        var usersToAdd = Math.floor(ROT.RNG.getUniform() * 10);
        while (usersToAdd--) {
            users.push(this.sg.generate());
        }
        this.userUpdater = window.setTimeout(this.updateUsers, Math.floor(ROT.RNG.getUniform() * 5)*1000);
        this.setState({users: users});
    },
    switchTab: function(name) {
        console.log(name);
    },
    render: function() {
        var users = this.state.users.map(function (name, i) {
            return (
                <li onClick={this.switchTab.bind(this, name)}>{name}</li>
            )
        }.bind(this));
        var messages = this.state.messages.map(function (text, i) {
            return (
                <li>{text}</li>
            )
        }.bind(this));

        var tabs = this.state.tabs.map(function (tabName, i) {
            return (
                <Entity key={tabName+"Tab"} x={100*i+"px"} width="100px"
                        onClick={this.switchTab.bind(this, tabName)}
                    >{tabName}</Entity>
            )
        }.bind(this));

        return (
            <Entity key="chatroom"
            >
                <Entity key="tabs" height="10%">
                    {tabs}
                </Entity>

                <Entity key="room" y="10%" height="90%" className="chat-room"
                >
                    <Entity key="messages" ref="messages" className="chat-entries" width="70%" type="ul"
                    >{messages}</Entity>
                    <Entity key="users" x="70%" width="30%" type="ul"
                    >{users}</Entity>
                    <input type="text"
                            ref="chatSender"
                            style={{
                                position: "absolute",
                                bottom:"0",
                                width:"70%"
                            }}
                            onKeyPress={this.sendChat}
                    />
                </Entity>
            </Entity>
        )
    }
});

var nicknames = [
    "Snoogyschnookiekin",
    "Foofiecuddle",
    "Nookumkins",
    "Doodlewoogle",
    "Poofiekissie",
    "Moofiedoodle",
    "Smoochiepoo",
    "Kissieschnookiepoo",
    "Gooblepie",
    "Doodlewuggy",
    "Snookumface",
    "Foofiepoofpooh",
    "Poofpookiepums",
    "Babywookiehead",
    "Doodlepook",
    "Moogliewookum",
    "Bunkerboo",
    "Foofiepums",
    "Schnookiedumpling",
    "Schnookiepie",
    "Moopiepoochie",
    "Mooglielover",
    "Booblesnuggy",
    "Wookumpoofiecakes",
    "Booblepoo",
    "Sweetiefoof",
    "Cutiegoo",
    "Honeylips",
    "Babyface",
    "Smooshdumplings",
    "Sweetiecutiekins",
    "Boobledumplings",
    "Schnookumface",
    "Loverwooglepook",
    "Nookumsweetiehead",
    "Honeygoo",
    "Poochiedumpling",
    "Wuddlegoo",
    "Wunnysnuggy",
    "Wuddlylips",
    "Loverpoof",
    "Cuddlybabydumpling",
    "Wooglecutie",
    "Poofcake",
    "Honeypoo"
]