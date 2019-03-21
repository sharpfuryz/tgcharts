/**
 * Handles mouse events
 * * Click
 * * Drag
 * * MouseMove
 */
import { isBetween } from './utils/scale';

export default class MouseCapture {
    constructor(chartInstance) {
        this.chartInstance = chartInstance;
        //
        const {
            chartElement,
            svgElement,
            controlsElement,
            previewElement
        } = chartInstance;

        this.chartElement = chartElement;
        this.svgElement = svgElement;
        
        this.bindChartEvents();
        this.chart = {
            mousedown: false
        };
        
        if (controlsElement) {
            this.controlsElement = controlsElement;
        }

        if (chartInstance.preview) {
            this.previewElement = previewElement;
            this.bindPreviewEvents();
            // state object
            this.preview = {
                dragLeft: false,
                dragCenter: false,
                dragRight: false,
                prevX: 0
            };
        }
    }

    /**
     * SVG element is on top of canvas
     */
    bindChartEvents() {
        this.svgElement.addEventListener('mousemove', this.onChartMouseMove.bind(this), false);
        this.svgElement.addEventListener('mouseout', this.onChartMouseOut.bind(this), false);

        this.svgElement.addEventListener("touchstart", this.onChartMouseMove.bind(this), false);
        this.svgElement.addEventListener("touchmove", this.onChartMouseMove.bind(this), false);
        this.svgElement.addEventListener("touchcancel", this.onChartMouseOut.bind(this), false);
    }

    onChartMouseMove(event) {
        event.preventDefault();

        const { layerX } = event;
        const { from, to, selected } = this.chartInstance.window;
        const visibleTicks = to - from;
        const tickWidth = this.chartElement.clientWidth / visibleTicks;
        const nextSelected = Math.round(layerX / tickWidth);
        if (nextSelected !== selected) {
            this.updateWindow({ selected: nextSelected });
        }
    }

    onChartMouseOut() {
        this.updateWindow({ selected: -1 });
    }
    validateWindowAttributes(attrs) {
        let { from, to } = attrs;
        if (from) {
            if (from < 1) {
                from = 1;
            }
            attrs.from = from;
        }
        if (to) {
            if (to <= from) {
                to = from + 1;
            }
            if (to > this.chartInstance.ticks.length) {
                to = this.chartInstance.ticks.length - 1;
            }
        }
        return attrs;
    }

    updateWindow(attrs) {
        const validAttrs = this.validateWindowAttributes(attrs);
        const arg = Object.assign({}, this.chartInstance.window, validAttrs);
        this.chartInstance.onWindowUpdate(arg);
    }
    /**
     * Preview block
     */

    onPreviewMouseDown(event) {
        event.preventDefault();

        const { layerX } = event;
        const { isLeftHandle, isCenter, isRightHandle } = this.isMouseOnHandle(layerX);

        if (isLeftHandle || isCenter ||isRightHandle) {
            this.setPreviewCursor(true);
            if (isLeftHandle) {
                this.preview.dragLeft = true;
            }
            if (isRightHandle) {
                this.preview.dragRight = true;
            }
            if (isCenter) {
                this.preview.dragCenter = true;
            }
        } else {
            // ignored
        }
    }

    isMouseOnHandle(layerX) {
        const startPercent = this.chartInstance.window.from / this.chartInstance.ticks.length;
        const endPercent = this.chartInstance.window.to / this.chartInstance.ticks.length;
        const startPx = this.chartElement.clientWidth * startPercent;
        const endPx = this.chartElement.clientWidth * endPercent;

        const isLeftHandle = isBetween(layerX, (startPx - this.chartInstance.styles.frame.left), startPx);
        const isRightHandle = isBetween(layerX, (endPx - this.chartInstance.styles.frame.right), endPx);
        const isCenter = isBetween(layerX, startPx, (endPx - this.chartInstance.styles.frame.right));

        return {
            isLeftHandle,
            isRightHandle,
            isCenter
        };
    }

