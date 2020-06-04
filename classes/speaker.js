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
    async joinSpeaker(speakerName) {
        const speaker = Sonos.get(speakerName);
        if (!speaker) {
            throw new Error(`Unable to find speaker '${speakerName}'`);
        }

        const joinRoomName = speaker.getRoomName();

        return this.getDevice().joinGroup(joinRoomName);
    }

    /**
     * Leave a room
     * @return {Promise<void>}
     */
    /*async leaveRoom() {
                await this.getDevice().leaveGroup();
    }*/

    /**
     * Start regular play
     * @return {Promise<boolean>} success
     */
    async play() {
        await this.getDevice().play();
        return true;
    }

    /**
     * Start S/PDIF play
     * @return {Promise<boolean>} success
     */
    async playSPDIF() {
        log.debug(`PlaySPDIF`, `x-sonos-htastream:${this.getUdn()}:spdif`);

        await this.getDevice().setAVTransportURI(`x-sonos-htastream:${this.getUdn()}:spdif`);
        return true;
    }

    /**
     * Pause when playing
     * @return {Promise<boolean>} success
     */
    async pause() {
        await this.getDevice().pause();
        return true;
    }
}

module.exports = Speaker;