const crypto = require('crypto');
const { parse } = require('url');

const { hashKey } = require('./config');

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

/**
 * @param { Request } request
 * @returns { object }
 */
const getQueryParams = request => parse(request.url, true).query;

/**
 *
 * @param { string } str String to hash
 * @returns { string } Hashed string
 */
const hashStr = str =>
  crypto
    .createHmac('sha256', hashKey)
    .update(str)
    .digest('hex');

module.exports = {
  getRouteString,
  parseJsonToObject,
  getQueryParams,
  hashStr,
};
