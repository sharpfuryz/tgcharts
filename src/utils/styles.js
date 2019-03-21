const defaultStyles = {
    tick: {
        y: 6,
        x: 6,
        lineColor: 'rgba(242,244,245, 1)',
        labelColor: 'rgba(152,162,169, 1)',
        padding: 3
    },
    paddings: {
        bottom: 50
    },
    circle: 6,
    tooltip: {
        lineColor: 'rgba(224, 230, 234, 0.8)',
        width: 135,
        height: 94
    },
    frame: {
        left: 7,
        right: 7,
        top: 3,
        bottom: 3,
        borderColor: 'rgba(221,234,243, 0.8)',
        outerColor: 'rgba(245,249,251, 0.7)'
    },
    controls: {
        height: 50,
        lineColor: 'rgba(242,244,245, 1)',
        paddingLeft: 10
    }
};

const tooltipRowHeight = 22;
const tooltipTickWidth = 70;

export { defaultStyles, tooltipTickWidth, tooltipRowHeight }