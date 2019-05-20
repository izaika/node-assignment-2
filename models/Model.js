const fs = require('fs');
const path = require('path');

/**
 * @abstract
 */
class Model {
  /** @private */
  _baseDir = path.join(__dirname, '/../.data');

  /**
   * Name of directory where to store files
   *
   * @private
   * @type { string }
   */
  _dirName;

  /**
   * The name of unique parameter of entity which is used
   * for the name of the file
   *
   * @private
   * @type { string }
   */
  _primaryKey;

  /**
   * Object with data of entity which will be saved to DB
   *
   * @protected
   * @type { object }
   */
  _data;

  /**
   * @param { { email: string; name: string; address: string } } data
   * @param { string } primaryKey The name of unique parameter of entity which is used for the name of the file
   */
  constructor(data, primaryKey) {
    if (new.target === Model) {
      throw new TypeError('Cannot construct Model instances directly');
    }

    this._data = data;
    this._dirName = `${this.constructor.name.toLowerCase()}s`;
    this._primaryKey = primaryKey;
  }

  /** @private */
  _getDirPath = () => {
    const dirPath = `${this._baseDir}/${this._dirName}`;

    // create direcrory if it does not exist yet
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath);

    return dirPath;
  };

  /** @private */
  _getFilePath = fileName => {
    return `${this._getDirPath()}/${fileName ||
      this._data[this._primaryKey]}.json`;
  };

  /**
   * @private
   *
   * @param { string } message User friendly error message
   * @param { Error | string } error Error object or message
   *
   */
  _error = error => ({
    status: 'fail',
    data: error,
  });

  /** @private */
  _success = data => ({ status: 'success', data });

  /**
   * @private
   */
  _save = () => {
    try {
      const fileDescriptor = fs.openSync(this._getFilePath(), 'w');
      fs.writeFileSync(fileDescriptor, JSON.stringify(this._data));
      fs.closeSync(fileDescriptor);
      return this._success();
    } catch (error) {
      return this._error(error);
    }
  };

  /**
   * Creates new file in storage
   *
   * @returns {{status: 'success' | 'fail', data: any}}
   */
  create = () =>
    fs.existsSync(this._getFilePath())
      ? this._error('File already exists')
      : this._save();

  update = () => {
    const filePath = this._getFilePath();
    if (!fs.existsSync(filePath)) return this._error('File does not exist');

    try {
      this._data = {
        ...JSON.parse(fs.readFileSync(filePath, 'utf8')),
        ...this._data,
      };
      return this._save();
    } catch (error) {
      return this._error(error);
    }
  };

  delete = () => {
    try {
      fs.unlinkSync(this._getFilePath());
      return this._success();
    } catch (error) {
      return this._error(error);
    }
  };

  get = () => {
    try {
      const data = JSON.parse(fs.readFileSync(this._getFilePath(), 'utf-8'));
      return this._success(data);
    } catch (error) {
      return this._error(error);
    }
  };

  getAll = () => {
    try {
      const keys = fs
        .readdirSync(`${this._getDirPath()}`)
        .map(fileName => fileName.replace('.json', ''));

      return this._success(
        keys.map(key =>
          JSON.parse(fs.readFileSync(this._getFilePath(key), 'utf-8'))
        )
      );
    } catch (error) {
      return this._error(error);
    }
  };

  getData = () => this._data;
}

module.exports = Model;
