/** @type {Map<string, Speaker>} */
const speakers = new Map();

const {DeviceDiscovery} = require('sonos');
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

    const serialNum = description.serialNum;
    const modelName = description.modelName;
    const roomName = description.roomName;

    if (!serialNum || !modelName || !roomName || !description.UDN) {
        log.warn(`Found speaker at ${device.host} without a serial number, model name, UDN and/or room name`);
        return;
    }

    const udn = description.UDN.replace('uuid:', '');

    const speakerConfig = Config.sonos.speakers[serialNum];
    if (!speakerConfig || !speakerConfig.identifier) {
        log.warn(`Found speaker at ${device.host} (serial number ${serialNum}) but not available in or invalid config`);
        return;
    }

    const identifier = speakerConfig.identifier;

    const Speaker = require('../classes/speaker');
    const speaker = speakers.has(identifier) ? speakers.get(identifier) : new Speaker(identifier, device);
    let isNew;
    if (!speakers.has(identifier)) {
        speakers.set(identifier, speaker);
        isNew = true;
    } else
        isNew = false;

    speaker.setRoomName(roomName);
    speaker.setSerialNum(serialNum);
    speaker.setName(modelName);
    speaker.setUdn(udn);

    log.info(`Discovered ${isNew ? 'new' : 'existing'} ${speaker.getName()} speaker at ${speaker.getHostAddress()} (serial number ${serialNum})`);

    //Log device info
    log.debug(`Description`, description);
    log.debug(`ZoneInfo`, await device.getZoneInfo());
    log.debug(`GetAllGroups`, await device.getAllGroups());
    log.debug(`CurrentTrack`, await device.currentTrack());
}, undefined);

class Sonos {
    /**
     * Get speaker by identifier
     * @param {string} identifier
     * @return {Speaker} [speaker]
     */
    static get(identifier) {
        return speakers.get(identifier);
    }
}

module.exports = Sonos;