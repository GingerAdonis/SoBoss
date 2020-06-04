const ping = require('ping');

class GenericDevicePingCheck {
    constructor(genericDevice) {
        this.genericDevice = genericDevice;

        this.setPingIntervalMs(Config.ping['defaultInterval']);
    }

    /**
     * Get parent generic device
     * @return {GenericDevice} genericDevice
     */
    getGenericDevice() {
        return this.genericDevice;
    }

    /**
     * Set ping interval in milliseconds
     * @param {number} pingIntervalMs
     */
    setPingIntervalMs(pingIntervalMs) {
        this.pingIntervalMs = pingIntervalMs;
    }

    /**
     * Get ping interval in milliseconds
     * @return {number} pingIntervalMs
     */
    getPingIntervalMs() {
        return this.pingIntervalMs;
    }

    /**
     * Set next check
     * @param {Date} [date]
     */
    setNextCheck(date) {
        if (!(date instanceof Date)) {
            date = new Date();
            date.setMilliseconds(date.getMilliseconds() + this.getPingIntervalMs());
        }

        this.nextCheck = date;
    }

    /**
     * Get next check
     * @return {Date} nextCheck
     */
    getNextCheck() {
        return this.nextCheck;
    }

    /**
     * Perform a ping check
     * @return {Promise<boolean>} Is online
     */
    async check() {
        const result = await ping.promise.probe(this.getGenericDevice().getHostAddress(), {
            timeout: Math.round(Config.ping['timeOutMs'] / 1000),
            packetSize: 64
        });
        return result.alive ?? false;
    }

    /**
     * Think
     * @param {Date} [date=now]
     * @return {Promise<void>}
     */
    async think(date) {
        if (!date)
            date = new Date();

        if (date < this.getNextCheck()) {
            return;
        }
        this.setNextCheck();

        let available;
        try {
            available = await this.check();
        } catch (error) {
            log.warn(error);
            available = false;
        }

        //Nothing has changed
        if (typeof (this.lastAvailability) === 'boolean' && this.lastAvailability === available) {
            return;
        }
        this.lastAvailability = available;

        log.debug(`Ping state of ${this.getGenericDevice().getIdentifier()} changed: ${available}`);

        Events.emit('deviceAvailabilityChange', this.getGenericDevice(), available);
    }
}

module.exports = GenericDevicePingCheck;