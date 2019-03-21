/**
 * Handles one chart - mini chart pair
 * Render should return state
 * state should be rendered via delegate
 */
import MouseCapture from './MouseCapture';
import { arrayMinMax, getTickHeight, dissolveTicks } from './utils/scale';
import { clearElement, createAxis, createTooltip } from './utils/svg';
import { createCheckbox } from './utils/dom';
import { formatDateByTimestamp } from './utils/date';
import { defaultStyles } from './utils/styles';


CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.beginPath();
    this.moveTo(x+r, y);
    this.arcTo(x+w, y,   x+w, y+h, r);
    this.arcTo(x+w, y+h, x,   y+h, r);
    this.arcTo(x,   y+h, x,   y,   r);
    this.arcTo(x,   y,   x+w, y,   r);
    this.closePath();
    return this;
}

export default class FTChart {
    constructor({ chartId, chartElement, svgElement, previewElement, controlsElement }) {
        this.styles = defaultStyles;
        this.chartId = chartId;

        this.svgElement = svgElement;
        this.chartElement = chartElement;
        this.previewElement = previewElement;
        this.controlsElement = controlsElement;
        this.preview = true && (this.previewElement);
        //
        this.absoluteBounds = { min: 0, max: 0 };
        this.state = {
            changed: true,
            renderTicks: [],
            tickHeight: 0,
            ticksY: [],
            ticksX: []
        };
        // Bind event emitter
        this.mouseCapture = new MouseCapture(this);
    }

    setData({ colors, columns, names, types }) {
        this.colors = colors;
        this.columns = columns;
        this.dataColumns = this.columns.filter(column => column[0] !== 'x');
        this.names = names;
        this.types = types;
        this.ticks = this.convertTicks();
        this.activeAxis = Object.keys(this.ticks[0]).filter(k => k !== 'x');
        // Selected window
        this.window = {
            from: Math.round(this.ticks.length * 0.9),
            selected: -1,
            to: Math.round(this.ticks.length * 0.95)
        };
        this.calculateState();
    }

    render() {
        requestAnimationFrame(() => {
            this.selection = {
                centerX: 0,
                y: []
            };
            this.renderChart();
            this.renderPreview();
            this.renderSVG();
        });
    }

    // Third iteration
    renderChart() {
        const { clientHeight, clientWidth } = this.chartElement;
        const visibleTicks = this.window.to - this.window.from;
        const tickWidth = clientWidth / visibleTicks; // 160 / 113 or 160 / 230
        const context = this.chartElement.getContext('2d');

        context.clearRect(0, 0, clientWidth, clientHeight);
        const { renderTicks, tickHeight } = this.state;

        this.renderAxisTicks({ context, ticks: renderTicks, clientHeight, clientWidth });

        this.activeAxis.forEach(axisName => {
            const items = renderTicks.map((tick) => tick[axisName]);
            this.drawLine({
                context,
                color: this.colors[axisName],
                lineWidth: 4,
                lineCap: "round",
                tickWidth,
                tickHeight,
                clientHeight: (clientHeight - this.styles.paddings.bottom),
                items,
                start: 0
            });
        });
        if (this.window.selected >= 0) {
            this.renderSelectionLine({
                context,
                clientHeight: (clientHeight - this.styles.paddings.bottom)
            });
        }
    }

    renderSVG() {
        const { clientWidth } = this.chartElement;
        clearElement(this.svgElement);
        createAxis('axisY', this.state.ticksY, this.styles.tick.labelColor, this.svgElement);
        createAxis('axisX', this.state.ticksX, this.styles.tick.labelColor, this.svgElement);
        if (this.window.selected >= 0) {
            createTooltip(this.selection, this.styles.tooltip, this.window, this.ticks, this.colors, this.names, clientWidth, this.svgElement);
        }
    }

    onAxisEnable(axisName) {
        if (!this.activeAxis.includes(axisName)) {
            this.activeAxis.push(axisName);
        }
        //
        this.render();
    }

    onAxisDisable(axisName) {
         //
         this.activeAxis = this.activeAxis.filter(k => k !== axisName);
         //
         this.render();
    }

