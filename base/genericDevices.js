/** @type {Map<number, GenericDevice>} */
const cachedGenericDevices = new Map();

const reloadTimeSecs = 600;

class GenericDevices {
    /**
     * Load generic devices
     * @return {Promise<void>}
     */
    static load() {
        return new Promise(async (resolve, reject) => {
            for (const deviceConfig of config.genericDevices) {

            }

            //Next reload
            setTimeout(async () => {
                try {
                    await this.load();
                } catch(error) {
                    log.error(error);
                }
            }, reloadTimeSecs * 1000);

            resolve();
        });
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
}

module.exports = GenericDevices;