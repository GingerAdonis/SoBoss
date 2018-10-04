class Speaker {
    /**
     * Construct a speaker
     * @param {string} identifier
     * @param {object} device
     */
    constructor(identifier, device) {
        this.identifier = identifier;
        this.device = device;
    }

    /**
     * Get identifier
     * @return {string} identifier
     */
    getIdentifier() {
        return this.identifier;
    }

    /**
     * Get Sonos API device
     * @return {object}
     */
    getDevice() {
        return this.device;
    }

    /**
     * Set name
     * @param {string} name
     */
    setName(name) {
        this.name = name;
    }

    /**
     * Get name
     * @return {string|void} name
     */
    getName() {
        return this.name;
    }

    /**
     * Set serial number
     * @param {string} serialNum
     */
    setSerialNum(serialNum) {
        this.serialNum = serialNum;
    }

    /**
     * Get serial number
     * @return {string}
     */
    getSerialNum() {
        return this.serialNum;
    }

    /**
     * Get host address
     * @return {string} hostAddress
     */
    getHostAddress() {
        return this.getDevice().host;
    }

    /**
     * Set room name
     * @param {string} roomName
     */
    setRoomName(roomName) {
        this.roomName = roomName;
    }

    /**
     * Get room name
     * @return {string|void}
     */
    getRoomName() {
        return this.roomName;
    }

    /**
     * Set UDN (RINCON id)
     * @param {string|void} udn
     */
    setUdn(udn) {
        this.udn = udn;
    }

    /**
     * Get UDN (RINCON id)
     * @return {string|void}
     */
    getUdn() {
        return this.udn;
    }

    /**
     * Join a speaker
     * @param {string} speakerName
     * @return {Promise<boolean>} success
     */
    joinSpeaker(speakerName) {
        return new Promise(async (resolve, reject) => {
            const speaker = Sonos.get(speakerName);
            if (!speaker) {
                reject(new Error(`Unable to find speaker '${speakerName}'`));
                return;
            }

            const joinRoomName = speaker.getRoomName();

            let success;
            try {
                success = await this.getDevice().joinGroup(joinRoomName);
            } catch(error) {
                reject(error);
                return;
            }

            resolve(success);
        });
    }

    /**
     * Leave a room
     * @return {Promise<void>}
     */

    /*leaveRoom() {
        return new Promise(async (resolve, reject) => {
            try {
                await this.getDevice().leaveGroup();
            } catch(error) {
                reject(error);
                return;
            }

            resolve();
        });
    }*/

    /**
     * Start regular play
     * @return {Promise<boolean>} success
     */
    play() {
        return new Promise(async (resolve, reject) => {
            let success = true;
            try {
                await this.getDevice().play();
            } catch(error) {
                log.debug(`Play failed`);
                success = false;
            }

            resolve(success);
        });
    }

    /**
     * Start S/PDIF play
     * @return {Promise<boolean>} success
     */
    playSPDIF() {
        return new Promise(async (resolve, reject) => {
            log.debug(`PlaySPDIF`, `x-sonos-htastream:${this.getUdn()}:spdif`);

            let success = true;
            try {
                await this.getDevice().setAVTransportURI(`x-sonos-htastream:${this.getUdn()}:spdif`);
            } catch(error) {
                log.debug(`Play failed`);
                success = false;
            }

            resolve(success);
        });
    }

    /**
     * Pause when playing
     * @return {Promise<boolean>} success
     */
    pause() {
        return new Promise(async (resolve, reject) => {
            let success = true;
            try {
                await this.getDevice().pause();
            } catch(error) {
                log.debug(`Pause failed`);
                success = false;
            }

            resolve(success);
        });
    }
}

module.exports = Speaker;