const moment = require('moment');

function upper(input) {
    if (!input) return input;
    return input.toUpperCase();
};
function lower(input) {
    if (!input) return input;
    return input.toLowerCase();
};
function size(input) {
    if (!input) return 0;
    return input.length;
};

function sum(input, field) {
    if (!input) return input;
    //console.log(input);
    return input.reduce(function (sum, object) {
        console.log("sum: " + sum);
        console.log("object: " + JSON.stringify(object));
        console.log("field: " + field);
        return sum + object[field];
    }, 0);
};
function average(input, field) {
    if (!input) return input;
    return input.reduce(function (sum, object) {
        return sum + object[field];
    }, 0) / input.length;
};
function formatDate(input, format) {
    if (!input) return input;
    const date = new Date(input);
    console.log(format);
    console.log(date);
    var result = moment(date.toISOString()).format(format);
    console.log(result)
    return result;
};

function max(input, field) {
    if (!input || input.length === 0) return 0;
    return Math.max(...input.map(object => object[field]));
};
function min(input, field) {
    if (!input || input.length === 0) return 0;
    return Math.min(...input.map(object => object[field]));
};

function area(...numbers) {
    console.log("area:" + numbers)
    return numbers.reduce((total, num) => total * num);
};

function perimeter(...numbers) {
    return numbers.reduce((total, num) => total + num);
};
function mul(input, field) {
    if (!input) return input;
    return input.reduce(function (sum, object) {
        return sum * object[field]
    });
};

function where(input, query) {
    return input.filter(function (item) {
        return expressions.compile(query)(item);
    });
};

module.exports = { upper, lower, size, sum, average, formatDate, max, min, area, perimeter, mul, where };