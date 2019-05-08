const ORM = require('./ORM');

class User extends ORM {
  _dirName = 'users';
  _primaryKey = 'email';

  /**
   * @param { { email: string; name: string; address: string } } data
   * @param { boolean } isNew (optional, default is 'true') Should entity in DB be created?
   */
  constructor(data, isNew = true) {
    super(data, isNew);
  }
}

module.exports = User;
