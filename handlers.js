const User = require('./models/User');

const success = data => Promise.resolve({ statusCode: 200, data });
const error = (statusCode = 500, data) => Promise.resolve({ statusCode, data });
const notFound = () => Promise.resolve({ statusCode: 404, data: 'Not found' });

/**
 * @type { {[x: string]: (request: Request) => Promise<{ statusCode: number; data: any }>} }
 */
const handlers = {
  'get@users': () => success('test'),
  'post@users': request =>
    new Promise((resolve, reject) => {
      resolve({ statusCode: 200, data: 'test' });
    }),

  // const user = new User({
  //   email: 'izaika89@gmail.com',
  //   name: 'Igor Zaika',
  //   address: 'Kyiv',
  // });

  // console.log(user);
  notFound: () => notFound(),
};

module.exports = handlers;
