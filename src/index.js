import FTChart from './FTChart';
import { getWidth, createChartElements } from './utils/dom';

/**
 * Entry point
 */
const onLoad = async () => {
    const response = await fetch('/chart_data.json');
    const charts = await response.json();
    const chartWidth = getWidth(); 
    
    charts.forEach((chart, index) => {
        const chartId = index;
        const { chartElement, svgElement, previewElement, controlsElement } = createChartElements(index, chartWidth);
        const chartInstance = new FTChart({ chartId, chartElement, svgElement, previewElement, controlsElement });
        chartInstance.setData(chart);
        chartInstance.render();
        chartInstance.renderControls();
    });
};



document.addEventListener("DOMContentLoaded", onLoad());