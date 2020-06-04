class GenericDevice {
    /**
     * Construct generic device
     * @param {string} identifier
     */
    constructor(identifier) {
        this.setIdentifier(identifier);

        this.listenToEvents();

        this.eventsCommands = {};
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
        } else if (typeof (this.pingCheck) === 'object')
            return;

        const PingCheck = require('./genericDevice/pingCheck');
        this.pingCheck = new PingCheck(this);
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
        return typeof (this.pingCheck) === 'object';
    }

    /**
     * Parse device config
     * @param {object} config
     */
    parseConfig(config) {
        if (typeof (config.hostAddress) === 'string')
            this.setHostAddress(config.hostAddress);
        if (config.checks instanceof Array) {
            this.setPingCheck(config.checks.includes('ping'));
        }

        if (this.hasPingCheck()) {
            if (typeof (config.pingIntervalMs) === 'number')
                this.getPingCheck().setPingIntervalMs(config.pingIntervalMs);
        }

        this.parseConfigEvents(config);
    }

    /**
     * Parse device event config
     * @param {object} config
     */
    parseConfigEvents(config) {
        const eventNames = ['onAvailable', 'onUnavailable'];
        for (const eventName of eventNames) {
            const eventConfig = config[eventName];
            if (!(eventConfig instanceof Array))
                continue;

            this.eventsCommands[eventName] = eventConfig;
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
    async think(date = new Date()) {
        const now = new Date();
        if (now < this.getNextThink()) {
            return;
        }
        this.setNextThink();

        if (this.hasPingCheck()) {
            await this.getPingCheck().think(now);
        }
    }

    listenToEvents() {
        Events.on('deviceAvailabilityChange', async (device, available) => {
            if (device !== this)
                return;

            log.info(`Device ${this.getIdentifier()} became ${available ? 'available' : 'unavailable'}`);

            const commands = available ? this.eventsCommands['onAvailable'] : this.eventsCommands['onUnavailable'];
            if (!commands instanceof Array) {
                log.warn(`No commands to process`);
                return;
            }

            for (const command of commands) {
                try {
                    const commandProcessor = new CommandProcessor(command);
                    await commandProcessor.process();
                } catch (error) {
                    log.error(error);
                }
            }
        });
    }
}

module.exports = GenericDevice;