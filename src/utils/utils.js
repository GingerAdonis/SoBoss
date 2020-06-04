import log from '../log';

export default class Utils {
  /**
   * Returns a number whose value is limited to the given range.
   *
   * @example // Limit the output of this computation to between 0 and 255
   * Utils.mathClamp(x * 255, 0, 255)
   *
   * @param {number} value Current value
   * @param {number} min The lower boundary of the output range
   * @param {number} max The upper boundary of the output range
   * @returns {number} A number in the range [min, max]
   */
  static mathClamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  /**
   * Get random value between [min, max] (inclusive).
   *
   * @example // Get random value with 5 as minimum and 11 as possible maximum
   * Utils.mathRandom(5, 11)
   *
   * @param {number} min The lower boundary
   * @param {number} max The upper boundary
   * @returns {number} Random value
   */
  static mathRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  /**
   * Run async code without ever looking back.
   *
   * @param {Function} runnableFn Runnable function
   * @param {boolean} [exitOnThrow=false] Exit process on throw
   */
  static async runAsync(runnableFn, exitOnThrow = false) {
    try {
      await runnableFn();
    } catch (error) {
      if (exitOnThrow) {
        log.fatal(error);
        process.exit(1);
      } else {
        log.warn(error);
      }
    }
  }
}
