/** @jsx React.DOM */
var MAX_USERS = 30;
var ChatRoom = React.createClass({
    getInitialState: function () {
        this.sg = new ROT.StringGenerator();
        var trainingSetCount = nicknames.length;
        while (trainingSetCount--) {
            this.sg.observe(nicknames[trainingSetCount]);
        }
        var userCount = 10+Math.floor(ROT.RNG.getUniform() * MAX_USERS)
        var users = [];
        while (userCount--) {
            users.push(this.sg.generate());
        }

        this.userUpdater = window.setTimeout(this.updateUsers, Math.floor(ROT.RNG.getUniform() * 10)*1000);

        return {
            activeTab: 0,
            users: users
        }
    },
    componentWillUnmount: function() {
        window.clearTimeout(this.userUpdater);
    },
    getActiveTabName: function() {
        return this.props.children[this.state.activeTab].props.key;
    },
    componentDidUpdate: function() {
        // To scroll the chat entries
        var activeTabName = this.getActiveTabName();
        var ref = this.refs["messages-"+activeTabName];
        if (ref) {
            var activeTabMessages = ref.getDOMNode();
            activeTabMessages.scrollTop = activeTabMessages.scrollHeight;
        }
    },
    sendChat: function(e) {
        if (e.which === 13) {
            var chatInput = this.refs.chatSender.getDOMNode();
            var chatLine = chatInput.value;
            if (chatLine === "") return;
            chatInput.value = "";
            var matches = chatLine.match(/^\/([a-zA-Z]+)(?:\s(.*))?$/);
            if (matches) {
                this.props.onChatMessage(matches);
            } else {
                var activeTabName = this.getActiveTabName();
                this.props.onChatMessage([chatLine, "reply", chatLine])
            }
        }
    },
    updateUsers: function() {
        var users = this.state.users;
        var usersToRemove = Math.floor(ROT.RNG.getUniform() * 10);
        while (usersToRemove--) {
            var index = Math.floor(ROT.RNG.getUniform() * users.length);
            users.splice(index, 1);
        }
        var usersToAdd = Math.floor(ROT.RNG.getUniform() * (MAX_USERS-users.length));
        while (usersToAdd--) {
            users.push(this.sg.generate());
        }
        this.userUpdater = window.setTimeout(this.updateUsers, Math.floor(ROT.RNG.getUniform() * 5)*1000);
        this.setState({users: users});
    },
    switchTab: function(idx, name) {
        this.setState({activeTab: idx})
    },
    renderRoom: function(child) {
        return (
            <Entity key={child.props.key} ref={"messages-"+child.props.key} className="chat-entries" width="70%" height="95%">
                {child.props.children}
            </Entity>
        )
    },
    render: function() {
        var users = this.state.users.map(function (name, i) {
            return (
                <li key={"user"+i} onClick={this.switchTab.bind(this, name)}>{name}</li>
            )
        }.bind(this));

        var tabs = this.props.children.map(function (child, i) {
            var tabName = child.props.key;
            if (!tabName) return false;
            return (
                <Entity key={tabName+"Tab"} x={150*i+"px"} width="150px" className="tab"
                        onClick={this.switchTab.bind(this, i, tabName)}
                        sprite={tabName===this.getActiveTabName()? "grey" : "#fff"}
                    >{tabName}</Entity>
            )
        }.bind(this));

        return (
            <Entity key="chatroom"
            >
                <Entity key="tabs" height="3%">
                    {tabs}
                </Entity>

                <Entity key="room" className="chat-room"
                         y="3%" height="97%"
                         filter={this.getActiveTabName()}
                >
                    {this.props.children.map(this.renderRoom)}
                </Entity>
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
        )
    }
});

var nicknames = [
    "Snoogysckin",
    "Foofiecuddle",
    "Nookumkins",
    "Doodlewoogle",
    "Poofiekissie",
    "Moofiedoodle",
    "Smoochiepoo",
    "Kissiespoo",
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
    "Schnookie",
    "Schnookiepie",
    "Moopiepoochie",
    "Mooglielover",
    "Booblesnuggy",
    "Wookumpoofie",
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
    "Sweetiehead",
    "Honeygoo",
    "Poochiedumpling",
    "Wuddlegoo",
    "Wunnysnuggy",
    "Wuddlylips",
    "Loverpoof",
    "Cuddlybaby",
    "Wooglecutie",
    "Poofcake",
    "Honeypoo"
]