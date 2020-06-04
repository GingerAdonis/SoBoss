import GenericDevicePingCheck from './genericDevice/pingCheck';
import Events from '../base/events';
import log from '../log';
import CommandProcessor from '../base/commandProcessor';

/**
 * Generic device
 */
export default class GenericDevice {
  /**
   * Construct generic device
   *
   * @param {string} identifier Device identifier
   */
  constructor(identifier) {
    this.#identifier = identifier;

    this.listenToEvents();
  }

  /** @type {object} */
  #eventsCommands = {};

  /**
   * Device identifier
   *
   * @type {string}
   */
  #identifier;

  /**
   * Get identifier
   *
   * @returns {string} Device identifier
   */
  getIdentifier() {
    return this.#identifier;
  }

  /**
   * Host address
   *
   * @type {string}
   */
  #hostAddress;

  /**
   * Set host address
   *
   * @param {string} hostAddress Host address
   */
  setHostAddress(hostAddress) {
    this.#hostAddress = hostAddress;
  }

  /**
   * Get host address
   *
   * @returns {string} Host address
   */
  getHostAddress() {
    return this.#hostAddress;
  }

  /**
   * @type {GenericDevicePingCheck}
   */
  #pingCheck;

  /**
   * Set ping check enabled state
   *
   * @param {boolean} enabled Enabled state
   */
  setPingCheck(enabled) {
    if (!enabled) {
      this.#pingCheck = undefined;
      return;
    }

    if (typeof (this.#pingCheck) === 'object') {
      return;
    }

    this.#pingCheck = new GenericDevicePingCheck(this);
  }

  /**
   * Get ping check class instance
   *
   * @returns {GenericDevicePingCheck} Ping check instance
   */
  getPingCheck() {
    return this.#pingCheck;
  }

  /**
   * Is ping check enabled
   *
   * @returns {boolean} Ping check enabled
   */
  hasPingCheck() {
    return typeof (this.#pingCheck) === 'object';
  }

  /**
   * Parse device config
   *
   * @param {object} config Config
   */
  parseConfig(config) {
    if (typeof (config.hostAddress) === 'string') {
      this.setHostAddress(config.hostAddress);
    }
    if (config.checks instanceof Array) {
      this.setPingCheck(config.checks.includes('ping'));
    }

    if (this.hasPingCheck()) {
      if (typeof (config.pingIntervalMs) === 'number') {
        this.getPingCheck().setPingIntervalMs(config.pingIntervalMs);
      }
    }

    this.parseConfigEvents(config);
  }

  /**
   * Parse device event config
   *
   * @param {object} config Config
   */
  parseConfigEvents(config) {
    const eventNames = ['onAvailable', 'onUnavailable'];
    for (const eventName of eventNames) {
      const eventConfig = config[eventName];
      if (!(eventConfig instanceof Array)) {
        continue;
      }

      this.#eventsCommands[eventName] = eventConfig;
    }
  }

  /**
   * Think
   *
   * @returns {Promise<void>}
   */
  async think() {
    if (this.hasPingCheck()) {
      await this.getPingCheck().process();
    }
  }

  /**
   * Listen to events
   *
   * @private
   */
  listenToEvents() {
    Events.on('deviceAvailabilityChange', async (device, available) => {
      if (device !== this) {
        return;
      }

      log.info(`Device ${this.getIdentifier()} became ${available ? 'available' : 'unavailable'}`);

      const commands = available ? this.#eventsCommands['onAvailable'] : this.#eventsCommands['onUnavailable'];
      if (!(commands instanceof Array)) {
        log.warn(new Error('No commands to process'));
        return;
      }

      for (const commandConfig of commands) {
        try {
          const commandProcessor = new CommandProcessor(commandConfig);
          await commandProcessor.process();
        } catch (error) {
          log.warn(error);
        }
      }
    });
  }
}
