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

    if (!email || !name || !address)
      return fail('`email`, `name`, `address` fields should not be empty');

    const user = new User({ email, name, address });

    const result = user.create();
    if (result.status === 'fail') return fail(result.data);
    return success(user.getData());
  },

  'put@users': (_, payload) => {
    if (!payload.email) return fail('`email` field should not be empty');

    const user = new User(payload);
    const result = user.update();

    if (result.status === 'fail') return fail(result.data);
    return success(user.getData());
  },

  notFound: () => notFound(),
};

module.exports = handlers;
