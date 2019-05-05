/**
 * @type { {[x: string]: () => Promise<{ statusCode: number; data: any }>} }
 */
const handlers = {
  welcome: () => Promise.resolve({ statusCode: 200, data: 'Hello world!' }),
  notFound: () => Promise.resolve({ statusCode: 404, data: 'Not found' }),
};

module.exports = handlers;
