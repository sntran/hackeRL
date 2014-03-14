/** @jsx React.DOM */
var MAX_USERS = 30;

var RandomUsersList = React.createClass({
    getInitialState: function() {
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
        return {users: users};
    },
    componentWillUnmount: function() {
        window.clearTimeout(this.userUpdater);
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
    render: function() {
        var users = this.state.users.map(function (name, i) {
            return (
                <li key={"user"+i}>{name}</li>
            )
        }.bind(this));
        return (
            <Entity key="users" x={this.props.x} width={this.props.width} type="ul"
            >{users}</Entity>
        );
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