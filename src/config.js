import { existsSync } from 'fs';
import { join } from 'path';
import { merge } from 'lodash/object';

export default class Config {
  /**
   * @type {Map<string, object>}
   */
  static #map = new Map();

  /**
   * Get dynamic routes configuration
   *
   * @param {string} type Type
   * @returns {object} Config data
   */
  static get(type) {
    return this.#map.get(type) ?? this._load(type);
  }

  /**
   * Get environment
   *
   * @returns {string} Environment
   */
  static get environment() {
    return process.env.NODE_ENV;
  }

  /**
   * Get development environment state
   *
   * @returns {boolean} Is development environment
   */
  static get development() {
    return process.env.NODE_ENV === 'development';
  }

  /**
   * Load config type
   *
   * @private
   * @param {string} type Type
   * @returns {object} Config data
   */
  static _load(type) {
    const baseConfigFilePath = join(__dirname, `../config/${type}.json`);
    if (!existsSync(baseConfigFilePath)) {
      throw new Error(`Required config file '${baseConfigFilePath}' is not available`);
    }

    const config = require(baseConfigFilePath);

    // Private config
    const privateConfigFilePath = join(__dirname, `../config/${type}.private.json`);
    if (existsSync(privateConfigFilePath)) {
      merge(config, require(privateConfigFilePath));
    }

    // Environment config
    const envConfigFilePath = join(__dirname, `../config/${type}.${this.environment}.json`);
    if (existsSync(envConfigFilePath)) {
      merge(config, require(envConfigFilePath));
    }

    // Private environment config
    const privateEnvConfigFilePath = join(__dirname, `../config/${type}.${this.environment}.private.json`);
    if (existsSync(privateEnvConfigFilePath)) {
      merge(config, require(privateEnvConfigFilePath));
    }

    this.#map.set(type, config);
    return config;
  }
}
