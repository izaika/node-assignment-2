const success = data => Promise.resolve({ statusCode: 200, data });
const error = (statusCode = 500, data) => Promise.resolve({ statusCode, data });
const notFound = () => Promise.resolve({ statusCode: 404, data: 'Not found' });

/**
 * @type { {[x: string]: (request: Request) => Promise<{ statusCode: number; data: any }>} }
 */
const handlers = {
  'get@users': () => success('test'),
  notFound: () => notFound(),
};

module.exports = handlers;