    setPreviewCursor(isDrag) {
        if (isDrag) {
            this.previewElement.style.cursor = 'move';
        } else {
            this.previewElement.style.cursor = 'default';
        }
    }

    /**
     * If dragging is enabled - end it
     */
    onPreviewMouseUp() {
        if (this.preview.dragLeft) {
            this.preview.dragLeft = false;
            this.setPreviewCursor(false);
        }
        if (this.preview.dragRight) {
            this.preview.dragRight = false;
            this.setPreviewCursor(false);
        }
        if (this.preview.dragCenter) {
            this.preview.dragCenter = false;
            this.setPreviewCursor(false);
        }
    }

    onPreviewMouseMove(event) {
        const { layerX } = event;
        
        if (this.preview.dragLeft || this.preview.dragRight || this.preview.dragCenter) {
            if (this.preview.dragLeft) {
                const startPercent = layerX / this.previewElement.clientWidth;
                const preTick = Math.round(this.chartInstance.ticks.length * startPercent)
                const startTick = Math.max(preTick, 1);
                const from = Math.min((this.chartInstance.window.to - 1), startTick);
                this.updateWindow({ from });
            }
            if (this.preview.dragRight) {
                const endPercent = layerX / this.previewElement.clientWidth;
                const preTick = Math.round(this.chartInstance.ticks.length * endPercent);
                const endTick = Math.min(preTick, this.chartInstance.ticks.length);
                const to = Math.max((this.chartInstance.window.from + 1), endTick);
                this.updateWindow({ to });
            }
            if (this.preview.dragCenter) {
                const tickWidth = this.previewElement.clientWidth / this.chartInstance.ticks.length;
                if (this.preview.prevX) {
                    const startPx = this.preview.prevX;
                    const diff = Math.abs(startPx - layerX);
                    const isLeft = (layerX < startPx);
                    const distance = Math.round(diff / tickWidth);
                    if (distance > 0) {
                        if (isLeft) {
                            const from = Math.max(this.chartInstance.window.from - distance, 1);
                            const to = Math.min(this.chartInstance.window.to - distance, this.chartInstance.ticks.length);
                            this.updateWindow({ from, to });
                        } else {
                            const from = Math.max(this.chartInstance.window.from + distance, 1);
                            const to = Math.min(this.chartInstance.window.to + distance, this.chartInstance.ticks.length);
                            this.updateWindow({ from, to });
                        }
                    }
                }
                this.preview.prevX = layerX;
            }
        } else {
            const { isLeftHandle, isCenter, isRightHandle } = this.isMouseOnHandle(layerX);
            if (isLeftHandle || isRightHandle || isCenter) {
                this.setPreviewCursor(true);
            } else {
                this.setPreviewCursor(false);
            }
        }
    }

    onPreviewMouseOut() {
        this.preview.dragLeft = false;
        this.preview.dragRight = false;
        this.preview.dragCenter = false;
        delete this.preview.prevX;
        this.setPreviewCursor(false);
    }

    bindPreviewEvents() {
        this.previewElement.addEventListener('mousedown', this.onPreviewMouseDown.bind(this), false);
        this.previewElement.addEventListener('mouseup', this.onPreviewMouseUp.bind(this), false);
        this.previewElement.addEventListener('mousemove', this.onPreviewMouseMove.bind(this), false);
        this.previewElement.addEventListener('mouseout', this.onPreviewMouseOut.bind(this), false);

        this.previewElement.addEventListener("touchstart", this.onPreviewMouseDown.bind(this), false);
        this.previewElement.addEventListener("touchend", this.onPreviewMouseUp.bind(this), false);
        this.previewElement.addEventListener("touchmove", this.onPreviewMouseMove.bind(this), false);
        this.previewElement.addEventListener("touchcancel", this.onPreviewMouseOut.bind(this), false);
    }
}