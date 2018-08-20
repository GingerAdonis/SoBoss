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

            const genericDevice = cachedGenericDevices.has(deviceIdentifier) ? cachedGenericDevices.get(deviceIdentifier) : new GenericDevice(deviceIdentifier);
            if (!cachedGenericDevices.has(deviceIdentifier))
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
    static think() {
        return new Promise(async (resolve, reject) => {
            const now = new Date();

            const promises = [];
            for (const genericDevice of this.getAll()) {
                promises.push(genericDevice.think(now));
            }
            try {
                await Promise.all(promises);
            } catch (error) {
                reject(error);
            }

            setTimeout(async () => {
                try {
                    await this.think();
                } catch (error) {
                    log.error(error);
                }
            }, thinkTimeMs);

            resolve();
        });
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
    } catch(error) {
        log.error(error);
    }
};
init();

module.exports = GenericDevices;