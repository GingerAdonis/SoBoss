class GenericDevice {
    /**
     * Construct generic device
     * @param {string} identifier
     */
    constructor(identifier) {
        this.setIdentifier(identifier);
    }

    /**
     * Set identifier
     * @private
     * @param {string} identifier
     */
    setIdentifier(identifier) {
        this.identifier = identifier;
    }

    /**
     * Get identifier
     * @return {string}
     */
    getIdentifier() {
        return this.identifier;
    }

    /**
     * Set host address
     * @param {String} hostAddress
     */
    setHostAddress(hostAddress) {
        this.hostAddress = hostAddress;
    }

    /**
     * Get host address
     * @return {String}
     */
    getHostAddress() {
        return this.hostAddress;
    }

    /**
     * Set ping check enabled
     * @param {boolean} enabled
     */
    setPingCheck(enabled) {
        if (!enabled) {
            delete this.pingCheck;
            return;
        }

        const PingCheck = require('./genericDevice/pingCheck');
        const pingCheck = this.pingCheck = new PingCheck(this);
    }

    /**
     * Get ping check sub class instance
     * @return {GenericDevicePingCheck} pingCheckClassInstance
     */
    getPingCheck() {
        return this.pingCheck;
    }

    /**
     * Has ping check enabled
     * @return {boolean}
     */
    hasPingCheck() {
        return typeof(this.pingCheck) === 'object';
    }

    /**
     * Parse device config
     * @param {object} config
     */
    parseConfig(config) {
        if (typeof(config.hostAddress) === 'string')
            this.setHostAddress(config.hostAddress);
        if (config.checks instanceof Array) {
            this.setPingCheck(config.checks.includes('ping'));
        }

        if (this.hasPingCheck()) {
            if (typeof(config.pingIntervalMs) === 'number')
                this.getPingCheck().setPingIntervalMs(config.pingIntervalMs);
        }
    }

    /**
     * Set next think
     * @param {Date} [date=now]
     */
    setNextThink(date) {
        if (!date)
            date = new Date();

        this.nextThink = date;
    }

    /**
     * Get next think
     * @return {Date} nextThink
     */
    getNextThink() {
        return this.nextThink;
    }

    /**
     * Think
     * @param {Date} [date=now]
     * @return {Promise<void>}
     */
    think(date) {
        return new Promise(async (resolve, reject) => {
            if (!date)
                date = new Date();

            const now = new Date();
            if (now < this.getNextThink()) {
                resolve();
                return;
            }
            this.setNextThink();

            if (this.hasPingCheck()) {
                try {
                    await this.getPingCheck().think(now);
                } catch (error) {
                    reject(error);
                    return;
                }
            }

            resolve();
        });
    }
}

module.exports = GenericDevice;