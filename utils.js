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

module.exports = {
  getRouteString,
};
