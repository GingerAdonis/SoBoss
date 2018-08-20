class Utils {
    /**
     * Returns a number whose value is limited to the given range.
     *
     * Example: limit the output of this computation to between 0 and 255
     * (x * 255).clamp(0, 255)
     *
     * @param {number} value Current value
     * @param {number} min The lower boundary of the output range
     * @param {number} max The upper boundary of the output range
     * @returns {number} A number in the range [min, max]
     */
    static mathClamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
}

module.exports = Utils;