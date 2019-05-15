const User = require('./models/User');

const success = (data = {}) => ({ statusCode: 200, data });
const fail = (data = {}, statusCode = 500) => ({ statusCode, data });
const notFound = () => fail({ error: 'Not found' }, 404);

/**
 * @type { {[x: string]: (request: Request, payload: {[x: string]: any}) => { statusCode: number; data: any }} }
 */
const handlers = {
  'get@users': () => success(),
  'post@users': (_, payload) => {
    const { email, name, address } = payload;
    const user = new User({ email, name, address });

    const result = user.create();
    if (result.status === 'fail') return fail(result.data);

    return success(user.getData());
  },

  notFound: () => notFound(),
};

module.exports = handlers;
