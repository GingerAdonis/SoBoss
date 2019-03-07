#!/usr/bin/env node

//Display detailed info about Unhandled Promise rejections and Uncaught Exceptions
process.on('unhandledRejection', (reason, p) => {
    if (typeof(log) !== 'undefined' && typeof(log.fatal) === 'function')
        log.fatal('Unhandled Rejection at:', p, 'reason:', reason);
    else
        console.error('Unhandled Rejection at:', p, 'reason:', reason);
});
process.on('uncaughtException', error => {
    if (typeof(log) !== 'undefined' && typeof(log.fatal) === 'function')
        log.fatal('Uncaught Exception:', error);
    else
        console.error('Uncaught Exception:', error);
});

console.log('######');
console.log('SoBoss');
console.log('######');

class App {
    static initLog() {
        const bunyan = require('bunyan');
        global.log = bunyan.createLogger({
            name: 'soboss',
            streams: [
                {
                    level: this.isDevelopment ? 'trace' : 'info',
                    stream: process.stdout
                },
                /*{
                    type: 'rotating-file',
                    path: 'logs/trace.log',
                    level: 'trace',
                    period: '1d',
                    count: 5
                },*/
                {
                    type: 'rotating-file',
                    path: 'logs/info.log',
                    level: 'info',
                    period: '1d',
                    count: 5
                },
                {
                    type: 'rotating-file',
                    path: 'logs/error.log',
                    level: 'warn',
                    period: '1d',
                    count: 5
                },
                {
                    type: 'rotating-file',
                    path: 'logs/fatal.log',
                    level: 'fatal',
                    period: '1d',
                    count: 5
                }
            ],
            src: false
            //src: this.isDevelopment
        });
    }

    static initConfig() {
        const configFile = './config/env.json';

        const fs = require('fs');
        log.info(`${!global.Config ? `Loading` : `Reloading`} configuration using file: ${fs.realpathSync(configFile)}`);

        //Clear from cache
        delete require.cache[require.resolve(configFile)];

        const env = require(configFile);

        if (typeof(env[this.env]) !== 'object') {
            log.warn('No custom environment config set!');
            global.Config = env['base'];
        } else {
            const _ = require('lodash');
            global.Config = _.defaultsDeep(_.clone(env[this.env]), env['base']);
        }

        if (!Config.configReloadTimeSeconds) {
            log.warn('No config reload time set. Reloading is disabled.');
            return;
        }

        setTimeout(() => {
            this.initConfig();
        }, Config.configReloadTimeSeconds * 1000);
    }

    /**
     * Initialize modules
     * @return {Promise<void>}
     */
    static initModules() {
        return new Promise(async (resolve, reject) => {
            global.Utils = require('./utils/utils');
            global.Events = require('./base/events');
            global.Sonos = require('./base/sonos');
            global.CommandProcessor = require('./base/commandProcessor');
            setTimeout(() => {
                global.GenericDevices = require('./base/genericDevices');

                resolve();
            }, 5000);
        });
    }

    /**
     * Init application
     * @async
     * @return {void}
     */
    static async init() {
        this.env = process.env.NODE_ENV;
        this.isDevelopment = process.env.NODE_ENV === 'development';

        this.initLog();
        this.initConfig();
        log.info(`Current environment: ${this.env} (debug: %s}`, this.isDevelopment);

        try {
            await this.initModules();
        } catch (error) {
            log.error(error);
            process.exit(1);
            return;
        }

        log.info('Application is initialized and ready for use');
    }
}

global.App = App;

App.init();