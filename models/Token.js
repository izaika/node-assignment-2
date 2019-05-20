const Model = require('./Model');

class Token extends Model {
  /**
   * @param {{ id: string; expires: number; email: string }} data
   */
  constructor(data) {
    super(data, 'id');
  }
}

module.exports = Token;
