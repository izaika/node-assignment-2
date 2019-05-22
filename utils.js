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

const s4 = () =>
  Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);

const guid = () =>
  `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;

/**
 *
 * @param { object } obj
 * @param { string[] } propsToOmit
 *
 * @returns { object }
 */
const omit = (obj, propsToOmit) => {
  const result = { ...obj };
  propsToOmit.forEach(prop => (result[prop] = undefined));
  return result;
};

module.exports = {
  getRouteString,
  parseJsonToObject,
  getQueryParams,
  hashStr,
  guid,
  omit,
};
