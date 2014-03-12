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

        return {
            activeTab: "Welcome",
            users: users
        }
    },
    componentWillUnmount: function() {
        window.clearTimeout(this.userUpdater);
    },
    sendChat: function(e) {
        if (e.which === 13) {
            var chatInput = this.refs.chatSender.getDOMNode();
            var chatLine = chatInput.value;
            chatInput.value = "";
            var matches = chatLine.match(/^\/([a-zA-Z]+)(?:\s(.*))?$/);
            if (matches) {
                this.props.onCommand(matches);
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
        var usersToAdd = Math.floor(ROT.RNG.getUniform() * 10);
        while (usersToAdd--) {
            users.push(this.sg.generate());
        }
        index = Math.floor(ROT.RNG.getUniform() * users.length);
        // Inject the agent to the list of users.
        // @TODO: Avoid hard-coding the tab position of the agent.
        users.splice(index, 0, this.props.children[1].props.key);
        this.userUpdater = window.setTimeout(this.updateUsers, Math.floor(ROT.RNG.getUniform() * 5)*1000);
        this.setState({users: users});
    },
    switchTab: function(name) {
        this.setState({activeTab: name})
    },
    renderRoom: function(child) {
        return (
            <Entity key={child.props.key} className="chat-entries" width="70%">
                {child.props.children}
            </Entity>
        )
    },
    render: function() {
        var users = this.state.users.map(function (name, i) {
            return (
                <li onClick={this.switchTab.bind(this, name)}>{name}</li>
            )
        }.bind(this));

        var tabs = this.props.children.map(function (child, i) {
            var tabName = child.props.key;
            if (!tabName) return false;
            return (
                <Entity key={tabName+"Tab"} x={100*i+"px"} width="100px" className="tab"
                        onClick={this.switchTab.bind(this, tabName)}
                        sprite={tabName===this.state.activeTab? "grey" : "#fff"}
                    >{tabName}</Entity>
            )
        }.bind(this));

        return (
            <Entity key="chatroom"
            >
                <Entity key="tabs" height="5%">
                    {tabs}
                </Entity>

                <Entity key="room" className="chat-room"
                         y="5%" height="95%"
                         filter={this.state.activeTab}
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