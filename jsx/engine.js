/** @jsx React.DOM */
var EntityMixin = {
    componentWillMount: function() {
        // Invoked once, immediately before the initial rendering
        // occurs. If you call setState within this method, render()
        // will see the updated state and will be executed only 
        // once despite the state change.
        var self = this;
        self.props.behaviors.forEach(function(behavior) {
            behavior.componentWillMount.bind(self);
        });
    },
    componentDidMount: function() {
        // Invoked immediately after rendering occurs. At this
        // point in the lifecycle, the component has a DOM 
        // representation which you can access via this.getDOMNode().
        // If you want to integrate with other JavaScript frameworks, 
        // set timers using setTimeout or setInterval, or send AJAX 
        // requests, perform those operations in this method.
        var self = this;
        self.props.behaviors.forEach(function(behavior) {
            behavior.componentDidMount.bind(self);
        });
    },
    componentWillReceiveProps: function(nextProps) {
        // Invoked when a component is receiving new props. 
        // This method is not called for the initial render.
        // Use this as an opportunity to react to a prop 
        // transition before render() is called by updating 
        // the state using this.setState(). The old props can
        // be accessed via this.props. Calling this.setState() 
        // within this function will not trigger an additional render.
        var self = this;
        self.props.behaviors.forEach(function(behavior) {
            behavior.componentWillReceiveProps.bind(self, nextProps);
        });
    },
    shouldComponentUpdate: function(nextProps, nextState) {
        // Invoked before rendering when new props or state 
        // are being received. This method is not called for
        // the initial render or when forceUpdate is used.
        return true;
    },
    componentWillUpdate: function(nextProps, nextState) {
        // Invoked immediately before rendering when new props
        // or state are being received. This method is not called
        // for the initial render.
        // Use this as an opportunity to perform preparation 
        // before an update occurs.
        var self = this;
        self.props.behaviors.forEach(function(behavior) {
            behavior.componentWillUpdate.bind(sself, nextProps, nextState);
        });
    },
    componentDidUpdate: function(prevProps, prevState) {
        // Invoked immediately after updating occurs. 
        // This method is not called for the initial render.
        // Use this as an opportunity to operate on the DOM 
        // when the component has been updated.
        var self = this;
        self.props.behaviors.forEach(function(behavior) {
            behavior.componentDidUpdate.bind(self, prevProps, prevState);
        });
    },
    componentWillUnmount: function() {
        // Invoked immediately before a component is unmounted from the DOM.
        // Perform any necessary cleanup in this method, such as 
        // invalidating timers or cleaning up any DOM elements that 
        // were created in componentDidMount.
        var self = this;
        self.props.behaviors.forEach(function(behavior) {
            behavior.componentWillUnmount.bind(self);
        });
    }
}
var Entity = React.createClass({
    getDefaultProps: function() {
        return {
            className: "",
            type: "div", // default container.
            filter: "",
            x: 0,
            y: 0,
            z: 0,
            width: "100%",
            height: "100%",
            hidden: false,
            background: "none",
            actions: {
                "37": "Left",
                "39": "Right",
                "38": "Up",
                "40": "Down",
                "5": "Action",
                "27": "Cancel",
                "192": "Debug"
            },
            behaviors: []
        }
    },
    handleKeyboard: function(e) {
        var code = e.keyCode || e.which;
        var action = this.props.actions[code];
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
            display: this.props.hidden? "none" : "inherit",
            background: this.props.sprite,
            backgroundSize: "100%"
        };
        var tabIndex = "none";

        for (var key in this.props.actions) {
            // If the entity has action handler, then we set tabIndex.
            if (this.props["onAction"+this.props.actions[key]]) {
                tabIndex = "1";
                break;
            }
        }

        var filter = this.props.filter;
        return React.DOM[this.props.type]({
                className: "entity " + this.props.className,
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