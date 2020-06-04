import Config from '../config';
import log from '../log';
import GenericDevice from '../classes/genericDevice';

const thinkTimeMs = 500;

export default class GenericDevices {
  /** @type {Map<number, GenericDevice>} */
  static cachedGenericDevices = new Map();

  /**
   * (Re)load generic devices
   */
  static load() {
    for (const deviceConfig of Config.get('genericDevices')) {
      const deviceIdentifier = deviceConfig.identifier;

      const inCache = this.cachedGenericDevices.has(deviceIdentifier);
      const genericDevice = inCache ? this.cachedGenericDevices.get(deviceIdentifier) : new GenericDevice(deviceIdentifier);
      if (!inCache) {
        this.cachedGenericDevices.set(deviceIdentifier, genericDevice);
      }

      genericDevice.parseConfig(deviceConfig);

      log.info(`Loaded generic device '${deviceIdentifier}'`);
    }

    // Schedule next reload
    setTimeout(async () => {
      try {
        await this.load();
      } catch (error) {
        log.error(error);
      }
    }, 600 * 1000);
  }

  /**
   * Get device by id
   *
   * @param {number} id Device id
   * @returns {GenericDevice} Generic device
   */
  static get(id) {
    if (!id) {
      return undefined;
    }

    return this.cachedGenericDevices.get(id);
  }

  /**
   * Get all generic devices
   *
   * @returns {Set<GenericDevice>} Generic devices
   */
  static getAll() {
    return new Set(this.cachedGenericDevices.values());
  }

  /**
   * Process
   *
   * @returns {Promise<void>}
   */
  static async process() {
    const now = new Date();

    const promises = [];
    for (const genericDevice of this.getAll()) {
      promises.push(genericDevice.think(now));
    }
    await Promise.all(promises);

    // Schedule next process
    setTimeout(async () => {
      try {
        await this.process();
      } catch (error) {
        log.warn(error);
      }
    }, thinkTimeMs);
  }
}
