import { formatLongDateByTimestamp } from './date';
import { tooltipTickWidth, tooltipRowHeight, defaultStyles } from './styles';

const svgNS = 'http://www.w3.org/2000/svg';
const shadowClass = 'chart__tooltip--shadow';

/**
 * Find another way to cleanup svg
 */
const clearElement = (svg) => {
    while (svg.lastChild) {
        svg.removeChild(svg.lastChild);
    }
};

/**
 * Create a group and text elements
 */
const createAxis = (groupTitle, ticks, color, svg) => {
    const group = createSVGGroup(groupTitle, svg);
    ticks.forEach(node => {
        const { text, x, y } = node;
        createSVGText(text, x, y, group, color);
    });
}

/**
 * Creates text element
 */
const createSVGText = (text, x, y, svg, color, fontWeight) => {
    const el = document.createElementNS(svgNS, "text");
    el.setAttributeNS(null, 'font-family','Helvetica, Arial');
    el.setAttributeNS(null, 'x', x);      
    el.setAttributeNS(null, 'y', y);   
    if (color) {
        el.setAttributeNS(null, 'fill', color);
    }
    if (fontWeight) {
        el.setAttributeNS(null, 'font-weight', fontWeight);
    }

    const textNode = document.createTextNode(text);
    el.appendChild(textNode);
    svg.appendChild(el);
}

/**
 * Creates and binds group
 */
const createSVGGroup = (groupTitle, container) => {
    const group = document.createElementNS(svgNS, "g");
    group.setAttribute('id', groupTitle);
    container.appendChild(group);

    return group;
}

/**
 * Creates and binds rectangle
 */
const createSVGRectangle = (attributes, container) => {
    const el = document.createElementNS(svgNS, "rect");
    Object.keys(attributes).forEach((key) => {
        el.setAttributeNS(null, key, attributes[key]);  
    });
    el.classList.add(shadowClass);
    container.appendChild(el);

    return el;
}

const calculateCoordX = (centerX, clientWidth, width) => {
    let x = centerX - width / 2;
    if (centerX < width) {
        x = 10;
    }
    if (centerX + width > clientWidth) {
        x = clientWidth - width - 10;
    }

    return x;
}

const createTooltip = (selection, tooltipStyles, chartWindow, ticks, colors, names, clientWidth, container) => {
    const { centerX, y } = selection;
    const group = createSVGGroup('tooltip', container);
    const width = y.length * tooltipTickWidth + 15;

    const x = calculateCoordX(centerX, clientWidth, width);

    const attributes = {
        x,
        y: 3,
        width,
        height: 70,
        rx: 10,
        ry: 10,
        stroke: tooltipStyles.lineColor,
        fill: '#fff'
    };
    createSVGRectangle(attributes, group);
    const tick = ticks[chartWindow.from + chartWindow.selected];
    if (tick) {
        createTooltipText(tick, x, colors, names, group);
    }
}

const createTooltipText = (tick, x, colors, names, group) => {
    const title = formatLongDateByTimestamp(tick.x);
    createSVGText(title, x + 15, tooltipRowHeight, group, '#333');
    Object.keys(tick).filter(k => k != 'x').forEach((key, index) => {
        const color = colors[key];
        const name = names[key];
        const value = tick[key];
        const adjust = x + 15 + tooltipTickWidth * index;
        createSVGText(value, adjust, tooltipRowHeight * 2, group, color, 'bold');
        createSVGText(name, adjust, tooltipRowHeight * 3, group, color);
    });
}

export { clearElement, createAxis, createTooltip }