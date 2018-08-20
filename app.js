#!/usr/bin/env node

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
        const _ = require('lodash');
        const module = './config/env.json';
        delete require.cache[require.resolve(module)];
        const env = require(module);

        if (typeof(env[this.env]) !== 'object') {
            log.warn('No custom environment config set!');
            global.Config = env['base'];
        } else
            global.Config = _.defaultsDeep(_.clone(env[this.env]), env['base']);

        if (!Config.configReloadTimeSeconds) {
            log.warn('No config reload time set. Reloading is disabled.');
            return;
        }

        setTimeout(() => {
            log.debug('Reloading server configuration');
            this.initConfig();
        }, Config.configReloadTimeSeconds * 1000);
    }

    /**
     * Initialize modules
     * @return {Promise<void>}
     */
    static initModules() {
        return new Promise(async (resolve, reject) => {
            
            resolve();
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

        //Display detailed info about Unhandled Promise rejections and Uncaught Exceptions
        process.on('unhandledRejection', (reason, p) => log.fatal('Unhandled Rejection at:', p, 'reason:', reason));
        process.on('uncaughtException', error => log.fatal('Uncaught Exception:', error));

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