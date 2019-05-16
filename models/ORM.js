const fs = require('fs');
const path = require('path');

const { parseJsonToObject } = require('../utils');

/**
 * @abstract
 */
class ORM {
  /**
   * Read data from a file and return model object
   *
   * @param { string } fileName Value of primary key
   *
   */
  static getByFileName = fileName =>
    new Promise((resolve, reject) => {
      fs.readFile(
        `${this._getDirPath()}/${fileName}.json`,
        'utf8',
        (error, data) => {
          if (error) return reject(error);

          const jsonData = parseJsonToObject(data);
          if (!jsonData) return reject('No data exists');

          try {
            const modelEntity = new this(jsonData, false);
            resolve(modelEntity);
          } catch (error) {
            reject(error);
          }
        }
      );
    });

  static getAll = () =>
    new Promise((resolve, reject) => {
      fs.readdir(`${this._getDirPath()}/`, (error, data) => {
        if (error || !data) return reject(error);
        resolve(data.map(fileName => this.getByFileName(fileName)));
      });
    });

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
    if (new.target === ORM) {
      throw new TypeError('Cannot construct ORM instances directly');
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
  _getFilePath = () => {
    return `${this._getDirPath()}/${this._data[this._primaryKey]}.json`;
  };

  /**
   * @private
   *
   * @param { string } message User friendly error message
   * @param { any } error Error object from catch
   *
   */
  _error = (error = {}) => ({
    status: 'fail',
    data: error,
  });

  /** @private */
  _success = () => ({ status: 'success' });

  /**
   * Creates new file in storage
   *
   * @returns {{status: 'success' | 'fail', data: any}}
   */
  create = () => {
    try {
      const fileDescriptor = fs.openSync(this._getFilePath(), 'wx');
      fs.writeFileSync(fileDescriptor, JSON.stringify(this._data));
      fs.closeSync(fileDescriptor);
      return this._success();
    } catch (error) {
      return this._error(error);
    }
  };

  update = () =>
    new Promise((resolve, reject) => {
      // Open the file for updating
      fs.open(this._getFilePath(), 'r+', (error, fileDescriptor) => {
        if (error) return reject(error);

        // Convert data to string
        const stringData = JSON.stringify(this._data);

        // Truncate the file
        fs.truncate(fileDescriptor, error => {
          if (error) return reject('Error truncating file');

          // Write to file and close it
          fs.writeFile(fileDescriptor, stringData, error => {
            if (error) return reject('Error writing to existing file');

            fs.close(fileDescriptor, error => {
              if (error) return reject('Error closing existing file');
              resolve();
            });
          });
        });
      });
    });

  delete = () =>
    new Promise((resolve, reject) => {
      fs.unlink(this._getFilePath(), e => (e ? reject(e) : resolve()));
    });

  getData = () => this._data;
}

module.exports = ORM;
