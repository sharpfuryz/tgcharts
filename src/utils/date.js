const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const daysOfWeek = ['Sun', 'Mon','Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const formatDateByTimestamp = (timestamp) => {
    const dateObj = new Date(timestamp);
    const monthName = monthNamesShort[dateObj.getMonth()];
    const dayNum = dateObj.getUTCDate();

    return `${monthName} ${dayNum}`;
}
const formatLongDateByTimestamp = (timestamp) => {
    const dateObj = new Date(timestamp);
    const monthName = monthNamesShort[dateObj.getMonth()];
    const dayNum = dateObj.getUTCDate();
    const dayName = daysOfWeek[dateObj.getDay()];

    return `${dayName}, ${monthName} ${dayNum}`;
}

export { formatDateByTimestamp, formatLongDateByTimestamp }