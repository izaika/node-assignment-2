const fs = require('fs');
const path = require('path');

const { parseJsonToObject } = require('../utils');

/**
 * @abstract
 */
class ORM {
  /** @private */
  static _baseDir = path.join(__dirname, '/../.data');

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

  static getAll = () => {};

  /**
   * Name of directory where to store files
   *
   * @protected
   * @type { string }
   */
  _dirName;

  /**
   * The name of unique parameter of entity which is used
   * for the name of the file
   *
   * @protected
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

  constructor(data, isNew) {
    if (new.target === ORM) {
      throw new TypeError('Cannot construct ORM instances directly');
    }

    this._data = data;
    if (isNew) this._create();
  }

  /** @private */
  _getDirPath = () => `${ORM._baseDir}/${this._dirName}`;

  /** @private */
  _getFilePath = () =>
    `${this._getDirPath()}/${this._data[this._primaryKey]}.json`;

  /**
   * Creates new entity in DB
   *
   * @private
   */
  _create = () =>
    new Promise((resolve, reject) => {
      // Open the file for writing
      fs.open(this._getFilePath(), 'wx', (error, fileDescriptor) => {
        if (error || !fileDescriptor) {
          return reject('Could not create new file, it may already exist');
        }

        // Convert data to string
        const stringData = JSON.stringify(this._data);

        // Write to file and close it
        fs.writeFile(fileDescriptor, stringData, error => {
          if (error) return reject('Error writing to new file');

          fs.close(fileDescriptor, error => {
            if (error) return reject('Error closing new file');
            resolve();
          });
        });
      });
    });

  getData = () => this._data;
}

module.exports = ORM;
