import { DeviceDiscovery } from 'sonos';
import log from '../log';
import Config from '../config';
import Speaker from '../classes/speaker';

/** @type {Map<string, Speaker>} */
const speakers = new Map();

export default class Sonos {
  /**
   * Get optional speaker by identifier
   *
   * @param {string} identifier Speaker identifier
   * @returns {Speaker} Optional speaker
   */
  static get(identifier) {
    return speakers.get(identifier);
  }

  static startDiscoverDevices() {
    DeviceDiscovery(async (device) => {
      let description;
      try {
        description = await device.deviceDescription();
      } catch (error) {
        log.error(error);
        return;
      }

      if (!description) {
        log.warn(`Found speaker at ${device.host} without a description`);
        return;
      }

      const { serialNum, modelName, roomName } = description;

      if (!serialNum || !modelName || !roomName || !description.UDN) {
        log.warn(`Found speaker at ${device.host} without a serial number, model name, UDN and/or room name`);
        return;
      }

      const udn = description.UDN.replace('uuid:', '');

      const speakerConfig = Config.get('sonos').speakers[serialNum];
      if (!speakerConfig || !speakerConfig.identifier) {
        log.info(`Found unused ${modelName} speaker at ${device.host} (serial number ${serialNum})`);
        return;
      }

      const { identifier } = speakerConfig;

      const speaker = speakers.has(identifier) ? speakers.get(identifier) : new Speaker(identifier, device);
      let isNew;
      if (!speakers.has(identifier)) {
        speakers.set(identifier, speaker);
        isNew = true;
      } else {
        isNew = false;
      }

      log.debug(roomName, serialNum, modelName, udn);

      speaker.setRoomName(roomName);
      speaker.setSerialNum(serialNum);
      speaker.setName(modelName);
      speaker.setUdn(udn);

      log.info(`Discovered ${isNew ? 'new' : 'existing'} ${speaker.getName()} speaker at ${speaker.getHostAddress()} (serial number ${serialNum})`);

      // Log device info
      /* log.debug(`Description`, description);
      log.debug(`ZoneInfo`, await device.getZoneInfo());
      log.debug(`GetAllGroups`, await device.getAllGroups());
      log.debug(`CurrentTrack`, await device.currentTrack()); */
    }, undefined);
  }
}
