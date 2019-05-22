const User = require('./models/User');
const Token = require('./models/Token');

const { getQueryParams, hashStr, guid, omit } = require('./utils');

const success = (data = {}) => ({ statusCode: 200, data });
const fail = (data = {}, statusCode = 500) => ({ statusCode, data });
const notFound = () => fail({ error: 'Not found' }, 404);
const unautorized = message => fail({ error: message || 'Unauthorized' }, 401);
const forbidden = () => fail({ error: 'Forbidden' }, 403);

const getResponse = ({ status, data }) =>
  status === 'fail' ? fail(data) : success(data);

/**
 * @type { {[x: string]: (request: Request, payload: {[x: string]: any}) => { statusCode: number; data: any }} }
 */
const handlers = {
  'get@users': request => {
    // Move to own function
    const tokenId = request.headers['x-auth-token'];
    if (!tokenId) return unautorized();
    const getTokenResult = new Token({ id: tokenId }).get();
    if (getTokenResult.status === 'fail') {
      const { data: error } = getTokenResult;
      if (error.code === 'ENOENT') return unautorized('Token does not exist');
      return fail(error);
    }
    const { data: tokenData } = getTokenResult;
    if (tokenData.expires < Date.now()) return unautorized('Token is expired');
    // ! Move to own function

    const { email } = getQueryParams(request);

    if (!email) return fail('`email` should not be empty');

    const getUserResult = new User({ email }).get();

    if (getUserResult.status === 'fail') {
      const { data: error } = getUserResult;
      if (error.code === 'ENOENT') return notFound();
      return fail(error);
    }

    const { data: userData } = getUserResult;

    if (tokenData.email !== email || tokenId !== userData.tokenId)
      return forbidden();

    return success(omit(userData, ['hashedPassword', 'tokenId']));
  },

  'post@users': (_, payload) => {
    const { email, password, name, address } = payload;

    if (!email || !password || !name || !address)
      return fail('`email`, `password`, `name`, `address` should not be empty');

    const hashedPassword = hashStr(password);

    return getResponse(
      new User({ email, hashedPassword, name, address }).create()
    );
  },

  'put@users': (_, payload) => {
    if (!payload.email) return fail('`email` should not be empty');
    const dataToSave = omit(payload, ['password', 'hashedPassword', 'tokenId']);
    if (payload.password) dataToSave.hashedPassword = hashStr(payload.password);
    return getResponse(new User(dataToSave).update());
  },

  'delete@users': (_, payload) =>
    payload.email
      ? getResponse(new User(payload).delete())
      : fail('`email` should not be empty'),

  'post@logIn': (_, payload) => {
    const { email, password } = payload;

    if (!email || !password)
      return fail('`email` and `password` should not be empty');

    const { status, data } = new User({ email }).get();

    // If any kind of error - response with error text
    if (status === 'fail') return fail(data);

    // Check password
    if (hashStr(password.toString()) !== data.hashedPassword)
      return fail('Password is not correct');

    // Check for tokenId value delete it if exists
    if (data.tokenId) new Token({ id: data.tokenId }).delete();

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
    if (updateUserResult.status === 'fail') return fail(updateUserResult.data);

    return success(tokenId);
  },

  notFound: () => notFound(),
};

module.exports = handlers;
