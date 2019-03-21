export const pluck = (arr, key) => arr.map(o => o[key]);

export const arrayMax = (array) => array.reduce((a, b) => Math.max(a, b));

export const arrayMin = (array) => array.reduce((a, b) => Math.min(a, b));

export const arrayMinMax = (array) => ({
        min: arrayMin(array),
        max: arrayMax(array)
});

export const dissolveTicks = (ticksArray, maxCount) => {
    if (ticksArray.length <= maxCount) {
        return ticksArray;
    } else {
        /**
         * Gradient ticks algorithm
         */
        const items = [];
        const times = maxCount;
        const rate = maxCount / 100;
        for (let i = 0; i < times; i++){
            const elementIndex = Math.ceil(rate * i * ticksArray.length);
            items.push(ticksArray[elementIndex]);
        }
        return items;
    }
}

export const isBetween = (value, start, end) => (start < value && value < end);
/**
 * Why we don't use array min?
 * I've seen scale from 0 to max on screenshots in group
 * So it is linear scaling of value between 0 and max of group
 */
export const getTickHeight = (height, array, axis, adjust = 1.05) => {
    const input = axis.map(ax => pluck(array, ax)).flat();
    const max = arrayMax(input); 
    return (height / (max * adjust));
};