    renderControls() {
        clearElement(this.controlsElement);
        Object.keys(this.names).forEach((key, index) => {
            const name = this.names[key];
            const color = this.colors[key];
            createCheckbox(this.chartId, key, name, color, this.onAxisEnable.bind(this), this.onAxisDisable.bind(this), this.controlsElement);
        });
    }

    renderAxisTicks({ context, ticks, clientHeight, clientWidth }) {
        const { tick, paddings } = this.styles;
        // Vertical ticks
        const verticalTicks = tick.y;
        const verticalStep = (clientHeight - paddings.bottom) / verticalTicks;

        this.state.ticksY = [];
        this.state.ticksX = [];

        for (let index = 0; index < verticalTicks; index++) {
            const rate = Math.ceil((this.absoluteBounds.max * index) / 10);
            const tickY = verticalStep * (verticalTicks - index);
            this.state.ticksY.push({ text: rate, x: tick.padding, y: (tickY - 10) });

            context.beginPath();
            context.strokeStyle = tick.lineColor;
            context.lineWidth = 1;
            context.moveTo(tick.padding, tickY);
            context.lineTo(clientWidth - tick.padding, tickY);
            context.closePath();
            context.stroke();
        }

        const xs = dissolveTicks(ticks, tick.x).map(t => t.x);
        const horizontalStep = clientWidth / xs.length;

        for (let i = 0; i <= xs.length; i++) {
            const text = formatDateByTimestamp(xs[i]); 
            const x = horizontalStep * i + 2 * this.styles.tick.padding * 3;
            const y = clientHeight - 25;
            this.state.ticksX.push({ text, x, y });
        }
    }

    drawLine({ context, color, lineWidth, lineCap, tickWidth, tickHeight, clientHeight, items, start = 1 }) {
        context.beginPath();
        context.strokeStyle = color;
        context.lineWidth = lineWidth || 1;
        context.lineCap = lineCap || 'butt';
        context.beginPath();
        items.forEach((tick, index) => {
            if (index >= start) {
                const x = index * tickWidth;
                const y = clientHeight - tick * tickHeight;
                if (index === start) {
                    context.moveTo(0, y);
                }
                if (index === this.window.selected) {
                    // End previous line
                    context.lineTo(x - this.styles.circle, y);
                    context.closePath();
                    context.stroke();
                    // start new object
                    context.beginPath();
                    this.selection.centerX = x;
                    this.selection.y.push(y);
                    context.arc(x, y, this.styles.circle, 0, 2 * Math.PI);
                    context.moveTo(x + this.styles.circle, y);
                    context.stroke();
                } else {
                    context.lineTo(x, y);
                    context.moveTo(x, y);
                }
            }
        });
        context.closePath();
        context.stroke();
    }

    onWindowUpdate(updatedWindow) {
        const a = (this.window.from === updatedWindow.from);
        const b = (this.window.to === updatedWindow.to);
        const c = (this.window.selected === updatedWindow.selected);
        this.state.changed = !(a && b && c);
        if (this.state.changed) {
            this.window = updatedWindow;
            this.calculateState();
        }
        this.render();
    }
    /**
     * Why we should recalculate viewport lines if selection(data) is the same
     */
    calculateState() {
        const height = this.chartElement.clientHeight - this.styles.paddings.bottom;
        this.state.renderTicks = this.getVisibleTicks();
        this.state.tickHeight = getTickHeight(height, this.state.renderTicks, this.activeAxis);
        this.state.changed = false;
    }

    getVisibleTicks() {
        return this.ticks.filter((_, i) => (i >= this.window.from && i <= this.window.to))
    }
    /**
     * Render vertical line
     * IMPROTANT: Move from bottom to top
     */
    renderSelectionLine({ context, clientHeight }) {
        if (this.selection.centerX) {
            const { circle, tooltip } = this.styles;
            const { centerX } = this.selection;
            const circleOutter = circle + 2;
    
            context.lineWidth = 1;
            context.strokeStyle = this.styles.tooltip.lineColor;
            context.beginPath();
            context.moveTo(centerX, clientHeight);
            const sorted = this.selection.y.sort().reverse();
            sorted.forEach((y, index, array) => {
                // Line before circle
                context.lineTo(centerX, y + circleOutter);
                context.closePath();
                context.stroke();
                // Line after circle
                context.beginPath();
                context.moveTo(centerX, y - circleOutter);
                const next = array[index + 1];
                if (!next) {
                    context.lineTo(centerX, 0); //tooltip.height);
                    context.closePath();
                    context.stroke();
                }
            });
        }
    }

