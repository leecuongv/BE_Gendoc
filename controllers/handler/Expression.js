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

function sum_by(input, ...field) {
    if (!input) return input;
    return input.reduce(function (sum, object) {
        return sum + object[field];
    }, 0);
};

//sum_by qty 
function sum_by_qty(input, field, qty) {
    if (!input) return input;
    return input.reduce(function (sum, object) {
        return sum + object[field] * object[qty];
    }, 0);
};


function average(input, field) {
    if (!input) return input;
    return input.reduce(function (sum, object) {
        return sum + object[field];
    }, 0) / input.length;
};
function format_date(input, format) {
    if (!input) return input;
    const date = new Date(input);
    var result = moment(date.toISOString()).format(format);
    return result;
};

function to_fixed(input, precision) {
    if (!input) return input;

    return input.toFixed(precision);
}
function max(input, field) {
    if (!input || input.length === 0) return 0;
    return Math.max(...input.map(object => object[field]));
};
function min(input, field) {
    if (!input || input.length === 0) return 0;
    return Math.min(...input.map(object => object[field]));
};

function area(...numbers) {
    return numbers.reduce((total, num) => total * num, 0);
};

function perimeter(...numbers) {
    return numbers.reduce((total, num) => total + num, 0);
};
function mul(input, field) {
    if (!input) return input;
    return input.reduce(function (sum, object) {
        return sum * object[field]
    });
};

function sort_by(input, ...fields) {
    if (!input) return input;
    return sort_by(input, fields);
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

function getHttpData(url, callback) {
    (url.substr(0, 5) === "https" ? https : http)
        .request(url, function (response) {
            if (response.statusCode !== 200) {
                return callback(
                    new Error(
                        `Request to ${url} failed, status code: ${response.statusCode}`
                    )
                );
            }

            const data = new Stream();
            response.on("data", function (chunk) {
                data.push(chunk);
            });
            response.on("end", function () {
                callback(null, data.read());
            });
            response.on("error", function (e) {
                callback(e);
            });
        })
        .end();
}
function base64DataURLToArrayBuffer(dataURL) {
    const base64Regex = /^data:image\/(png|jpg|svg|svg\+xml);base64,/;
    if (!base64Regex.test(dataURL)) {
        return null;
    }
    const stringBase64 = dataURL.replace(base64Regex, "");
    let binaryString;
    if (typeof window !== "undefined") {
        binaryString = window.atob(stringBase64);
    } else {
        binaryString = Buffer.from(stringBase64, "base64")
    }
    return binaryString;
}
module.exports = { upper, lower, size, sum_by, average, format_date, max, min, area, perimeter, mul, where, parseImageString, sort_by, to_fixed, getHttpData, base64DataURLToArrayBuffer, sum_by_qty };