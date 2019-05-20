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

    return email
      ? getResponse(new User({ email }).get())
      : getResponse(new User().getAll());
  },

  'post@users': (_, payload) => {
    const { email, name, address } = payload;

    if (!email || !name || !address)
      return fail('`email`, `name`, `address` fields should not be empty');

    return getResponse(new User({ email, name, address }).create());
  },

  'put@users': (_, payload) =>
    payload.email
      ? getResponse(new User(payload).update())
      : fail('`email` field should not be empty'),

  'delete@users': (_, payload) =>
    payload.email
      ? getResponse(new User(payload).delete())
      : fail('`email` field should not be empty'),

  notFound: () => notFound(),
};

module.exports = handlers;
