/** @jsx React.DOM */
var EntityMixin = {

}
var Entity = React.createClass({
    mixins: ["EntityMixin"],
    getDefaultProps: function() {
        return {
            type: "div", // default container.
            filter: "",
            x: 0,
            y: 0,
            z: 0,
            width: "100%",
            height: "100%",
            background: "none"
        }
    },
    actions: {
        "37": "Left",
        "39": "Right",
        "38": "Up",
        "40": "Down",
        "5": "Action",
        "6": "Cancel"
    },
    handleKeyboard: function(e) {
        var code = e.keyCode || e.which;
        var action = this.actions[code];
        if (action && this.props["onAction"+action]) {
            this.props["onAction"+action]();
        }
    },
    handleTouch: function(e) {
        // @TODO: encapsulate mouse/touch events.
        if (e.type === "click" && this.props.onClick) {
            this.props.onClick(this);
        }
    },
    // Render the component absolutely based on props, as
    // well as filtering its immediate children based on filter.
    render: function() {
        var styles = {
            position: "absolute",
            left: this.props.x,
            top: this.props.y,
            zIndex: this.props.z,
            width: this.props.width,
            height: this.props.height,
            background: this.props.sprite,
            backgroundSize: "100%"
        };
        var tabIndex = "none";

        for (var key in this.actions) {
            // If the entity has action handler, then we set tabIndex.
            if (this.props["onAction"+this.actions[key]]) {
                tabIndex = "1";
                break;
            }
        }

        var filter = this.props.filter;
        return React.DOM[this.props.type]({
                style: styles,
                tabIndex: tabIndex,
                onKeyDown: this.handleKeyboard,
                onMouseEnter: this.handleTouch,
                onMouseOver: this.handleTouch,
                onMouseOut: this.handleTouch,
                onClick: this.handleTouch,
                onTouchCancel: this.handleTouch,
                onTouchEnd: this.handleTouch,
                onTouchMove: this.handleTouch,
                onTouchStart: this.handleTouch
            }, React.Children.map(this.props.children, function (child) {
                return filter && filter.indexOf(child.props.key) === -1
                        ? false
                        : child;
            }));
    }
});