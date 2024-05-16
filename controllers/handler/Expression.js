const moment = require('moment');
const sizeOf = require("image-size");
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
    //console.log("area:" + numbers)
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
function parseImageString(img, imageString) {
    const regexnhw = /^(.*)h(\d+)w(\d+)$/;
    const matchnhw = imageString.match(regexnhw);

    if (matchnhw) {
        //throw new Error('Invalid format. The string should be in the format <name>h<height>w<width>');
        const imageName = matchnhw[1];
        const height = parseInt(matchnhw[2], 10);
        const width = parseInt(matchnhw[3], 10);
        return {
            name: imageName,
            height: height,
            width: width
        };

    }
    const regexnh = /^(.*)h(\d+)$/;
    const matchnh = imageString.match(regexnh);
    if (matchnh) {
        console.log("Only name and height" + matchnh)
        const imageName = matchnh[1];
        const forceHeight = parseInt(matchnh[2], 10);
        const sizeObj = sizeOf(img);
        const ratio = forceHeight / sizeObj.height;

        return {
            name: imageName,
            height: forceHeight,
            width: Math.round(sizeObj.width * ratio)
        };
    }
    const regexnw = /^(.*)w(\d+)$/;
    const matchnw = imageString.match(regexnw);
    if (matchnw) {
        console.log("Only name and width" + matchnh)
        const imageName = matchnw[1];
        const forceWidth = parseInt(matchnw[2], 10);
        const sizeObj = sizeOf(img);
        const ratio = forceWidth / sizeObj.width;

        return {
            name: imageName,
            height: Math.round(sizeObj.height * ratio),
            width: forceWidth
        };
    }
    return {
        name: imageString,
        height: 100,
        width: 100
    };



}
module.exports = { upper, lower, size, sum, average, formatDate, max, min, area, perimeter, mul, where, parseImageString };