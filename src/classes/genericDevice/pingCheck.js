import ping from 'ping';
import Events from '../../base/events';
import Config from '../../config';
import GenericDevice from '../genericDevice';
import log from '../../log';

export default class GenericDevicePingCheck {
  constructor(genericDevice) {
    this.#genericDevice = genericDevice;

    this.setPingIntervalMs(Config.get('ping')['defaultInterval']);
  }

  /**
   * Parent generic device
   *
   * @type {GenericDevice}
   */
  #genericDevice;

  /**
   * Get parent generic device
   *
   * @returns {GenericDevice} Generic device
   */
  getGenericDevice() {
    return this.#genericDevice;
  }

  /**
   * Ping interval in milliseconds
   *
   * @type {number}
   */
  #pingIntervalMs;

  /**
   * Set ping interval in milliseconds
   *
   * @param {number} value Ping interval in milliseconds
   */
  setPingIntervalMs(value) {
    this.#pingIntervalMs = value;
  }

  /**
   * Get ping interval in milliseconds
   *
   * @returns {number} Ping interval in milliseconds
   */
  getPingIntervalMs() {
    return this.#pingIntervalMs;
  }

  /**
   * @type {Date}
   */
  #nextCheck;

  /**
   * Set next check
   *
   * @param {Date} [date] Next check date
   */
  setNextCheck(date) {
    if (!(date instanceof Date)) {
      date = new Date();
      date.setMilliseconds(date.getMilliseconds() + this.getPingIntervalMs());
    }

    this.#nextCheck = date;
  }

  /**
   * Get next check
   *
   * @returns {Date} Next check date
   */
  getNextCheck() {
    return this.#nextCheck;
  }

  /**
   * Perform a ping check
   *
   * @returns {Promise<boolean>} Is online
   */
  async check() {
    const pingTimeout = Math.round(Config.get('ping')['timeOutMs'] / 1000);
    if (pingTimeout < 1) {
      throw new Error('Ping timeout should be more than 1000ms');
    }

    const result = await ping.promise.probe(this.getGenericDevice().getHostAddress(), {
      timeout: pingTimeout,
      packetSize: 64,
    });
    return result.alive ?? false;
  }

  /**
   * @type {boolean}
   */
  #lastAvailability;

  /**
   * Process ping check when needed.
   *
   * @param {Date} [date=now] Date
   * @returns {Promise<void>}
   */
  async process(date = new Date()) {
    if (date < this.getNextCheck()) {
      return;
    }
    this.setNextCheck();

    /** @type {boolean} */
    let available;
    try {
      available = await this.check();
    } catch (error) {
      log.warn(error);
      available = false;
    }

    // Nothing has changed
    if (this.#lastAvailability === available) {
      log.debug(`Ping state of '${this.getGenericDevice().getIdentifier()}': ${available ? 'online' : 'offline'}`);
      return;
    }
    this.#lastAvailability = available;

    log.debug(`Ping state of '${this.getGenericDevice().getIdentifier()}' changed: ${available ? 'online' : 'offline'}`);

    Events.emit('deviceAvailabilityChange', this.getGenericDevice(), available);
  }
}
