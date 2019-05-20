const User = require('./models/User');

const { getQueryParams, hashStr } = require('./utils');

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

    // @TODO: remove passwords and tokens
    return email
      ? getResponse(new User({ email }).get())
      : getResponse(new User().getAll());
  },

  'post@users': (_, payload) => {
    const { email, password, name, address } = payload;

    if (!email || !password || !name || !address)
      return fail('`email`, `name`, `address` fields should not be empty');

    const hashedPassword = hashStr(password);

    // @TODO: create token and return it

    return getResponse(
      new User({ email, hashedPassword, name, address }).create()
    );
  },

  'put@users': (_, payload) =>
    // @TODO: token can't be changed directly

    payload.email
      ? getResponse(new User(payload).update())
      : fail('`email` field should not be empty'),

  'delete@users': (_, payload) =>
    payload.email
      ? getResponse(new User(payload).delete())
      : fail('`email` field should not be empty'),

  'post@logIn': (_, payload) => {
    const { email, password } = payload;

    if (!email || !password)
      return fail('`email` and `password` fields should not be empty');

    // find user with email and check password

    // check for tokenId value

    // ...
  },

  notFound: () => notFound(),
};

module.exports = handlers;