    /*
    * Optimization here: calculate min, max in collection before render preview
    */
    convertTicks() {
        const rawSet = {};
        const ticks = [];
        const bounds = {};
        this.columns.forEach((column) => {
            const columnName = column[0];
            if (columnName === 'x') {
                column.forEach((x, index) => rawSet[index] = { x });
            } else {
                bounds[columnName] = {
                    min: 0,
                    max: 0
                };
                column.forEach((value, index) => {
                    if (index > 0) {
                        bounds[columnName].min = Math.min(bounds[columnName].min, value);
                        bounds[columnName].max = Math.max(bounds[columnName].max, value);
                    }    
                    rawSet[index][columnName] = value;
                });
            }
        });
        Object.keys(rawSet).map(key => ticks.push(rawSet[key]));
        this.calculateAbsoluteBounds(bounds);

        return ticks;
    }

    calculateAbsoluteBounds(bounds) {
        let absMin = 0;
        let absMax = 0;
        Object.keys(bounds).map(key => {
            const { min, max } = bounds[key];
            absMax = Math.max(absMax, max);
            absMin = Math.min(absMin, min);
        });
        this.absoluteBounds = {
            min: absMin,
            max: absMax
        };
    }

    /**
     * PREVIEW SECTION
     * NOTICE: Refactor to seperate file
     */

    /**
     * Renders preview on canvas: line and frame
     */
    renderPreview() {
        const { clientHeight, clientWidth } = this.previewElement;
        const tickWidth = clientWidth / this.ticks.length; // 160 / 113 or 160 / 230
        const tickHeight = clientHeight / this.absoluteBounds.max; // 160 / 33
        const context = this.previewElement.getContext('2d');
        context.clearRect(0, 0, clientWidth, clientHeight);
        this.dataColumns.forEach(items => {
            const columnName = items[0];
            this.drawLinePreview({
                context,
                color: this.colors[columnName],
                clientHeight,
                tickHeight,
                tickWidth,
                items
            });
        });
        this.renderPreviewFrame({
            context,
            clientWidth,
            clientHeight
        });
    }

    /**
     * Renders preview frame
     * 4 rectanges: 2 sides, 1 top & 1 bottom
     */
    renderPreviewFrame({ context, clientWidth, clientHeight}) {
        const startPercent = this.window.from / this.ticks.length;
        const endPercent = this.window.to / this.ticks.length;
        const startPx = clientWidth * startPercent;
        const endPx = clientWidth * endPercent;
        // Render left and right part
        context.fillStyle = this.styles.frame.outerColor;
        context.fillRect(0, 0, startPx, clientHeight);
        context.fillRect(endPx, 0, clientWidth, clientHeight);
        // Render handles
        context.fillStyle = this.styles.frame.borderColor;
        context.fillRect(startPx - this.styles.frame.left, 0, this.styles.frame.left, clientHeight); // left
        context.fillRect(endPx - this.styles.frame.right, 0, this.styles.frame.right, clientHeight); // right
        const topBottomStart = (endPx - startPx);
        context.fillRect(startPx, 0, topBottomStart, this.styles.frame.top); // top
        context.fillRect(startPx, clientHeight - this.styles.frame.bottom, topBottomStart, this.styles.frame.bottom); // bottom
    }
    /**
     * Renders a one line for 1 data set
     */
    drawLinePreview({ context, color, tickWidth, tickHeight, clientHeight, items }) {
        context.beginPath();
        context.strokeStyle = color;
        context.lineWidth = 1;
        context.lineCap = 'butt';
        const start = 1;
        items.forEach((tick, index) => {
            if (index >= start) {
                const x = index * tickWidth;
                const y = clientHeight - tick * tickHeight;
                if (index === start) {
                    context.moveTo(0, y);
                }
                context.lineTo(x, y);
                context.moveTo(x, y);
            }
        });
        context.closePath();
        context.stroke();
    }
}