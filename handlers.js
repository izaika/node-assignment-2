const User = require('./models/User');
const { getQueryParams } = require('./utils');

const success = (data = {}) => ({ statusCode: 200, data });
const fail = (data = {}, statusCode = 500) => ({ statusCode, data });
const notFound = () => fail({ error: 'Not found' }, 404);

const getResponse = ({ status, data }) =>
  status === 'fail' ? fail(data) : success(data);

/**
 * @type { {[x: string]: (request: Request, payload: {[x: string]: any}) => { statusCode: number; data: any }} }
 */
const handlers = {
  'get@users': request => {
    const { email } = getQueryParams(request);

    if (email) {
      const user = new User({ email });
      return getResponse(user.get());
    }

    const user = new User();
    return getResponse(user.getAll());
  },

  'post@users': (_, payload) => {
    const { email, name, address } = payload;

    if (!email || !name || !address)
      return fail('`email`, `name`, `address` fields should not be empty');

    const user = new User({ email, name, address });
    return getResponse(user.create());
  },

  'put@users': (_, payload) => {
    if (!payload.email) return fail('`email` field should not be empty');
    const user = new User(payload);
    return getResponse(user.update());
  },

  'delete@users': (_, payload) => {
    if (!payload.email) return fail('`email` field should not be empty');
    const user = new User(payload);
    return getResponse(user.delete());
  },

  notFound: () => notFound(),
};

module.exports = handlers;
