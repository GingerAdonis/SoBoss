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
     * Join a room
     * @param {string} roomName
     * @return {Promise<boolean>} success
     */
    /*joinRoom(roomName) {
        return new Promise(async (resolve, reject) => {
            let success;
            try {
                success = await this.getDevice().joinGroup(roomName);
            } catch(error) {
                reject(error);
                return;
            }

            resolve(success);
        });
    }*/

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
}

module.exports = Speaker;