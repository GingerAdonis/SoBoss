import { format } from 'util';
import chalk from 'chalk';

const logLevelColors = {
  debug: chalk.white,
  info: chalk.blue,
  warn: chalk.keyword('orange'),
  error: chalk.keyword('red'),
  fatal: chalk.keyword('red').bold,
};

const Log = {
  debug: (...args) => {
    console.debug(logLevelColors.debug('[DEBUG]'), format(...args));
  },
  info: (...args) => {
    console.debug(logLevelColors.info('[INFO]'), format(...args));
  },
  warn: (...args) => {
    console.warn(logLevelColors.warn('[WARN]'), format(...args));
  },
  error: (...args) => {
    console.warn(logLevelColors.error('[ERROR]'), format(...args));
  },
  fatal: (...args) => {
    console.warn(logLevelColors.fatal('[FATAL]'), format(...args));
  },
};

// Display detailed info about Unhandled Promise rejections and Uncaught Exceptions
// eslint-disable-next-line no-unused-vars
process.on('unhandledRejection', (reason, promise) => {
  Log.fatal(reason ?? new Error('Unhandled Promise rejection'));
});
process.on('uncaughtException', (error) => Log.fatal(error));
process.on('multipleResolves', (type, promise, reason) => Log.error(type, promise, reason));

export default Log;
