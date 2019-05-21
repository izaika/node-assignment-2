const User = require('./models/User');
const Token = require('./models/Token');

const { getQueryParams, hashStr, guid } = require('./utils');

const success = (data = {}) => ({ statusCode: 200, data });
const fail = (data = {}, statusCode = 500) => ({ statusCode, data });
const notFound = () => fail({ error: 'Not found' }, 404);
const unautorized = () => fail({ error: 'Unauthorized' }, 401);
const forbidden = () => fail({ error: 'Forbidden' }, 403);

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

    return getResponse(
      new User({ email, hashedPassword, name, address }).create()
    );
  },

  'put@users': (_, payload) => {
    if (!payload.email) return fail('`email` field should not be empty');

    // omit some data from object to save
    const dataToSave = {
      password,
      hashedPassword,
      tokenId,
      ...payload,
    };

    if (payload.password) dataToSave.hashedPassword = hashStr(payload.password);

    return getResponse(new User(dataToSave).update());
  },

  'delete@users': (_, payload) =>
    payload.email
      ? getResponse(new User(payload).delete())
      : fail('`email` field should not be empty'),

  'post@logIn': (_, payload) => {
    const { email, password } = payload;

    if (!email || !password)
      return fail('`email` and `password` fields should not be empty');

    const { status, data } = new User({ email }).get();

    // If any kind of error - response with error text
    if (status === 'fail') return fail(data);

    // Check password
    if (hashStr(password.toString()) !== data.hashedPassword)
      return fail('Password is not correct');

    // Check for tokenId value and create it if it does not exists
    if (data.tokenId) {
      // @TODO: Check if it exists and not expired
    } else {
      // Create new token
      const tokenId = guid();

      const createTokenResult = new Token({
        id: tokenId,
        expires: Date.now() + 1000 * 60 * 60,
        email,
      }).create();

      if (createTokenResult.status === 'fail')
        return fail(createTokenResult.data);

      // update user object with tokenId
      const updateUserResult = new User({ email, tokenId }).update();
      if (updateUserResult.status === 'fail')
        return fail(updateUserResult.data);

      return success(tokenId);
    }
  },

  notFound: () => notFound(),
};

module.exports = handlers;
