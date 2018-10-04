class CommandProcessor {
    /**
     *
     * @param {object} config
     */
    constructor(config) {
        this.config = config;

        //Target Speakers
        const targetSpeakersIdentifiers = new Set(config.targetSpeakers instanceof Array ? config.targetSpeakers : []);
        /** @type {Map<string, Speaker>} */
        this.targetSpeakers = new Map();
        for (const identifier of targetSpeakersIdentifiers) {
            const speaker = Sonos.get(identifier);
            if (!speaker) {
                log.warn(`Command processor includes not available target speaker: ${identifier}`);
                continue;
            }

            this.targetSpeakers.set(identifier, speaker);
        }

        //Source Speakers
        const sourceSpeakersIdentifiers = new Set(config.sourceSpeakers instanceof Array ? config.sourceSpeakers : []);
        /** @type {Map<string, Speaker>} */
        this.sourceSpeakers = new Map();
        for (const identifier of sourceSpeakersIdentifiers) {
            const speaker = Sonos.get(identifier);
            if (!speaker) {
                log.warn(`Command processor includes not available source speaker: ${identifier}`);
                continue;
            }

            this.sourceSpeakers.set(identifier, speaker);
        }
    }

    /**
     * Get source speakers
     * @return {Map<string, Speaker>}
     */
    getSourceSpeakers() {
        return this.sourceSpeakers;
    }

    /**
     * Get target speakers
     * @return {Map<string, Speaker>}
     */
    getTargetSpeakers() {
        return this.targetSpeakers;
    }

    /**
     *
     * @return {Promise<void>}
     */
    process() {
        return new Promise(async (resolve, reject) => {
            try {
                for (const action in this.config) {
                    //Skip generic props
                    if (action === 'targetSpeakers' || action === 'sourceSpeakers')
                        continue;

                    const data = this.config[action];

                    switch (action) {
                        case 'setVolume':
                            await this.setVolume(data);
                            break;
                        case 'playState':
                            await this.setPlayState(data);
                            break;
                        case 'joinSpeaker':
                            await this.joinSpeaker(data);
                            break;
                        case 'leaveGroup':
                            await this.leaveGroup(data);
                            break;
                        default:
                            log.warn(`Command processor has unknown command: ${action}`);
                    }
                }
            } catch (error) {
                log.warn(`Rejecting at action processing`);
                reject(error);
            }

            resolve();
        });
    }

    /**
     * Set volume
     * @param {string|number} data
     * @return {Promise<void>}
     */
    setVolume(data) {
        return new Promise(async (resolve, reject) => {
            let volume = 0;
            if (typeof(data) === 'number') {
                volume = Utils.mathClamp(data, 0, 100);
            } else if (typeof(data) === 'string') {
                if (!this.getSourceSpeakers().size) {
                    reject(new Error(`setVolume requires source speakers`));
                    return;
                }

                //Get source values
                const promises = [];
                for (const speaker of this.getSourceSpeakers().values()) {
                    promises.push(speaker.getDevice().getVolume());
                }

                let lowestSourceVolume;
                let highestSourceVolume;

                try {
                    const volumeLevels = await Promise.all(promises);
                    lowestSourceVolume = Utils.mathClamp(Math.min(...volumeLevels), 0, 100);
                    highestSourceVolume = Utils.mathClamp(Math.max(...volumeLevels), 0, 100);
                } catch (error) {
                    log.warn(`Rejecting at getting source speaker(s) volume levels`);
                    reject(error);
                    return;
                }

                if (data === 'lowestSource') {
                    log.info(`Source speaker(s) ${Array.from(this.getSourceSpeakers().keys()).join(', ')} lowest volume is ${lowestSourceVolume}%`);
                    volume = lowestSourceVolume;
                } else if (data === 'highestSource') {
                    //You must be crazy
                    log.info(`Source speaker(s) ${Array.from(this.getTargetSpeakers().keys()).join(', ')} highest volume is ${highestSourceVolume}%`);
                    volume = highestSourceVolume;
                } else {
                    reject(new Error(`Unknown setVolume data`));
                    return;
                }
            }

            const promises = [];
            for (const speaker of this.getTargetSpeakers().values()) {
                promises.push(speaker.getDevice().setVolume(volume, 'Master'));
            }

            try {
                await Promise.all(promises);
            } catch (error) {
                log.warn(error, `At setting volume of target speakers`);
            }

            //Hard limit maximum set volume to prevent ear damage
            if (typeof(Config.sonos.maxSetVolume) === 'number')
                volume = Math.min(Config.sonos.maxSetVolume, volume);

            log.info(`Set volume of target speaker(s) ${Array.from(this.getTargetSpeakers().keys()).join(', ')} to ${volume}%`);

            resolve();
        });
    }

    /**
     * Join a speaker
     * @param {string} data
     * @return {Promise<void>}
     */
    joinSpeaker(data) {
        return new Promise(async (resolve, reject) => {
            const promises = [];

            for (const speaker of this.getTargetSpeakers().values()) {
                promises.push(speaker.joinSpeaker(data));
            }

            try {
                const speakerSuccess = await Promise.all(promises);
                if (!speakerSuccess)
                    log.warn(new Error(`Failed to join speaker ${data}`));
            } catch (error) {
                log.warn(error, `At join group`);
            }

            log.info(`Target speaker(s) ${Array.from(this.getTargetSpeakers().keys()).join(', ')} joined group ${data}`);

            resolve();
        });
    }

    /**
     * Leave Group
     * @param {any} data
     * @return {Promise<void>}
     */
    leaveGroup(data) {
        return new Promise(async (resolve, reject) => {
            const promises = [];
            for (const speaker of this.getTargetSpeakers().values()) {
                promises.push(speaker.getDevice().leaveGroup());
            }

            try {
                await Promise.all(promises);
            } catch (error) {
                log.warn(error, `At leave group`);
            }

            log.info(`Target speaker(s) ${Array.from(this.getTargetSpeakers().keys()).join(', ')} left their group`);

            resolve();
        });
    }

    /**
     * Set play state
     * @param {string} state
     * @return {Promise<void>}
     */
    setPlayState(state) {
        return new Promise(async (resolve, reject) => {
            if (!['play', 'pause', 'playSPDIF'].includes(state)) {
                reject(new Error(`Invalid play state: ${state}`));
                return;
            }

            const promises = [];
            for (const speaker of this.getTargetSpeakers().values()) {
                if (state === 'pause')
                    promises.push(speaker.pause());
                else if (state === 'play')
                    promises.push(speaker.play());
                else if (state === 'playSPDIF')
                    promises.push(speaker.playSPDIF());
            }

            try {
                await Promise.all(promises);
            } catch (error) {
                log.warn(error, `At set play state`);
            }

            log.info(`Set play state of target speaker(s) ${Array.from(this.getTargetSpeakers().keys()).join(', ')} to ${state}`);

            resolve();
        });
    }
}

module.exports = CommandProcessor;