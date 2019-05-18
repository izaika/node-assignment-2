const User = require('./models/User');

const success = (data = {}) => ({ statusCode: 200, data });
const fail = (data = {}, statusCode = 500) => ({ statusCode, data });
const notFound = () => fail({ error: 'Not found' }, 404);

/**
 * @param {{status: 'success' | 'fail', data: any}} result
 * @returns {{statusCode: number; data: any}}
 */
const response = ({ status, data }) =>
  status === 'fail' ? fail(result.data) : success(user.getData());

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

    const { status, data } = user.create();
    return status === 'fail' ? fail(data) : success(user.getData());
  },

  'put@users': (_, payload) => {
    if (!payload.email) return fail('`email` field should not be empty');

    const user = new User(payload);

    const { status, data } = user.update();
    return status === 'fail' ? fail(data) : success(user.getData());
  },

  'delete@users': (_, payload) => {
    if (!payload.email) return fail('`email` field should not be empty');

    const user = new User(payload);
    const { status, data } = user.delete();

    return status === 'fail' ? fail(data) : success();
  },

  notFound: () => notFound(),
};

module.exports = handlers;
