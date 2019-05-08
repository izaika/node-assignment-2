const { parse } = require('url');

/**
 * Returns string in format: `httpMethod@path`
 *
 * @param { Request } request Request object
 *
 * @returns { string }
 */
const getRouteString = ({ url, method }) =>
  `${method.toLowerCase()}@${parse(url, true).pathname.replace(
    /^\/+|\/+$/g,
    ''
  )}`;

/**
 * Parses a JSON string to an object in all cases, without throwing
 *
 * @param { string } str stringified JSON
 * @returns { object }
 */
const parseJsonToObject = str => {
  try {
    const obj = JSON.parse(str);
    return obj;
  } catch {
    return {};
  }
};

module.exports = {
  getRouteString,
  parseJsonToObject,
};
