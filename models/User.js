const ORM = require('./ORM');

class User extends ORM {
  /**
   * @param { { email: string; name: string; address: string } } data
   */
  constructor(data) {
    super(data, 'users', 'email');
  }
}

module.exports = User;
