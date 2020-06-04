import log from '../log';
import Sonos from '../base/sonos';

export default class Speaker {
  /**
   * Construct a speaker
   *
   * @param {string} identifier Speaker identifier
   * @param {object} device Sonos API device
   */
  constructor(identifier, device) {
    this.#identifier = identifier;
    this.#device = device;
  }

  /**
   * Speaker identifier
   *
   * @type {string}
   */
  #identifier;

  /**
   * Get speaker identifier
   *
   * @returns {string} Speaker identifier
   */
  getIdentifier() {
    return this.#identifier;
  }

  /**
   * Sonos API device
   *
   * @type {object}
   */
  #device;

  /**
   * Get Sonos API device
   *
   * @returns {object} Sonos API device
   */
  getDevice() {
    return this.#device;
  }

  /**
   * Speaker name
   *
   * @type {string}
   */
  #name;

  /**
   * Set speaker name
   *
   * @param {string} name Speaker name
   */
  setName(name) {
    this.#name = name;
  }

  /**
   * Get speaker name
   *
   * @returns {string} Speaker name
   */
  getName() {
    return this.#name;
  }

  /**
   * Serial number
   *
   * @type {string}
   */
  #serialNumber;

  /**
   * Set serial number
   *
   * @param {string} serialNum Serial number
   */
  setSerialNum(serialNum) {
    this.#serialNumber = serialNum;
  }

  /**
   * Get serial number
   *
   * @returns {string} Serial number
   */
  getSerialNum() {
    return this.#serialNumber;
  }

  /**
   * Get host address
   *
   * @returns {string} Host address
   */
  getHostAddress() {
    return this.getDevice().host;
  }

  /**
   * Room name
   *
   * @type {string}
   */
  #roomName;

  /**
   * Set room name
   *
   * @param {string} roomName Room name
   */
  setRoomName(roomName) {
    this.#roomName = roomName;
  }

  /**
   * Get room name
   *
   * @returns {string} Room name
   */
  getRoomName() {
    return this.#roomName;
  }

  /**
   * UDN (RINCON id)
   *
   * @type {string}
   */
  #udn;

  /**
   * Set UDN (RINCON id)
   *
   * @param {string} udn UDN
   */
  setUdn(udn) {
    this.#udn = udn;
  }

  /**
   * Get UDN (RINCON id)
   *
   * @returns {string} UDN
   */
  getUdn() {
    return this.#udn;
  }

  /**
   * Join a speaker
   *
   * @param {string} speakerName Speaker name
   * @returns {Promise<boolean>} Succeeded
   */
  async joinSpeaker(speakerName) {
    const speaker = Sonos.get(speakerName);
    if (!speaker) {
      throw new Error(`Unable to find speaker '${speakerName}'`);
    }

    const joinRoomName = speaker.getRoomName();
    if (!joinRoomName) {
      throw new Error('Undefined room name');
    }

    return this.getDevice().joinGroup(joinRoomName);
  }

  /**
   * Leave a room
   *
   * @returns {Promise<void>}
   */
  /* async leaveRoom() {
    await this.getDevice().leaveGroup();
  } */

  /**
   * Start regular play
   *
   * @returns {Promise<boolean>} Succeeded
   */
  async play() {
    await this.getDevice().play();
    return true;
  }

  /**
   * Start S/PDIF play
   *
   * @returns {Promise<boolean>} Succeeded
   */
  async playSPDIF() {
    const uri = `x-sonos-htastream:${this.getUdn()}:spdif`;
    log.debug(`PlaySPDIF uri: ${uri}`);

    await this.getDevice().setAVTransportURI(uri);
    return true;
  }

  /**
   * Pause when playing
   *
   * @returns {Promise<boolean>} Succeeded
   */
  async pause() {
    await this.getDevice().pause();
    return true;
  }
}
