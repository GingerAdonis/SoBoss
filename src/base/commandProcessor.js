import log from '../log';
import Utils from '../utils/utils';
import Config from '../config';
import Speaker from '../classes/speaker';
import Sonos from './sonos';

export default class CommandProcessor {
  /**
   * Construct command processor class instance
   *
   * @param {object} config Config
   */
  constructor(config) {
    this.config = config;

    // Target Speakers
    const targetSpeakersIdentifiers = new Set(config.targetSpeakers instanceof Array ? config.targetSpeakers : []);
    /** @type {Map<string, Speaker>} */
    this.#targetSpeakers = new Map();
    for (const identifier of targetSpeakersIdentifiers) {
      const speaker = Sonos.get(identifier);
      if (!speaker) {
        log.warn(`Command processor includes not available target speaker: ${identifier}`);
        continue;
      }

      this.#targetSpeakers.set(identifier, speaker);
    }

    // Source Speakers
    const sourceSpeakersIdentifiers = new Set(config.sourceSpeakers instanceof Array ? config.sourceSpeakers : []);
    /** @type {Map<string, Speaker>} */
    this.#sourceSpeakers = new Map();
    for (const identifier of sourceSpeakersIdentifiers) {
      const speaker = Sonos.get(identifier);
      if (!speaker) {
        log.warn(`Command processor includes not available source speaker: ${identifier}`);
        continue;
      }

      this.#sourceSpeakers.set(identifier, speaker);
    }
  }

  /**
   * Source speakers
   *
   * @type {Map<string, Speaker>}
   */
  #sourceSpeakers;

  /**
   * Get source speakers
   *
   * @returns {Map<string, Speaker>} Source speakers
   */
  getSourceSpeakers() {
    return this.#sourceSpeakers;
  }

  /**
   * Source speakers
   *
   * @type {Map<string, Speaker>}
   */
  #targetSpeakers;

  /**
   * Get target speakers
   *
   * @returns {Map<string, Speaker>} Target speakers
   */
  getTargetSpeakers() {
    return this.#targetSpeakers;
  }

  /**
   * Process
   *
   * @returns {Promise<void>}
   */
  async process() {
    for (const action in this.config) {
      // Skip generic props
      if (action === 'targetSpeakers' || action === 'sourceSpeakers') {
        continue;
      }

      const data = this.config[action];

      switch (action) {
        case 'setVolume':
          await this.setVolume(data);
          break;
        case 'playState':
          await this.setPlayState(data);
          break;
        case 'joinSpeaker':
          await this.joinSpeaker(data);
          break;
        case 'leaveGroup':
          await this.leaveGroup(data);
          break;
        default:
          log.warn(`Command processor has unknown command: ${action}`);
      }
    }
  }

  /**
   * Set volume
   *
   * @param {string|number} data Input data
   * @returns {Promise<void>}
   */
  async setVolume(data) {
    let volume = 0;
    if (typeof (data) === 'number') {
      volume = Utils.mathClamp(data, 0, 100);
    } else if (typeof (data) === 'string') {
      if (!this.getSourceSpeakers().size) {
        throw new Error('setVolume requires source speakers');
      }

      // Get source values
      const promises = [];
      for (const speaker of this.getSourceSpeakers().values()) {
        promises.push(speaker.getDevice().getVolume());
      }

      const volumeLevels = await Promise.all(promises);
      const lowestSourceVolume = Utils.mathClamp(Math.min(...volumeLevels), 0, 100);
      const highestSourceVolume = Utils.mathClamp(Math.max(...volumeLevels), 0, 100);

      if (data === 'lowestSource') {
        log.info(`Source speaker(s) ${Array.from(this.getSourceSpeakers().keys()).join(', ')} lowest volume is ${lowestSourceVolume}%`);
        volume = lowestSourceVolume;
      } else if (data === 'highestSource') {
        // You must be crazy
        log.info(`Source speaker(s) ${Array.from(this.getTargetSpeakers().keys()).join(', ')} highest volume is ${highestSourceVolume}%`);
        volume = highestSourceVolume;
      } else {
        throw new Error('Unknown setVolume input');
      }
    }

    const promises = [];
    for (const speaker of this.getTargetSpeakers().values()) {
      promises.push(speaker.getDevice().setVolume(volume, 'Master'));
    }

    try {
      await Promise.all(promises);
    } catch (error) {
      log.warn(error);
    }

    // Hard limit maximum set volume to prevent ear damage
    const { maxSetVolume } = Config.get('sonos');
    if (typeof (maxSetVolume) === 'number' && !Number.isNaN(maxSetVolume)) {
      volume = Math.min(maxSetVolume, volume);
    }

    log.info(`Set volume of target speaker(s) ${Array.from(this.getTargetSpeakers().keys()).join(', ')} to ${volume}%`);
  }

  /**
   * Join a speaker
   *
   * @param {string} data Input data
   * @returns {Promise<void>}
   */
  async joinSpeaker(data) {
    for (const speaker of this.getTargetSpeakers().values()) {
      try {
        const result = await speaker.joinSpeaker(data);
        if (!result) {
          throw new Error(`Failed to join speaker ${data}`);
        }
      } catch (error) {
        log.warn(error);
      }
    }

    log.info(`Target speaker(s) ${Array.from(this.getTargetSpeakers().keys()).join(', ')} joined group ${data}`);
  }

  /**
   * Leave current group
   *
   * @returns {Promise<void>}
   */
  async leaveGroup() {
    for (const speaker of this.getTargetSpeakers().values()) {
      try {
        await speaker.getDevice().leaveGroup();
      } catch (error) {
        log.warn(error);
      }
    }

    log.info(`Target speaker(s) ${Array.from(this.getTargetSpeakers().keys()).join(', ')} left their current group`);
  }

  /**
   * Set play state
   *
   * @param {string} state Play state ('play', 'pause', 'playSPDIF')
   * @returns {Promise<void>}
   */
  async setPlayState(state) {
    if (!['play', 'pause', 'playSPDIF'].includes(state)) {
      throw new Error(`Invalid play state: ${state}`);
    }

    const promises = [];
    for (const speaker of this.getTargetSpeakers().values()) {
      if (state === 'pause') {
        promises.push(speaker.pause());
      } else if (state === 'play') {
        promises.push(speaker.play());
      } else if (state === 'playSPDIF') {
        promises.push(speaker.playSPDIF());
      }
    }

    try {
      await Promise.all(promises);
    } catch (error) {
      log.warn(error);
    }

    log.info(`Set play state of target speaker(s) ${Array.from(this.getTargetSpeakers().keys()).join(', ')} to ${state}`);
  }
}
