/** @jsx React.DOM */
var ChatRoom = React.createClass({
    getInitialState: function () {
        return { activeTab: 0}
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
    switchTab: function(idx, name) {
        this.setState({activeTab: idx})
    },
    renderRoom: function(child) {
        return (
            <Entity key={child.props.key} 
                    ref={"messages-"+child.props.key} 
                    className="chat-entries" 
                    width="70%" 
                    height="95%"
                    css={{
                        "overflowY": "auto"
                    }}
                    overflow="auto">
                {child.props.children}
            </Entity>
        )
    },
    render: function() {
        var tabs = React.Children.map(this.props.children, function (child, i) {
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
                <Entity key="tabs" height="5%">
                    {tabs}
                </Entity>

                <Entity key="room" className="chat-room"
                         y="5%" height="95%"
                         filter={this.getActiveTabName()}
                >
                    {this.props.children.map(this.renderRoom)}
                </Entity>
                <RandomUsersList x="70%" width="30%" />
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