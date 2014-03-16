/** @jsx React.DOM */

var Window = React.createClass({
    properties: {
        "titleBarHeight": 30
    },
    wrapChild: function(childComponent) {
        return (
            <Entity>{childComponent.props.children}</Entity>
        )
    },
    render: function() {
        var props = this.props,
            titleBarHeight = this.properties.titleBarHeight;
        return (
            <Entity key={"window-"+props.key}
                    x={props.x}
                    y={props.y}
                    width={props.width} 
                    height={props.height}
            >
                <Entity key="title-bar"
                        x="0"
                        y="0"
                        width="100%"
                        height={titleBarHeight}
                        sprite="blue"
                >
                    <span style={{position: "relative", left: titleBarHeight, color: "white"}}>
                        {props.key}
                    </span>
                    <Entity key="minimize-button" type="button"
                            x={props.width-titleBarHeight*2}
                            y="0"
                            width={titleBarHeight}
                            height={titleBarHeight}
                            sprite="grey"
                            onClick={this.props.onMinimize}
                    >V</Entity>
                    <Entity key="close-button" type="button"
                            x={props.width-titleBarHeight}
                            y="0"
                            width={titleBarHeight}
                            height={titleBarHeight}
                            sprite="grey"
                            onClick={this.props.onClose}
                    >X</Entity>
                </Entity>

                <Entity key="window-content"
                        x="0"
                        y={titleBarHeight}
                        width="100%"
                        height={props.height-titleBarHeight+"px"}
                >
                    {props.children}
                </Entity>
            </Entity>
        )
    }
});

