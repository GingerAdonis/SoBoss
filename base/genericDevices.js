/** @type {Map<number, GenericDevice>} */
const cachedGenericDevices = new Map();

const reloadTimeSecs = 600;
const thinkTimeMs = 500;

class GenericDevices {
    /**
     * Load generic devices
     * @return {void}
     */
    static load() {
        const GenericDevice = require('../classes/genericDevice');
        for (const deviceConfig of Config.genericDevices) {
            const deviceIdentifier = deviceConfig.identifier;

            const inCache = cachedGenericDevices.has(deviceIdentifier);
            const genericDevice = inCache ? cachedGenericDevices.get(deviceIdentifier) : new GenericDevice(deviceIdentifier);
            if (!inCache)
                cachedGenericDevices.set(deviceIdentifier, genericDevice);

            genericDevice.parseConfig(deviceConfig);
        }

        //Next reload
        setTimeout(async () => {
            try {
                await this.load();
            } catch (error) {
                log.error(error);
            }
        }, reloadTimeSecs * 1000);
    }

    /**
     * Get API app by id
     * @param {number} id
     * @return {GenericDevice} [genericDevice]
     */
    static get(id) {
        if (id)
            return cachedGenericDevices.get(id);
    }

    /**
     * Get all generic devices
     * @return {Set<GenericDevice>} genericDevices
     */
    static getAll() {
        return new Set(cachedGenericDevices.values());
    }

    /**
     * Think
     * @return {Promise<void>}
     */
    static async think() {
        const now = new Date();

        const promises = [];
        for (const genericDevice of this.getAll()) {
            promises.push(genericDevice.think(now));
        }
        await Promise.all(promises);


        setTimeout(async () => {
            try {
                await this.think();
            } catch (error) {
                log.error(error);
            }
        }, thinkTimeMs);
    }
}

/**
 * @async
 * @return {void}
 */
const init = async () => {
    GenericDevices.load();
    try {
        await GenericDevices.think();
    } catch (error) {
        log.error(error);
    }
};
init();

module.exports = GenericDevices;