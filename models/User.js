const Model = require('./Model');

class User extends Model {
  /**
   * @param {{ email: string; hashedPassword?: string; name?: string; address?: string }} data
   */
  constructor(data) {
    super(data, 'email');
  }
}

module.exports = User;
