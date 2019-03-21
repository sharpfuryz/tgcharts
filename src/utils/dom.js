/**
 * Calculate width including paddings
 */
const getWidth = () => {
    const chartPadding = 10;
    const containerWidth = Math.min(window.screen.width, window.innerWidth, 920) - (2 * chartPadding);
    document.getElementById('holder').style.width = `${containerWidth}px`;
    return containerWidth;
}

/**
 * Create three elements
 */
const createChartElements = (index, width) => {
    const canvasChartName = `chart_${index}`;
    const svgName = `chart_scale_${index}`;
    const canvasMiniChartName = `chart_${index}_mini`;
    const controlsName = `chart_interactive_${index}`;
    const isDesktop = window.screen.width > 900;
    const chartHeight = isDesktop ? Math.ceil( width / 2) : width;
    const previewHeight = Math.round( width / 8 );

    const container = createContainer(index);
    const chartElement = createCanvas(container, canvasChartName, 'chart', width, chartHeight);
    const svgElement = createSVG(container, svgName, 'chart_svg', width, chartHeight);
    const previewElement = createCanvas(container, canvasMiniChartName, 'chart_preview', width, previewHeight);
    const controlsElement = createDiv(container, controlsName, 'chart_controls', width, 60);

    return { chartElement, svgElement, previewElement, controlsElement };
};

/**
 * Creates canvas element
 */
const createCanvas = (container, id, className, width, height) => {
    const canv = document.createElement('canvas');
    canv.classList.add(className);
    canv.id = id;
    canv.width = width;
    canv.height = height;

    document.body.appendChild(canv);
    container.appendChild(canv);
    return canv;
};

/**
 * Create SVG element
 */
const createSVG = (container, id, className, width, height) => {
    const canv = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    canv.classList.add(className);
    canv.setAttribute('width', width);
    canv.setAttribute('height', height);
    canv.setAttribute('id', id);

    document.body.appendChild(canv);
    container.appendChild(canv);
    return canv;
}
const createDiv = (container, id, className, width, height) => {
    const el = document.createElement('div');
    el.classList.add(className);
    el.id = id;
    el.style.width = `${width}px`;
    el.style.height = `${height}px`;

    document.body.appendChild(el);
    container.appendChild(el);
    return el;
}
/**
 * Create div holder
 */
const createContainer = (id) => {
    const el = document.createElement('div');
    el.id = `holder_${id}`;
    el.classList.add('chart_holder');

    document.body.appendChild(el);
    document.getElementById('holder').appendChild(el);
    return el;
};

/**
 * Create checkbox elements
 * div
 *  -> input
 *  -> label
 *  -> color circle
 */
const createCheckbox = (chartId, key, name, color, onEnable, onDisable, container) => {
    const checkboxName = `${chartId}_checkbox_${name}`;
    // div
    const holder = document.createElement('div');
    holder.classList.add('chart_controls__checkbox');
    container.appendChild(holder);
    // div input
    const input = document.createElement('input');
    input.setAttribute('type', 'checkbox');
    input.setAttribute('checked', true);
    input.setAttribute('id',checkboxName);
    input.addEventListener('click', () => {
        if (input.checked === true) {
            onEnable(key);
        } else {
            onDisable(key);
        }
    });
    holder.appendChild(input);
    // div label
    const label = document.createElement('label');
    label.innerText = name;
    label.setAttribute('for', checkboxName);
    holder.appendChild(label);
    // div circle
    const circle = document.createElement('div');
    circle.classList.add('chart_controls__checkbox__circle');
    circle.style.backgroundColor = color;
    holder.appendChild(circle);
}

export { getWidth, createChartElements, createCheckbox }